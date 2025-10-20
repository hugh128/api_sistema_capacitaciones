import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PlanPuestoService } from './plan-puesto.service';
import { CreatePlanPuestoDto } from './dto/create-plan-puesto.dto';
import { UpdatePlanPuestoDto } from './dto/update-plan-puesto.dto';

@Controller('plan-puesto')
export class PlanPuestoController {
  constructor(private readonly planPuestoService: PlanPuestoService) {}

  @Post()
  create(@Body() createPlanPuestoDto: CreatePlanPuestoDto) {
    return this.planPuestoService.create(createPlanPuestoDto);
  }

  @Get()
  findAll() {
    return this.planPuestoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.planPuestoService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePlanPuestoDto: UpdatePlanPuestoDto) {
    return this.planPuestoService.update(+id, updatePlanPuestoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.planPuestoService.remove(+id);
  }
}
