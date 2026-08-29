import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );
  
  // Enable CORS for Expo / React Native
  app.enableCors();

  // Bind explicitly to 0.0.0.0 to accept LAN connections
  const port = process.env.PORT || 5000;
  await app.listen(port, '0.0.0.0');
  console.log(`Application running on http://0.0.0.0:${port}`);
}
bootstrap();
