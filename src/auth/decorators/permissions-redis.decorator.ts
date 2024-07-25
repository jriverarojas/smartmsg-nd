import { SetMetadata } from '@nestjs/common';

export const PERMISSIONS_REDIS_KEY = 'permissions-redis';
export const PermissionsRedis = (...permissions: string[]) => SetMetadata(PERMISSIONS_REDIS_KEY, permissions);
