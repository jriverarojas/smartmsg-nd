import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Queue } from '../entities/queue.entity';
import { Channel } from '../entities/channel.entity';
import { Function } from '../entities/function.entity';
import { WaapiService } from './waapi.service';
import { FunctionService } from './function.service';
import { EncryptionService } from '../../auth/service/encryption.service';

@Injectable()
export class QueueService {
  constructor(
    @InjectRepository(Queue) private readonly queueRepository: Repository<Queue>,
    @InjectRepository(Channel) private readonly channelRepository: Repository<Channel>,
    @InjectRepository(Function) private readonly functionRepository: Repository<Function>,
    private readonly encryptionService: EncryptionService,
    private readonly waapiService: WaapiService,
    private readonly functionService: FunctionService,
  ) {}


  async processTask(task: any): Promise<void> {
    const taskPayload = JSON.stringify(task);

    let myQueue = await this.queueRepository.create({ redisId:task.id, payload: taskPayload, status: 'PENDING' });
    myQueue = await this.queueRepository.save(myQueue);

    let channel: Channel;
    let myFunctions: Function[] = [];
    let decryptedConfig: string;
    // Find the channel
    channel = await this.channelRepository.findOne({ where: { code: task.channel } });
    decryptedConfig = this.encryptionService.decrypt(channel.config);
    if (!channel) {
      myQueue.errorReason = `Channel ${task.channel} not found`;
      myQueue.status = 'ERROR';
      await this.queueRepository.save(myQueue);
      return;
    }
    if (task.type === 'function') {
      for (const f of task.functions) {
        const myFunction = await this.functionRepository.findOne({ where: { name: task.functionName, assistantId: task.assistant } });
        if (!myFunction) {
          myQueue.errorReason = `Function ${task.functionName} not found`;
          myQueue.status = 'ERROR';
          await this.queueRepository.save(myQueue);
          return;
        }
        myFunctions.push(myFunction);
      }
    }

    try {
      // Dynamically load and call the service
      await this.execute(channel.service || 'function', decryptedConfig ? JSON.parse(decryptedConfig) : myFunctions, task);
    } catch(error) {
      //console.log(error);
      myQueue.errorReason = error.message;
      myQueue.status = 'ERROR';
      await this.queueRepository.save(myQueue);
      return;
    }
    
    myQueue.status = 'PROCESSED';
    await this.queueRepository.save(myQueue);
    
  }

  private async  execute(serviceName: string, configOrFunction: any, taskPayload: any): Promise<void> {
    // Dynamically load and return the service
    switch (serviceName) {
      case 'waapi':
        await this.waapiService.execute(configOrFunction, taskPayload);
        break;
      case 'function':
        await this.functionService.execute(configOrFunction, taskPayload);
        break;
      // Add other cases for different services
      default:
        throw new Error(`Service ${serviceName} not found`);
    }
  }
}
