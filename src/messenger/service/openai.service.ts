import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import { Assistant } from '../entities/assistant.entity';
import { RedisService } from 'src/redis/redis.service';
import { EncryptionService } from 'src/auth/service/encryption.service';
import { AutomaticCreateMessageResponse } from 'src/common/types/automatic-create-message-response.type';

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
    const config = JSON.parse(decryptedConfig)
    const run = await this.openai.beta.threads.createAndRun({
      assistant_id: config.assitantId,
      thread: {
        messages: [{ role: 'user', content: message }],
      }
    });

    const response = await this.waitForResponse(run.thread_id, run.id);
    
    const queueId = await this.redisService.addToQueue({
        toFrom: origin,
        message: response,
        type: 'out',
        channel,
        instance: `${instanceId}`,
    });

    return {
        runId: run.id,
        threadId: run.thread_id,
        response
    }

    
  }

  async createMessage(assistant: Assistant, channel: string, instanceId: number, threadId: string, message: string, origin: string): Promise<AutomaticCreateMessageResponse> {
    const decryptedConfig = this.encryptionService.decrypt(assistant.config);
    const config = JSON.parse(decryptedConfig)
    let res = ''
    await this.openai.beta.threads.messages.create(threadId, {
      role: 'user',
      content: message,
    });

    
    const run = await this.openai.beta.threads.runs.create(
        threadId,
        { assistant_id: config.assitantId }
    );
    res = await this.waitForResponse(threadId, run.id);

    const queueId = await this.redisService.addToQueue({
        toFrom: origin,
        message: res,
        type: 'out',
        channel,
        instance: `${instanceId}`,
    });
    
    return {
        runId: run.id,
        threadId: threadId,
        response: res
    }
  }

  private async waitForResponse(threadId: string, runId: string) : Promise<string> {
    
      const runStatus = await this.waitForRunCompletion(threadId, runId);

      if (runStatus === 'not_processed') {
        return 'Hay un problema al procesar su mensaje, intentelo nuevamente mas tarde'
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

    for (let i = threadMessages.data.length - 1; i >= 0; i--) {
      if (threadMessages.data[i].role === 'assistant') {
        lastAssistantMessage = threadMessages.data[i];
        break;
      }
    }
    return lastAssistantMessage.content.text.value;
  }

  private async waitForRunCompletion(threadId: string, runId: string) : Promise<string>  {
    let run;
    let factor = 1;
    do {
      run = await this.openai.beta.threads.runs.retrieve(threadId, runId);
      if (run.status === 'completed' || run.status === 'cancelled' || run.status === 'failed' || run.status === 'expired' || run.status === 'requires_action') {
        break;
      }
      await new Promise(resolve => setTimeout(resolve, 1000 * factor));
      factor = factor * 1.2;
    } while ((run.status === 'queued' || run.status === 'in_progress') && factor < 3);
    return (run.status === 'queued' || run.status === 'in_progress') ? 'not_processed' : run.status;
  }

  private async callFunction(message: string) {
    return `Function called with message: ${message}`;
  }
}
