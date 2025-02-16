import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { ValidationPipe, BadRequestException } from '@nestjs/common';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  //DTOS validation

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
  
  /*const redisHost = configService.get<string>('REDIS_HOST');
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

  await app.startAllMicroservices();*/
  
  const corsOptions: CorsOptions = {
    origin: ['http://localhost:9000'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    allowedHeaders: 'Content-Type, Authorization',
  };

  app.enableCors(corsOptions);
  const port = configService.get<number>('APP_PORT') || 3000;
  await app.listen(port);
  console.log(`Application is running on: ${await app.getUrl()}`);
  
}

bootstrap();

