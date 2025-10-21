import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ProgramaDetalleService } from './programa-detalle.service';
import { CreateProgramaDetalleDto } from './dto/create-programa-detalle.dto';
import { UpdateProgramaDetalleDto } from './dto/update-programa-detalle.dto';

@Controller('programa-detalle')
export class ProgramaDetalleController {
  constructor(private readonly programaDetalleService: ProgramaDetalleService) {}

  @Post()
  create(@Body() createProgramaDetalleDto: CreateProgramaDetalleDto) {
    return this.programaDetalleService.create(createProgramaDetalleDto);
  }

  @Get()
  findAll() {
    return this.programaDetalleService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.programaDetalleService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProgramaDetalleDto: UpdateProgramaDetalleDto) {
    return this.programaDetalleService.update(+id, updateProgramaDetalleDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.programaDetalleService.remove(+id);
  }
}
