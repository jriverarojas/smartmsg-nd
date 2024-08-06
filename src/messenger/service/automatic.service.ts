import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Queue } from '../entities/queue.entity';
import { Channel } from '../entities/channel.entity';
import { Assistant } from '../entities/assistant.entity';
import { OpenaiService } from './openai.service';
import { AutomaticCreateMessageResponse } from 'src/common/types/automatic-create-message-response.type';

@Injectable()
export class AutomaticService {
  constructor(
    @InjectRepository(Queue) private readonly queueRepository: Repository<Queue>,
    @InjectRepository(Channel) private readonly channelRepository: Repository<Channel>,
    private readonly openaiservice: OpenaiService,
  ) {}


  async initConversation(assistant: Assistant, channel: string, instanceId: number, message: string, origin: string): Promise<AutomaticCreateMessageResponse> {
    let res:AutomaticCreateMessageResponse;
    switch (assistant.type) {
        case 'openai':
          res = await this.openaiservice.initConversation(assistant, channel, instanceId, message, origin);
          break;
        // Add other cases for different services
        default:
          throw new Error(`Service ${assistant.type} not found`);
    }
    return res;
  }

  async createMessage(assistant: Assistant, channel: string, instanceId: number, threadId: string, message: string, origin: string): Promise<AutomaticCreateMessageResponse> {
    let res:AutomaticCreateMessageResponse;
    switch (assistant.type) {
        case 'openai':
          res = await this.openaiservice.createMessage(assistant, channel, instanceId, threadId, message, origin);
          break;
        // Add other cases for different services
        default:
          throw new Error(`Service ${assistant.type} not found`);
    }
    return res;
  }

  async handleRequireFunction(type: string, assistantConfig: string, threadId: string, instanceId: number, channel: string, origin: string, functions: any, runId: string) {
    switch (type) {
        case 'openai':
          await this.openaiservice.handleRequireFunction(assistantConfig, threadId, instanceId, channel, origin, functions, runId);
          break;
        // Add other cases for different services
        default:
          throw new Error(`Function ${type} not found`);
    }
  }

 
}
