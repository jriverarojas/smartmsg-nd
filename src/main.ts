import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { ValidationPipe, BadRequestException } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    exceptionFactory: (errors) => {
      const detailedErrors = errors.map(error => ({
        property: error.property,
        value: error.value,
        constraints: error.constraints,
        children: error.children ? error.children.map(child => ({
          property: child.property,
          value: child.value,
          constraints: child.constraints,
        })) : [],
      }));
      return new BadRequestException(detailedErrors);
    }
  }));
  const configService = app.get(ConfigService);

  // Use global exception filter
  app.useGlobalFilters(new AllExceptionsFilter());
  
  const redisHost = configService.get<string>('REDIS_HOST');
  const redisPort = configService.get<number>('REDIS_PORT');
  const redisPassword = configService.get<string>('REDIS_PASSWORD')
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.REDIS,
    options: {
      host: redisHost,
      port: redisPort,
      password: redisPassword
    },
  });

  await app.startAllMicroservices();
  

  const port = configService.get<number>('APP_PORT') || 3000;
  await app.listen(port);
  console.log(`Application is running on: ${await app.getUrl()}`);
  
}

bootstrap();

