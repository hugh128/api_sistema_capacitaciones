import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CapacitacionService } from './capacitacion.service';
import { CreateCapacitacionDto } from './dto/create-capacitacion.dto';
import { UpdateCapacitacionDto } from './dto/update-capacitacion.dto';

@Controller('capacitacion')
export class CapacitacionController {
  constructor(private readonly capacitacionService: CapacitacionService) {}

  @Post()
  create(@Body() createCapacitacionDto: CreateCapacitacionDto) {
    return this.capacitacionService.create(createCapacitacionDto);
  }

  @Get()
  findAll() {
    return this.capacitacionService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.capacitacionService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCapacitacionDto: UpdateCapacitacionDto) {
    return this.capacitacionService.update(+id, updateCapacitacionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.capacitacionService.remove(+id);
  }
}
