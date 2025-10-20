import { Injectable } from '@nestjs/common';
import { CreateDocumentoPlanDto } from './dto/create-documento-plan.dto';
import { UpdateDocumentoPlanDto } from './dto/update-documento-plan.dto';

@Injectable()
export class DocumentoPlanService {
  create(createDocumentoPlanDto: CreateDocumentoPlanDto) {
    return 'This action adds a new documentoPlan';
  }

  findAll() {
    return `This action returns all documentoPlan`;
  }

  findOne(id: number) {
    return `This action returns a #${id} documentoPlan`;
  }

  update(id: number, updateDocumentoPlanDto: UpdateDocumentoPlanDto) {
    return `This action updates a #${id} documentoPlan`;
  }

  remove(id: number) {
    return `This action removes a #${id} documentoPlan`;
  }
}
