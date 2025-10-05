import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmpresaModule } from './empresa/empresa.module';
import { DepartamentoModule } from './departamento/departamento.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mssql',
      host: 'localhost',
      port: 1433,
      username: 'sa',
      password: 'hao128',
      database: 'GESTION_CAPACITACIONES',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
      extra: {
        encrypt: true,
        trustServerCertificate: true,
      },
    }),
    EmpresaModule,
    DepartamentoModule,
  ],
})
export class AppModule {}
