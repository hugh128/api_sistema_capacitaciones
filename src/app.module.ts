import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EmpresaModule } from './empresa/empresa.module';
import { DepartamentoModule } from './departamento/departamento.module';
import { PuestoModule } from './puesto/puesto.module';
import { PersonaModule } from './persona/persona.module';
import { UsuarioModule } from './usuario/usuario.module';
import { AuthModule } from './auth/auth.module';
import { DocumentoModule } from './documento/documento.module';
import { DocumentoAsociadoModule } from './documento-asociado/documento-asociado.module';
import { CategoriaPermisoModule } from './categoria-permiso/categoria-permiso.module';
import { PermisoModule } from './permiso/permiso.module';
import { RolModule } from './rol/rol.module';
import { RolPermisoModule } from './rol-permiso/rol-permiso.module';
import { UsuarioRolModule } from './usuario-rol/usuario-rol.module';
import { PdfModule } from './pdf-module/pdf-module.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mssql',
        host: configService.get<string>('DB_HOST', 'localhost'),
        port: +configService.get<number>('DB_PORT', 1433),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_DATABASE'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: false,
        extra: {
          encrypt: true,
          trustServerCertificate: true,
        },
      }),
    }),

    EmpresaModule,
    DepartamentoModule,
    PuestoModule,
    PersonaModule,
    UsuarioModule,
    AuthModule,
    DocumentoModule,   
    DocumentoAsociadoModule,

    CategoriaPermisoModule,
    PermisoModule,
    RolModule,
    RolPermisoModule,
    UsuarioRolModule,
    PdfModule,
    
  ],
})
export class AppModule {}
