import { Injectable } from '@nestjs/common';
import { CreateProgramaDetallePuestoDto } from './dto/create-programa-detalle-puesto.dto';
import { UpdateProgramaDetallePuestoDto } from './dto/update-programa-detalle-puesto.dto';

@Injectable()
export class ProgramaDetallePuestoService {
  create(createProgramaDetallePuestoDto: CreateProgramaDetallePuestoDto) {
    return 'This action adds a new programaDetallePuesto';
  }

  findAll() {
    return `This action returns all programaDetallePuesto`;
  }

  findOne(id: number) {
    return `This action returns a #${id} programaDetallePuesto`;
  }

  update(id: number, updateProgramaDetallePuestoDto: UpdateProgramaDetallePuestoDto) {
    return `This action updates a #${id} programaDetallePuesto`;
  }

  remove(id: number) {
    return `This action removes a #${id} programaDetallePuesto`;
  }
}
