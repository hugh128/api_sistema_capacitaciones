import { Module } from '@nestjs/common';
import { ReportsModuleService } from './reports-module.service';
import { ReportsModuleController } from './reports-module.controller';
import { DatabaseErrorService } from 'src/common/database-error.service';
import { ExcelGeneratorService } from './services/excel-generator.service';

@Module({
  controllers: [ReportsModuleController],
  providers: [ReportsModuleService, ExcelGeneratorService, DatabaseErrorService],
})
export class ReportsModuleModule {}
