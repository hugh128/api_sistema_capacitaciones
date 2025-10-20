import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Capacitacion } from './entities/capacitacion.entity';
import { CreateCapacitacionDto } from './dto/create-capacitacion.dto';
import { UpdateCapacitacionDto } from './dto/update-capacitacion.dto';

@Injectable()
export class CapacitacionService {
  constructor(
    @InjectRepository(Capacitacion)
    private readonly capacitacionRepository: Repository<Capacitacion>,
    private readonly dataSource: DataSource,
  ) {}

  // ------------------------------------------------------------------
  // CREAR 
  // ------------------------------------------------------------------
  async create(dto: CreateCapacitacionDto) {
    try {
      const result = await this.dataSource.query(
        `EXEC sp_CAPACITACION_CREAR 
          @CODIGO = @0,
          @NOMBRE_CAPACITACION = @1,
          @DESCRIPCION = @2,
          @TIPO_CAPACITACION_ID = @3,
          @FECHA_INICIO = @4,
          @FECHA_FIN = @5,
          @USUARIO_ID = @6,
          @PLAN_ASOCIADO = @7,
          @APLICA_EXAMEN = @8,
          @PUNTAJE_MINIMO = @9,
          @APLICA_DIPLOMA = @10,
          @DOCUMENTO_ASOCIADO_ID = @11,
          @DEPARTAMENTO_ID = @12`,
        [
          dto.CODIGO,
          dto.NOMBRE_CAPACITACION,
          dto.DESCRIPCION,
          dto.TIPO_CAPACITACION_ID,
          dto.FECHA_INICIO,
          dto.FECHA_FIN,
          dto.USUARIO_ID,
          dto.PLAN_ASOCIADO,
          dto.APLICA_EXAMEN,
          dto.PUNTAJE_MINIMO,
          dto.APLICA_DIPLOMA,
          dto.DOCUMENTO_ASOCIADO,
          dto.DEPARTAMENTO_ID,
        ],
      );

      return result[0]; // Devuelve el mensaje y código estado
    } catch (error) {
      console.error('Error en create():', error);
      throw new InternalServerErrorException('Error al crear la capacitación');
    }
  }

  // ------------------------------------------------------------------
  // LISTAR TODAS LAS ACTIVAS
  // ------------------------------------------------------------------
  async findAll() {
    try {
      const result = await this.dataSource.query(`EXEC sp_CAPACITACION_LISTAR`);
      return result;
    } catch (error) {
      console.error('Error en findAll():', error);
      throw new InternalServerErrorException('Error al listar las capacitaciones');
    }
  }

  // ------------------------------------------------------------------
  // OBTENER POR ID 
  // ------------------------------------------------------------------
  async findOne(id: number) {
    try {
      const result = await this.dataSource.query(
        `EXEC sp_CAPACITACION_POR_ID @ID_CAPACITACION = @0`,
        [id],
      );

      // Si el procedimiento devuelve un mensaje de error (no encontrado)
      if (result.length === 0) {
        return { CODIGO_ESTADO: 1, MENSAJE_SALIDA: 'No se encontró la capacitación.' };
      }

      return result[0];
    } catch (error) {
      console.error('Error en findOne():', error);
      throw new InternalServerErrorException('Error al obtener la capacitación');
    }
  }

  // ------------------------------------------------------------------
  // MODIFICAR
  // ------------------------------------------------------------------
  async update(id: number, dto: UpdateCapacitacionDto) {
    try {
      const result = await this.dataSource.query(
        `EXEC sp_CAPACITACION_MODIFICAR 
          @ID_CAPACITACION = @0,
          @CODIGO = @1,
          @NOMBRE_CAPACITACION = @2,
          @DESCRIPCION = @3,
          @TIPO_CAPACITACION_ID = @4,
          @FECHA_INICIO = @5,
          @FECHA_FIN = @6,
          @USUARIO_ID = @7,
          @PLAN_ASOCIADO = @8,
          @APLICA_EXAMEN = @9,
          @PUNTAJE_MINIMO = @10,
          @APLICA_DIPLOMA = @11,
          @DOCUMENTO_ASOCIADO_ID = @12,
          @DEPARTAMENTO_ID = @13`,
        [
          id,
          dto.CODIGO,
          dto.NOMBRE_CAPACITACION,
          dto.DESCRIPCION,
          dto.TIPO_CAPACITACION_ID,
          dto.FECHA_INICIO,
          dto.FECHA_FIN,
          dto.USUARIO_ID,
          dto.PLAN_ASOCIADO,
          dto.APLICA_EXAMEN,
          dto.PUNTAJE_MINIMO,
          dto.APLICA_DIPLOMA,
          dto.DOCUMENTO_ASOCIADO,
          dto.DEPARTAMENTO_ID,
        ],
      );

      return result[0];
    } catch (error) {
      console.error('Error en update():', error);
      throw new InternalServerErrorException('Error al actualizar la capacitación');
    }
  }

  // ------------------------------------------------------------------
  // BAJA LÓGICA 
  // ------------------------------------------------------------------
  async remove(id: number) {
    try {
      const result = await this.dataSource.query(
        `EXEC sp_CAPACITACION_BAJA @ID_CAPACITACION = @0`,
        [id],
      );
      return result[0];
    } catch (error) {
      console.error('Error en remove():', error);
      throw new InternalServerErrorException('Error al eliminar la capacitación');
    }
  }

  // ------------------------------------------------------------------
  //  ALTA LÓGICA
  // ------------------------------------------------------------------
  async restore(id: number) {
    try {
      const result = await this.dataSource.query(
        `EXEC sp_CAPACITACION_ALTA @ID_CAPACITACION = @0`,
        [id],
      );
      return result[0];
    } catch (error) {
      console.error('Error en restore():', error);
      throw new InternalServerErrorException('Error al dar de alta la capacitación');
    }
  }
}
