import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ProgramaDetalleDepartamentoService } from './programa-detalle-departamento.service';
import { CreateProgramaDetalleDepartamentoDto } from './dto/create-programa-detalle-departamento.dto';
import { UpdateProgramaDetalleDepartamentoDto } from './dto/update-programa-detalle-departamento.dto';

@Controller('programa-detalle-departamento')
export class ProgramaDetalleDepartamentoController {
  constructor(private readonly programaDetalleDepartamentoService: ProgramaDetalleDepartamentoService) {}

  @Post()
  create(@Body() createProgramaDetalleDepartamentoDto: CreateProgramaDetalleDepartamentoDto) {
    return this.programaDetalleDepartamentoService.create(createProgramaDetalleDepartamentoDto);
  }

  @Get()
  findAll() {
    return this.programaDetalleDepartamentoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.programaDetalleDepartamentoService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProgramaDetalleDepartamentoDto: UpdateProgramaDetalleDepartamentoDto) {
    return this.programaDetalleDepartamentoService.update(+id, updateProgramaDetalleDepartamentoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.programaDetalleDepartamentoService.remove(+id);
  }
}
