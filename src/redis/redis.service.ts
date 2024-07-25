import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis'; 

@Injectable()
export class RedisService {
  private redis: Redis;
  private dataRedis: Redis;

  constructor(private configService: ConfigService) {
    this.redis = new Redis({
      host: this.configService.get<string>('REDIS_HOST'),
      port: this.configService.get<number>('REDIS_PORT'),
      password: this.configService.get<string>('REDIS_PASSWORD'),
    });

    this.dataRedis = new Redis({
      host: this.configService.get<string>('REDIS_HOST'),
      port: this.configService.get<number>('REDIS_PORT'),
      password: this.configService.get<string>('REDIS_PASSWORD'),
    });
  }

  async addToQueue(data: any): Promise<string> {
    const id = new Date().getTime().toString(); // Generate a unique ID
    await this.dataRedis.lpush('queue', JSON.stringify({ id, ...data }));
    return id;
  }

  async consumeFromQueue(): Promise<any> {
    const item = await this.redis.brpop('queue', 0);
    if (item) {
      return JSON.parse(item[1]);
    }
    return null;
  }

  async getFirstFromQueue(): Promise<any> {
    const item = await this.redis.lindex('queue', -1); // Get the first item without removing it
    if (item) {
      return JSON.parse(item);
    }
    return null;
  }

  async storeUser(user: any): Promise<void> {
    const userKey = `user:${user.id}`;
    const userJson = JSON.stringify(user); // Serialize the user object to JSON
    await this.dataRedis.hset(userKey, 'user', userJson);
  }

  async getUser(userId: number): Promise<any | null> {
    const userKey = `user:${userId}`;
    const userJson = await this.dataRedis.hget(userKey, 'user');
    if (userJson) {
      return JSON.parse(userJson); // Deserialize the JSON string back to an object
    }
    return null;
  }
}
