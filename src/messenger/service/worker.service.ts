import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { RedisService } from '../../redis/redis.service';
import { QueueService } from './queue.service';

@Injectable()
export class WorkerService implements OnModuleInit, OnModuleDestroy {
  private isRunning: boolean = true;

  constructor(
    private readonly redisService: RedisService,
    private readonly queueService: QueueService,
  ) {}

  async onModuleInit() {
    this.startProcessing();
  }

  async onModuleDestroy() {
    this.isRunning = false;
  }

  async startProcessing() {
    console.log('Worker is listening');
    while (this.isRunning) {
      const task = await this.redisService.consumeFromQueue();
      if (task) {
        try {
          // Process the task
          await this.queueService.processTask(task);
          // Implement your task processing logic here
        } catch (error) {
          console.error('Failed to process task:', task, error);
          // Optionally requeue the task or handle the failure
        }
      } else {
        // No task to process, wait for a short time before trying again
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
  }
}
