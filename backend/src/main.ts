import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.useGlobalFilters(new AllExceptionsFilter());

  app.enableCors();

  const frontendPath = join(__dirname, '..', '..', 'frontend', 'dist');

  app.useStaticAssets(frontendPath);

  app.use('*', (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (!req.originalUrl.startsWith('/auth') &&
        !req.originalUrl.startsWith('/users') &&
        !req.originalUrl.startsWith('/polls') &&
        !req.originalUrl.startsWith('/socket.io')) {
      res.sendFile(join(frontendPath, 'index.html'));
    } else {
      next();
    }
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
}
bootstrap();
