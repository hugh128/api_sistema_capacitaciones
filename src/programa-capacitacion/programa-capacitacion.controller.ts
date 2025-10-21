import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ProgramaCapacitacionService } from './programa-capacitacion.service';
import { CreateProgramaCapacitacionDto } from './dto/create-programa-capacitacion.dto';
import { UpdateProgramaCapacitacionDto } from './dto/update-programa-capacitacion.dto';

@Controller('programa-capacitacion')
export class ProgramaCapacitacionController {
  constructor(private readonly programaCapacitacionService: ProgramaCapacitacionService) {}

  @Post()
  create(@Body() createProgramaCapacitacionDto: CreateProgramaCapacitacionDto) {
    return this.programaCapacitacionService.create(createProgramaCapacitacionDto);
  }

  @Get()
  findAll() {
    return this.programaCapacitacionService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.programaCapacitacionService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProgramaCapacitacionDto: UpdateProgramaCapacitacionDto) {
    return this.programaCapacitacionService.update(+id, updateProgramaCapacitacionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.programaCapacitacionService.remove(+id);
  }
}
