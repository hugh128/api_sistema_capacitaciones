import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DocumentoAsociadoService } from './documento-asociado.service';
import { CreateDocumentoAsociadoDto } from './dto/create-documento-asociado.dto';
import { UpdateDocumentoAsociadoDto } from './dto/update-documento-asociado.dto';

@Controller('documento-asociado')
export class DocumentoAsociadoController {
  constructor(private readonly documentoAsociadoService: DocumentoAsociadoService) {}

  @Post()
  create(@Body() createDocumentoAsociadoDto: CreateDocumentoAsociadoDto) {
    return this.documentoAsociadoService.create(createDocumentoAsociadoDto);
  }

  @Get()
  findAll() {
    return this.documentoAsociadoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.documentoAsociadoService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDocumentoAsociadoDto: UpdateDocumentoAsociadoDto) {
    return this.documentoAsociadoService.update(+id, updateDocumentoAsociadoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.documentoAsociadoService.remove(+id);
  }
}
