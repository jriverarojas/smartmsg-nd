import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, MoreThan, Repository } from 'typeorm';
import axios from 'axios';
import { Instance } from '../entities/instance.entity';
import { Thread } from '../entities/thread.entity';
import { Message } from '../entities/message.entity';
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
    

    if (taskPayload.type === 'out') {
      this.validateOutgoing(taskPayload, config);
      await this.handleOutgoingMessage(config, taskPayload);
    } else {
      this.validateIncoming(taskPayload, config);
      await this.handleIncomingMessage(config, taskPayload);
    }
  }

  private validateOutgoing(taskPayload: any, config: any): void {
    if (typeof taskPayload.toFrom !== 'string' ||
        typeof taskPayload.message !== 'string' ||
        typeof taskPayload.instance !== 'string' ||
        !['out'].includes(taskPayload.type) ||
        !this.isValidUrl(config.sendUrl) ||
        typeof config.apiKey !== 'string') {
      throw new Error('Invalid task payload or config');
    }
  }

  private validateIncoming(taskPayload: any, config: any): void {
    if (typeof taskPayload.data.message.from !== 'string' ||
        typeof taskPayload.data.message.to !== 'string' ||
        typeof taskPayload.data.message.body !== 'string' ||
        typeof taskPayload.instance !== 'string' ||
        !['in'].includes(taskPayload.type) 
        ) {
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
      console.log(thread);


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
      console.log('INCOMING');

      const now = new Date(new Date().toISOString());
      let thread = await queryRunner.manager.findOne(Thread, {
        where: {
          instanceId: instance.id,
          externalInstance: from,
          expirationDate: MoreThan(now),
        },
      });

      if (thread) {
        thread.expirationDate = new Date(now.getTime() + 30 * 60000);
        await queryRunner.manager.save(thread);
      } else {
        thread = queryRunner.manager.create(Thread, {
          instance: instance,
          externalInstance: from,
          expirationDate: new Date(now.getTime() + 30 * 60000),
        });
        await queryRunner.manager.save(thread);
      }
      
      const message = queryRunner.manager.create(Message, {
        thread: thread,
        message: taskPayload.message,
        dateCreated: new Date(),
        //runId: taskPayload.runId,
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
