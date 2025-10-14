import { Module } from '@nestjs/common';
import { CategoriaPermisoService } from './categoria-permiso.service';
import { CategoriaPermisoController } from './categoria-permiso.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoriaPermiso } from './entities/categoria-permiso.entity';
import { DatabaseErrorService } from 'src/common/database-error.service';

@Module({
  imports: [TypeOrmModule.forFeature([CategoriaPermiso])],
  controllers: [CategoriaPermisoController],
  providers: [CategoriaPermisoService, DatabaseErrorService],
})
export class CategoriaPermisoModule {}
