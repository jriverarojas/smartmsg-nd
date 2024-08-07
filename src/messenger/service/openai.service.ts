import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import { Assistant } from '../entities/assistant.entity';
import { RedisService } from 'src/redis/redis.service';
import { EncryptionService } from 'src/auth/service/encryption.service';
import { AutomaticCreateMessageResponse } from 'src/common/types/automatic-create-message-response.type';
import { Run } from 'openai/resources/beta/threads/runs/runs';

@Injectable()
export class OpenaiService {
  private openai: OpenAI;

  constructor(
    private readonly redisService: RedisService,
    private readonly encryptionService: EncryptionService,  
  ) {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    
  }

  async initConversation( assistant: Assistant, channel: string, instanceId: number, message: string, origin: string): Promise<AutomaticCreateMessageResponse> {
    const decryptedConfig = this.encryptionService.decrypt(assistant.config);
    const config = JSON.parse(decryptedConfig);
    let res: string | Run;
    const run = await this.openai.beta.threads.createAndRun({
      assistant_id: config.assitantId,
      thread: {
        messages: [{ role: 'user', content: message }],
      }
    });
    console.log('run', run);
    res = await this.waitForResponse(run.thread_id, run.id);
    console.log('res', res);
    const response = await this.handleResponse(res, channel, instanceId, origin, run.thread_id, assistant.config, run.id);
    console.log('response', response);
    return {
        runId: run.id,
        threadId: run.thread_id,
        response
    }

    
  }

  async createMessage(assistant: Assistant, channel: string, instanceId: number, threadId: string, message: string, origin: string): Promise<AutomaticCreateMessageResponse> {
    const decryptedConfig = this.encryptionService.decrypt(assistant.config);
    const config = JSON.parse(decryptedConfig)
    let res: string | Run;
    await this.openai.beta.threads.messages.create(threadId, {
      role: 'user',
      content: message,
    });

    
    const run = await this.openai.beta.threads.runs.create(
        threadId,
        { assistant_id: config.assitantId }
    );
    res = await this.waitForResponse(threadId, run.id);
    const response = await this.handleResponse(res, channel, instanceId, origin, threadId, assistant.config, run.id);
    
    return {
        runId: run.id,
        threadId: threadId,
        response,
    }
  }

  async handleRequireFunction(assistantConfig: string, threadId: string, instanceId: number, channel: string, origin: string, functions:any, runId: string): Promise<AutomaticCreateMessageResponse> {
    console.log('handleRequireFunction', assistantConfig, threadId, instanceId);
    const decryptedConfig = this.encryptionService.decrypt(assistantConfig);
    const config = JSON.parse(decryptedConfig)
    let res: string | Run;

    const functionsOutput = functions.map(item => ({
      tool_call_id: item.id,
      output: item.output
    }));

    const run = await this.openai.beta.threads.runs.submitToolOutputsAndPoll(
      threadId,
      runId,
      { tool_outputs: functionsOutput },
    );
    
    res = await this.waitForResponse(threadId, run.id);
    const response = await this.handleResponse(res, channel, instanceId, origin, threadId, assistantConfig, run.id);
    
    return {
        runId: run.id,
        threadId: threadId,
        response,
    }
  }

  async handleResponse(response: string | Run, channel: string, instanceId: number, origin: string, threadId: string, assistantConfig: string, runId: string): Promise<string> {
    if (this.isRun(response)) {
      if (response.status === 'requires_action' && response.required_action && response.required_action.submit_tool_outputs 
        && response.required_action.submit_tool_outputs.tool_calls) {
        const functions = [];
        for (const toolCall of response.required_action.submit_tool_outputs.tool_calls) {
          functions.push({id:toolCall.id, name: toolCall.function.name, params:toolCall.function.arguments});
        }

        const queueId = await this.redisService.addToQueue({
          type: 'function',
          threadId,
          functions,
          instance: `${instanceId}`,
          channel,
          origin,
          firedBy: 'openai',
          runId,
          assistantConfig,
        });
        return '__running_function'
      }
    } else {
      const queueId = await this.redisService.addToQueue({
        toFrom: origin,
        message: response,
        type: 'out',
        channel,
        instance: `${instanceId}`,
      });
      return response;
    }
  }

  private async waitForResponse(threadId: string, runId: string) : Promise<string | Run> {
    
      const runStatus = await this.waitForRunCompletion(threadId, runId);
      console.log('runStatus',runStatus);
      if (runStatus === 'not_processed') {
        return 'Hay un problema al procesar su mensaje, intentelo nuevamente mas tarde'
      } else if (this.isRun(runStatus)){
        return runStatus;
      } else {
        const assistantResponse = await this.getAssistantResponse(threadId);
        return assistantResponse
      }
  }

  private async getAssistantResponse(threadId: string): Promise<string> {
    const threadMessages = await this.openai.beta.threads.messages.list(
        threadId
    );
    let lastAssistantMessage = null;

    console.log('threadMessages: ');
    console.dir(threadMessages, { depth: null, colors: true });


    for (let i = 0; i < threadMessages.data.length; i++) {
      if (threadMessages.data[i].role === 'assistant') {
        lastAssistantMessage = threadMessages.data[i];
        
        break;
      }
    }
    return lastAssistantMessage.content[0].text.value;
  }

  private async waitForRunCompletion(threadId: string, runId: string) : Promise<string|Run>  {
    let run;
    let factor = 1;
    do {
      run = await this.openai.beta.threads.runs.retrieve(threadId, runId);
      if (run.status === 'completed' || run.status === 'cancelled' || run.status === 'failed' || run.status === 'expired' || run.status === 'requires_action') {
        break;
      }
      await new Promise(resolve => setTimeout(resolve, 500 * factor));
      factor = factor * 1.2;
    } while ((run.status === 'queued' || run.status === 'in_progress') && factor < 3);
    if (run.status === 'requires_action') {
      return run;
    }
    return (run.status === 'queued' || run.status === 'in_progress') ? 'not_processed' : run.status;
  }

  private isRun(obj: any): obj is Run {
    return (
      obj &&
      typeof obj === 'object' &&
      typeof obj.id === 'string' &&
      typeof obj.status === 'string'
    );
  }
}
