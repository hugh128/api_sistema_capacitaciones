import { Module } from '@nestjs/common';
import { ColaboradoresService } from './colaboradores.service';
import { ColaboradoresController } from './colaboradores.controller';
import { StorageModule } from 'src/storage/storage.module';
import { DatabaseErrorService } from 'src/common/database-error.service';

@Module({
  imports: [StorageModule],
  controllers: [ColaboradoresController],
  providers: [ColaboradoresService, DatabaseErrorService],
})
export class ColaboradoresModule {}
