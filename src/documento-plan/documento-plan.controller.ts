import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DocumentoPlanService } from './documento-plan.service';
import { CreateDocumentoPlanDto } from './dto/create-documento-plan.dto';
import { UpdateDocumentoPlanDto } from './dto/update-documento-plan.dto';

@Controller('documento-plan')
export class DocumentoPlanController {
  constructor(private readonly documentoPlanService: DocumentoPlanService) {}

  @Post()
  create(@Body() createDocumentoPlanDto: CreateDocumentoPlanDto) {
    return this.documentoPlanService.create(createDocumentoPlanDto);
  }

  @Get()
  findAll() {
    return this.documentoPlanService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.documentoPlanService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDocumentoPlanDto: UpdateDocumentoPlanDto) {
    return this.documentoPlanService.update(+id, updateDocumentoPlanDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.documentoPlanService.remove(+id);
  }
}
