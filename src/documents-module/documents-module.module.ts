import { Module } from '@nestjs/common';
import { DocumentsModuleService } from './documents-module.service';
import { DocumentsModuleController } from './documents-module.controller';

@Module({
  controllers: [DocumentsModuleController],
  providers: [DocumentsModuleService],
})
export class DocumentsModuleModule {}
