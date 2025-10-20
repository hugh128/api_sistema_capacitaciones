import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { JwtAuthGuard } from './auth/jwt-auth.guard';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const FRONT_PORT = process.env.FRONT_PORT || '3000';

  app.enableCors({
    origin: `http://localhost:${FRONT_PORT}`,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  app.useGlobalPipes(new ValidationPipe());
  const reflector = app.get(Reflector);
  app.useGlobalGuards(new JwtAuthGuard(reflector));
  const port = process.env.PORT || 3001;
  await app.listen(port);

  console.log(`Servidor corriendo en el puerto ${port}`);
}
bootstrap();
