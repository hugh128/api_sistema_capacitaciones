import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsuarioModule } from 'src/usuario/usuario.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';
import { HashingService } from 'src/common/hashing.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DatabaseErrorService } from 'src/common/database-error.service';

@Module({
  imports: [
    UsuarioModule,
    ConfigModule, 
    PassportModule.register({ defaultStrategy: 'jwt' }),
    
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'), 
        signOptions: { 
            expiresIn: configService.get<string>('JWT_EXPIRATION_TIME')
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    HashingService,
    DatabaseErrorService,
  ],
  exports: [
    AuthService, 
    JwtModule,
    PassportModule,
  ],
})
export class AuthModule {}
