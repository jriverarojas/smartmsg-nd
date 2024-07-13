import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  const serviceType = configService.get<string>('SERVICE_TYPE');

  if (serviceType === 'worker') {
    app.connectMicroservice<MicroserviceOptions>({
      transport: Transport.REDIS,
      options: {
        url: `redis://${configService.get('REDIS_HOST')}:${configService.get('REDIS_PORT')}`,
      },
    });

    await app.startAllMicroservicesAsync();
    console.log('Worker is listening');
  } else {
    await app.listen(3000);
    console.log('API is listening on port 3000');
  }
}

bootstrap();

