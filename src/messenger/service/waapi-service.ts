import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, MoreThan, Repository } from 'typeorm';
import axios from 'axios';
import { Instance } from '../entities/instance.entity';
import { Thread } from '../entities/thread.entity';
import { Message } from '../entities/message.entity';
import { validateOrReject, ValidationOptions } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { OutgoingMessageDto } from '../dto/waapi/outgoing-message.dto';
import { IncomingMessageDto } from '../dto/waapi/incoming-message.dto';
import { AssistantService } from './assistant.service';
import { RedisService } from 'src/redis/redis.service';

@Injectable()
export class WaapiService {
  constructor(
    @InjectRepository(Instance) private readonly instanceRepository: Repository<Instance>,
    @InjectRepository(Thread) private readonly threadRepository: Repository<Thread>,
    @InjectRepository(Message) private readonly messageRepository: Repository<Message>,
    private readonly dataSource: DataSource,
    private readonly assistantService: AssistantService,
    private readonly redisService: RedisService,
  ) {}

  async execute(config: any, taskPayload: any): Promise<void> {
    if (taskPayload.type === 'out') {
      const outgoingMessageDto = plainToInstance(OutgoingMessageDto, { ...taskPayload, sendUrl: config.sendUrl, apiKey: config.apiKey });
      await this.validateDto(outgoingMessageDto);
      await this.handleOutgoingMessage(config, taskPayload);
    } else {
      const incomingMessageDto = plainToInstance(IncomingMessageDto, taskPayload);
      await this.validateDto(incomingMessageDto);
      await this.handleIncomingMessage(config, taskPayload);
    }
  }

  

  private async validateDto(dto: any): Promise<void> {
    // Define the options for validation
    
    try {
      await validateOrReject(dto);
    } catch (errors) {
      console.dir(errors, { depth: null, colors: true });
      throw new BadRequestException(errors);
    }
  }
  private async handleOutgoingMessage(config: any, taskPayload: any): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const instance = await queryRunner.manager.findOne(Instance, { where: { id: taskPayload.instance } });
      if (!instance) {
        throw new Error(`Instance with ID ${taskPayload.instance} not found`);
      }

      const externalId = instance.externalId;
      const response = await axios.post(
        `${config.sendUrl}/instances/${externalId}/client/action/send-message`,
        {
          chatId: `${taskPayload.toFrom}@c.us`,
          message: taskPayload.message,
        },
        {
          headers: { Authorization: `Bearer ${config.apiKey}` },
        }
      );
      

      if (![200, 201].includes(response.status)) {
        throw new Error('Failed to send message');
      }

      const now = new Date(new Date().toISOString());
      let thread = await queryRunner.manager.findOne(Thread, {
        where: {
          instanceId: instance.id,
          externalInstance: taskPayload.toFrom,
          expirationDate: MoreThan(now),
        },
      });

      if (thread) {
        thread.expirationDate = new Date(now.getTime() + 30 * 60000);
        await queryRunner.manager.save(thread);
      } else {
        thread = queryRunner.manager.create(Thread, {
          instance: instance,
          externalInstance: taskPayload.toFrom,
          expirationDate: new Date(now.getTime() + 30 * 60000),
        });
        await queryRunner.manager.save(thread);
      }

      const message = queryRunner.manager.create(Message, {
        thread: thread,
        message: taskPayload.message,
        dateCreated: new Date(),
        runId: taskPayload.runId,
        status: 'done',
        queueId: taskPayload.id,
        type: 'outgoing',
      });
      await queryRunner.manager.save(message);

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private async handleIncomingMessage(config: any, taskPayload: any): Promise<void> {

    const instanceNumber = taskPayload.data.message.to.split('@')[0];
    const from = taskPayload.data.message.from.split('@')[0];
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const instance = await queryRunner.manager.findOne(Instance, { where: { number: instanceNumber } });
      if (!instance) {
        throw new Error(`Instance with ID ${taskPayload.instance} not found`);
      }
      
      const now = new Date(new Date().toISOString());
      let thread = await queryRunner.manager.findOne(Thread, {
        where: {
          instanceId: instance.id,
          externalInstance: from,
          expirationDate: MoreThan(now),
        },
      });
      let assistant;
      if (thread) {
        
        thread.expirationDate = new Date(now.getTime() + 30 * 60000);
        await queryRunner.manager.save(thread);
      } else {
        assistant = this.assistantService.getAssistant(instance.id, null);

        const queueId = await this.redisService.addToQueue({
          toFrom: from,
          message: 'No tenemos agentes para atenderte en este momento, porfavor intenta mas tarde', 
          type: 'out',
          channel: 'waapi',
          instance: instance.id,
        });

        thread = queryRunner.manager.create(Thread, {
          instance: instance,
          externalInstance: from,
          assistants:[assistant],
          expirationDate: new Date(now.getTime() + 30 * 60000),
        });
        await queryRunner.manager.save(thread);
      }
      
      const message = queryRunner.manager.create(Message, {
        thread: thread,
        message: taskPayload.data.message.body,
        dateCreated: new Date(),
        //runId: taskPayload.runId,
        status: 'done',
        queueId: taskPayload.id,
        type: 'incoming',
      });
      await queryRunner.manager.save(message);

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
