import { Module } from '@nestjs/common';
import { PermisoService } from './permiso.service';
import { PermisoController } from './permiso.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Permiso } from './entities/permiso.entity';
import { DatabaseErrorService } from 'src/common/database-error.service';

@Module({
  imports: [TypeOrmModule.forFeature([Permiso])],
  controllers: [PermisoController],
  providers: [PermisoService, DatabaseErrorService],
})
export class PermisoModule {}
