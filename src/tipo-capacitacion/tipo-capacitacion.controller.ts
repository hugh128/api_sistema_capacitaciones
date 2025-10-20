import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TipoCapacitacionService } from './tipo-capacitacion.service';
import { CreateTipoCapacitacionDto } from './dto/create-tipo-capacitacion.dto';
import { UpdateTipoCapacitacionDto } from './dto/update-tipo-capacitacion.dto';

@Controller('tipo-capacitacion')
export class TipoCapacitacionController {
  constructor(private readonly tipoCapacitacionService: TipoCapacitacionService) {}

  @Post()
  create(@Body() createTipoCapacitacionDto: CreateTipoCapacitacionDto) {
    return this.tipoCapacitacionService.create(createTipoCapacitacionDto);
  }

  @Get()
  findAll() {
    return this.tipoCapacitacionService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tipoCapacitacionService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTipoCapacitacionDto: UpdateTipoCapacitacionDto) {
    return this.tipoCapacitacionService.update(+id, updateTipoCapacitacionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tipoCapacitacionService.remove(+id);
  }
}
