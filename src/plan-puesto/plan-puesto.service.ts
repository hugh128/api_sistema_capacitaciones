import { Injectable } from '@nestjs/common';
import { CreatePlanPuestoDto } from './dto/create-plan-puesto.dto';
import { UpdatePlanPuestoDto } from './dto/update-plan-puesto.dto';

@Injectable()
export class PlanPuestoService {
  create(createPlanPuestoDto: CreatePlanPuestoDto) {
    return 'This action adds a new planPuesto';
  }

  findAll() {
    return `This action returns all planPuesto`;
  }

  findOne(id: number) {
    return `This action returns a #${id} planPuesto`;
  }

  update(id: number, updatePlanPuestoDto: UpdatePlanPuestoDto) {
    return `This action updates a #${id} planPuesto`;
  }

  remove(id: number) {
    return `This action removes a #${id} planPuesto`;
  }
}
