import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, MoreThan, Repository } from 'typeorm';
import { Instance } from '../entities/instance.entity';
import { Thread } from '../entities/thread.entity';
import { Message } from '../entities/message.entity';
import { validateOrReject } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { MessageDto } from '../dto/web/message.dto';
import { AssistantService } from './assistant.service';
import { RedisService } from 'src/redis/redis.service';
import { AutomaticService } from './automatic.service';
import { AutomaticCreateMessageResponse } from 'src/common/types/automatic-create-message-response.type';

@Injectable()
export class WebService {
  constructor(
    @InjectRepository(Instance) private readonly instanceRepository: Repository<Instance>,
    @InjectRepository(Thread) private readonly threadRepository: Repository<Thread>,
    @InjectRepository(Message) private readonly messageRepository: Repository<Message>,
    private readonly dataSource: DataSource,
    private readonly assistantService: AssistantService,
    private readonly redisService: RedisService,
    private readonly automaticService: AutomaticService,
  ) {}

  async execute(config: any, taskPayload: any): Promise<void> {
    const messageDto = plainToInstance(MessageDto, taskPayload);
    await this.validateDto(messageDto);
    if (taskPayload.type === 'out') {
      await this.handleOutgoingMessage(taskPayload);
    } else {
      await this.handleIncomingMessage(taskPayload);
    }
  }

  private async validateDto(dto: any): Promise<void> {
    try {
      await validateOrReject(dto);
    } catch (errors) {
      throw new BadRequestException(errors);
    }
  }

  private async findOrCreateThread(queryRunner: any, instance: Instance, externalInstance: string): Promise<any> {
    const now = new Date(new Date().toISOString());
    let isNewThread = true;
    let thread = await queryRunner.manager.findOne(Thread, {
      where: {
        instanceId: instance.id,
        externalInstance,
        expirationDate: MoreThan(now),
      },
    });

    if (thread) {
      thread.expirationDate = new Date(now.getTime() + 30 * 60000);
      await queryRunner.manager.save(thread);
      isNewThread = false;
    } else {
      thread = queryRunner.manager.create(Thread, {
        instance,
        externalInstance,
        expirationDate: new Date(now.getTime() + 30 * 60000),
      });
      await queryRunner.manager.save(thread);
    }

    return { isNewThread, thread };
  }

  private async handleOutgoingMessage(taskPayload: any): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const instance = await queryRunner.manager.findOne(Instance, { where: { id: taskPayload.instance } });
      if (!instance) {
        throw new Error(`Instance with ID ${taskPayload.instance} not found`);
      }

      const { thread } = await this.findOrCreateThread(queryRunner, instance, taskPayload.toFrom);

      const message = queryRunner.manager.create(Message, {
        thread,
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

  private async handleIncomingMessage(taskPayload: any): Promise<void> {
    const from = taskPayload.data.message.from.split('@')[0];
    const queryRunner = this.dataSource.createQueryRunner();
    let automaticRes : AutomaticCreateMessageResponse;
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const instance = await queryRunner.manager.findOne(Instance, { where: { number: taskPayload.instance } });
      if (!instance) {
        throw new Error(`Instance with ID ${taskPayload.instance} not found`);
      }

      const { isNewThread, thread } = await this.findOrCreateThread(queryRunner, instance, taskPayload.toFrom);
      let assistant = await this.assistantService.getAssistant(instance.id, null);

      if (!assistant) {
        const queueId = await this.redisService.addToQueue({
          toFrom: taskPayload.toFrom,
          message: 'No tenemos agentes para atenderte en este momento, porfavor intenta más tarde',
          type: 'out',
          channel: 'web',
          instance: `${instance.id}`,
        });
        
      } else {
        thread.assistants = [assistant];
        await queryRunner.manager.save(thread);
        if (assistant.isAutomatic) {
          if (isNewThread) {
            automaticRes = await this.automaticService.initConversation(assistant, 'web', instance.id, taskPayload.data.message.body, taskPayload.toFrom);
            thread.externalId = automaticRes.threadId;
            await queryRunner.manager.save(thread);
          } else {
            automaticRes = await this.automaticService.createMessage(assistant, 'web', instance.id, thread.externalId, taskPayload.data.message.body, taskPayload.toFrom);
          }
        }
      }

      const message = queryRunner.manager.create(Message, {
        thread,
        message: taskPayload.data.message.body,
        dateCreated: new Date(),
        status: 'done',
        queueId: taskPayload.id,
        type: 'incoming',
        refId: taskPayload.refId,
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
