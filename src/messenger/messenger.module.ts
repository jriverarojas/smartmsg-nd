import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChannelService } from './service/channel.service';
import { ChannelController } from './controller/channel.controller';
import { ThreadController } from './controller/thread.controller';
import { ThreadService } from './service/thread.service';
import { CategoryController } from './controller/category.controller';
import { CategoryService } from './service/category.service';
import { MessageController } from './controller/message.controller';
import { MessageService } from './service/message.service';
import { AssistantController } from './controller/assistant.controller';
import { AssistantService } from './service/assistant.service';
import { RedisService } from '../redis/redis.service';
import { QueueController } from './controller/queue.controller';

import { Channel } from './entities/channel.entity';
import { Thread } from './entities/thread.entity';
import { Category } from './entities/category.entity';
import { Message } from './entities/message.entity';
import { Assistant } from './entities/assistant.entity';

import { AuthModule } from 'src/auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { RedisModule } from 'src/redis/redis.module';
import { WorkerService } from './service/worker.service';
import { Instance } from './entities/instance.entity';
import { Queue } from './entities/queue.entity';
import { QueueService } from './service/queue.service';
import { WaapiService } from './service/waapi-service';
import { InstanceAssistant } from './entities/instance-assistant.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Channel, Thread, Category, Message, Assistant,Instance, Queue, InstanceAssistant]),
    AuthModule,
    RedisModule,
    ConfigModule,
  ],
  controllers: [ChannelController, CategoryController, ThreadController, MessageController, AssistantController, QueueController],
  providers: [ChannelService, CategoryService, ThreadService, MessageService, AssistantService, RedisService, WorkerService, QueueService, WaapiService],
})
export class MessengerModule {}
