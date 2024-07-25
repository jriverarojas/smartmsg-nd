import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { UserService } from '../user.service'
import { Role } from '../entities/role.entity';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector, 
    private usersService: UserService, 
    private jwtService: JwtService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const permissions = this.reflector.get<string[]>(PERMISSIONS_KEY, context.getHandler());
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
    const user = await this.usersService.findOne(decoded.sub);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return this.matchPermissions(permissions, user.roles);
  }

  private matchPermissions(requiredPermissions: string[], userRoles: Role[]): boolean {
    for (const role of userRoles) {
      if (role.name === 'admin') {
        return true;
      }
      for (const permission of role.permissions) {
        if (requiredPermissions.includes(permission.name)) {
          return true;
        }
      }
    }
    return false;
  }
}
