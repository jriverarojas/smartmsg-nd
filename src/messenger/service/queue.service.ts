import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Queue } from '../entities/queue.entity';
import { Channel } from '../entities/channel.entity';
import { WaapiService } from './waapi-service';
import { EncryptionService } from '../../auth/service/encryption.service';

@Injectable()
export class QueueService {
  constructor(
    @InjectRepository(Queue) private readonly queueRepository: Repository<Queue>,
    @InjectRepository(Channel) private readonly channelRepository: Repository<Channel>,
    private readonly encryptionService: EncryptionService,
    private readonly waapiService: WaapiService,
  ) {}


  async processTask(task: any): Promise<void> {
    const taskPayload = JSON.stringify(task);

    let myQueue = await this.queueRepository.create({ redisId:task.id, payload: taskPayload, status: 'PENDING' });
    myQueue = await this.queueRepository.save(myQueue);

    // Find the channel
    const channel = await this.channelRepository.findOne({ where: { code: task.channel } });

    if (!channel) {
      myQueue.errorReason = `Channel ${task.channel} not found`;
      myQueue.status = 'ERROR';
      await this.queueRepository.save(myQueue);
      return;
    }

    // Decrypt the channel config
    const decryptedConfig = this.encryptionService.decrypt(channel.config);
    try {
      // Dynamically load and call the service
      await this.execute(channel.service, JSON.parse(decryptedConfig), task);
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

  private async  execute(serviceName: string, config: any, taskPayload: any): Promise<void> {
    // Dynamically load and return the service
    switch (serviceName) {
      case 'waapi':
        await this.waapiService.execute(config, taskPayload);
        break;
      // Add other cases for different services
      default:
        throw new Error(`Service ${serviceName} not found`);
    }
  }
}
