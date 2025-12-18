import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { JwtAuthGuard } from './auth/jwt-auth.guard';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const FRONT_PORT = process.env.FRONT_PORT || '3000';
  const FRONTEND_URL = process.env.FRONTEND_URL;

  app.enableCors({
    origin: [
      `http://localhost:${FRONT_PORT}`, // desarrollo
      `${FRONTEND_URL}`, // producción
      /\.vercel\.app$/
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    exposedHeaders: ['Content-Disposition', 'Content-Length'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
/*       whitelist: true, // Remueve propiedades no definidas en el DTO
      forbidNonWhitelisted: true, // Lanza error si hay propiedades extras
      transform: true, // Transforma tipos automáticamente
      transformOptions: {
        enableImplicitConversion: true,
      }, */
    })
  );
  const reflector = app.get(Reflector);
  app.useGlobalGuards(new JwtAuthGuard(reflector));
  const port = process.env.PORT || 3001;
  await app.listen(port, '0.0.0.0');

  console.log(`Servidor corriendo en el puerto ${port}`);
}
bootstrap();
