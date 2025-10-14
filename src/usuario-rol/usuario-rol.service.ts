import { Injectable } from '@nestjs/common';
import { CreateUsuarioRolDto } from './dto/create-usuario-rol.dto';
import { UpdateUsuarioRolDto } from './dto/update-usuario-rol.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { UsuarioRol } from './entities/usuario-rol.entity';
import { EntityManager, Repository } from 'typeorm';
import { DatabaseErrorService } from 'src/common/database-error.service';

@Injectable()
export class UsuarioRolService {

  constructor(@InjectRepository(UsuarioRol)
    private usuarioRolRepository: Repository<UsuarioRol>,
    private readonly entityManager: EntityManager,
    private readonly databaseErrorService: DatabaseErrorService
  ) {}

  create(createUsuarioRolDto: CreateUsuarioRolDto) {
    return 'This action adds a new usuarioRol';
  }

  findAll() {
    return `This action returns all usuarioRol`;
  }

  findOne(id: number) {
    return `This action returns a #${id} usuarioRol`;
  }

  update(id: number, updateUsuarioRolDto: UpdateUsuarioRolDto) {
    return `This action updates a #${id} usuarioRol`;
  }

  remove(id: number) {
    return `This action removes a #${id} usuarioRol`;
  }
}
