import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PlanCapacitacionService } from './plan-capacitacion.service';
import { CreatePlanCapacitacionDto } from './dto/create-plan-capacitacion.dto';
import { UpdatePlanCapacitacionDto } from './dto/update-plan-capacitacion.dto';

@Controller('plan-capacitacion')
export class PlanCapacitacionController {
  constructor(private readonly planCapacitacionService: PlanCapacitacionService) {}

  @Post()
  create(@Body() createPlanCapacitacionDto: CreatePlanCapacitacionDto) {
    return this.planCapacitacionService.create(createPlanCapacitacionDto);
  }

  @Get()
  findAll() {
    return this.planCapacitacionService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.planCapacitacionService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePlanCapacitacionDto: UpdatePlanCapacitacionDto) {
    return this.planCapacitacionService.update(+id, updatePlanCapacitacionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.planCapacitacionService.remove(+id);
  }
}
