import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { PERMISSIONS_REDIS_KEY } from '../decorators/permissions-redis.decorator';
import { RedisService } from 'src/redis/redis.service';

@Injectable()
export class PermissionsRedisGuard implements CanActivate {
  constructor(
    private reflector: Reflector, 
    private jwtService: JwtService,
    private redisService: RedisService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    
    const permissions = this.reflector.get<string[]>(PERMISSIONS_REDIS_KEY, context.getHandler());
    if (!permissions) {
      return true;
    }
    
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('Authorization header not found');
    }
    
    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new UnauthorizedException('Token not found');
    }
   
    const decoded = this.jwtService.verify(token);
    const user = await this.redisService.getUser(decoded.sub);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return true;
  }
}
