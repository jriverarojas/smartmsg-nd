import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { UserService } from './user.service';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { UserController } from './user.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from './entities/user.entity';
import { AuthController } from './auth.controller';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';
import { RedisModule } from 'src/redis/redis.module';
import { EncryptionService } from './encryption.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Role, Permission]),
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
   
  providers: [UserService, AuthService, LocalStrategy, JwtStrategy, EncryptionService],
  controllers: [UserController, AuthController],
  exports: [UserService, JwtModule, TypeOrmModule, EncryptionService],

})
export class AuthModule {}
