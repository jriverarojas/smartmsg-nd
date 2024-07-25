import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  const serviceType = configService.get<string>('SERVICE_TYPE');
  

  //if (serviceType === 'worker') {
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
    console.log('Worker is listening');
  //} else {
    const port = configService.get<number>('APP_PORT') || 3000;
    await app.listen(port);
    console.log(`Application is running on: ${await app.getUrl()}`);
  //}
}

bootstrap();

