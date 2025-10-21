import { Injectable } from '@nestjs/common';
import { CreateProgramaDetalleDepartamentoDto } from './dto/create-programa-detalle-departamento.dto';
import { UpdateProgramaDetalleDepartamentoDto } from './dto/update-programa-detalle-departamento.dto';

@Injectable()
export class ProgramaDetalleDepartamentoService {
  create(createProgramaDetalleDepartamentoDto: CreateProgramaDetalleDepartamentoDto) {
    return 'This action adds a new programaDetalleDepartamento';
  }

  findAll() {
    return `This action returns all programaDetalleDepartamento`;
  }

  findOne(id: number) {
    return `This action returns a #${id} programaDetalleDepartamento`;
  }

  update(id: number, updateProgramaDetalleDepartamentoDto: UpdateProgramaDetalleDepartamentoDto) {
    return `This action updates a #${id} programaDetalleDepartamento`;
  }

  remove(id: number) {
    return `This action removes a #${id} programaDetalleDepartamento`;
  }
}
