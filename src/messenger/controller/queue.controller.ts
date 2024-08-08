import { Controller, Post, Body, HttpException, HttpStatus, Get, UseGuards, Param } from '@nestjs/common';
import { RedisService } from '../../redis/redis.service';
import { PermissionsRedis } from 'src/auth/decorators/permissions-redis.decorator';
import { PermissionsRedisGuard } from 'src/auth/guards/permissions-redis.guard';

@Controller('queue')
@UseGuards(PermissionsRedisGuard)
export class QueueController {
  constructor(private readonly redisService: RedisService) {}

  @Post(':type/:channel/:instance')
  //@PermissionsRedis()
  async enqueue(
    @Param('type') type: string,
    @Param('channel') channel: string,
    @Param('instance') instance: string,
    @Body() body: any
  ): Promise<{ id: string }> {
    try {
      const id = await this.redisService.addToQueue({
        ...body,
        type,
        channel,
        instance,
      });
      return { id };
    } catch (error) {
      throw new HttpException('Failed to add to queue', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
