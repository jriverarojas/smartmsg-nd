import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { UserService } from './service/user.service';
import { AuthService } from './service/auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { UserController } from './controller/user.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from './entities/user.entity';
import { AuthController } from './controller/auth.controller';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';
import { RedisModule } from 'src/redis/redis.module';
import { EncryptionService } from './service/encryption.service';
import { LogService } from './service/log.service';
import { Log } from './entities/log.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Role, Permission, Log]),
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '3600s' }, // Token expira en 1 hora
      }),
      inject: [ConfigService],
    }),
    ConfigModule,  // Asegúrate de importar ConfigModule aquí
    RedisModule,
  ],
   
  providers: [  
    UserService, 
    AuthService, 
    LocalStrategy, 
    JwtStrategy, 
    EncryptionService, 
    LogService,
  ],
  controllers: [UserController, AuthController],
  exports: [UserService, JwtModule, TypeOrmModule, EncryptionService, LogService],

})
export class AuthModule {}
