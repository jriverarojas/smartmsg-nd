import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, MoreThan, Repository } from 'typeorm';
import axios from 'axios';
import { Instance } from './entities/instance.entity';
import { Thread } from './entities/thread.entity';
import { Message } from './entities/message.entity';
//import { Transaction } from '../common/transaction.decorator';
//import { QueryRunner } from 'typeorm';

@Injectable()
export class WaapiService {
  constructor(
    @InjectRepository(Instance) private readonly instanceRepository: Repository<Instance>,
    @InjectRepository(Thread) private readonly threadRepository: Repository<Thread>,
    @InjectRepository(Message) private readonly messageRepository: Repository<Message>,
    private readonly dataSource: DataSource
  ) {}

  async execute(config: any, taskPayload: any): Promise<void> {
    this.validate(taskPayload, config);

    if (taskPayload.type === 'out') {
      await this.handleOutgoingMessage(config, taskPayload);
    } else {
      // Handle other types if necessary
    }
  }

  private validate(taskPayload: any, config: any): void {
    if (typeof taskPayload.toFrom !== 'string' ||
        typeof taskPayload.message !== 'string' ||
        typeof taskPayload.instance !== 'string' ||
        !['in', 'out'].includes(taskPayload.type) ||
        !this.isValidUrl(config.sendUrl) ||
        typeof config.apiKey !== 'string') {
      throw new Error('Invalid task payload or config');
    }
  }

  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
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
}
