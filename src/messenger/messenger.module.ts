import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChannelService } from './channel.service';
import { ChannelController } from './channel.controller';
import { ThreadController } from './thread.controller';
import { ThreadService } from './thread.service';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';
import { MessageController } from './message.controller';
import { MessageService } from './message.service';
import { AssistantController } from './assistant.controller';
import { AssistantService } from './assistant.service';
import { RedisService } from '../redis/redis.service';
import { QueueController } from './queue.controller';

import { Channel } from './entities/channel.entity';
import { Thread } from './entities/thread.entity';
import { Category } from './entities/category.entity';
import { Message } from './entities/message.entity';
import { Assistant } from './entities/assistant.entity';

import { AuthModule } from 'src/auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { RedisModule } from 'src/redis/redis.module';
import { WorkerService } from './worker.service';
import { Instance } from './entities/instance.entity';
import { Queue } from './entities/queue.entity';
import { QueueService } from './queue.service';
import { WaapiService } from './waapi-service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Channel, Thread, Category, Message, Assistant,Instance, Queue]),
    AuthModule,
    RedisModule,
    ConfigModule,
  ],
  controllers: [ChannelController, CategoryController, ThreadController, MessageController, AssistantController, QueueController],
  providers: [ChannelService, CategoryService, ThreadService, MessageService, AssistantService, RedisService, WorkerService, QueueService, WaapiService],
})
export class MessengerModule {}
