import { Module } from '@nestjs/common';
import { RolPermisoService } from './rol-permiso.service';
import { RolPermisoController } from './rol-permiso.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolPermiso } from './entities/rol-permiso.entity';
import { DatabaseErrorService } from 'src/common/database-error.service';

@Module({
  imports: [TypeOrmModule.forFeature([RolPermiso])],
  controllers: [RolPermisoController],
  providers: [RolPermisoService, DatabaseErrorService],
})
export class RolPermisoModule {}
