import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ProgramaDetallePuestoService } from './programa-detalle-puesto.service';
import { CreateProgramaDetallePuestoDto } from './dto/create-programa-detalle-puesto.dto';
import { UpdateProgramaDetallePuestoDto } from './dto/update-programa-detalle-puesto.dto';

@Controller('programa-detalle-puesto')
export class ProgramaDetallePuestoController {
  constructor(private readonly programaDetallePuestoService: ProgramaDetallePuestoService) {}

  @Post()
  create(@Body() createProgramaDetallePuestoDto: CreateProgramaDetallePuestoDto) {
    return this.programaDetallePuestoService.create(createProgramaDetallePuestoDto);
  }

  @Get()
  findAll() {
    return this.programaDetallePuestoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.programaDetallePuestoService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProgramaDetallePuestoDto: UpdateProgramaDetallePuestoDto) {
    return this.programaDetallePuestoService.update(+id, updateProgramaDetallePuestoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.programaDetallePuestoService.remove(+id);
  }
}
