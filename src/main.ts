import { NestFactory } from '@nestjs/core';
import { App } from './modules/app';

async function bootstrap() {
  const app = await NestFactory.create(App);

  if (process.env.NODE_ENV === 'development') app.enableCors({
    allowedHeaders:
      'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept, Observe',
    methods: 'GET,PUT,POST,DELETE,UPDATE,OPTIONS',
    credentials: true,
  });

  await app.listen(process.env.PORT || 3000);
}
bootstrap();
