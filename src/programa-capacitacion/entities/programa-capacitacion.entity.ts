import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
} from 'typeorm';
import { ProgramaDetalle } from 'src/programa-detalle/entities/programa-detalle.entity';

@Entity('PROGRAMA_CAPACITACION')
export class ProgramaCapacitacion {
  @PrimaryGeneratedColumn({ name: 'ID_PROGRAMA' })
  ID_PROGRAMA: number;

  @Column({ name: 'NOMBRE', length: 150, nullable: false })
  NOMBRE: string;

  @Column({ name: 'DESCRIPCION', length: 255, nullable: true })
  DESCRIPCION: string;

  @Column({ name: 'TIPO', length: 20, nullable: false })
  TIPO: string; // 'PROGRAMA'

  @Column({ name: 'PERIODO', nullable: false })
  PERIODO: number;

  @Column({ name: 'FECHA_CREACION', type: 'date' })
  FECHA_CREACION: Date;

  @Column({ name: 'ESTADO', length: 20, default: 'ACTIVO' })
  ESTADO: string;

  @OneToMany(() => ProgramaDetalle, (detalle) => detalle.PROGRAMA_CAPACITACION)
  PROGRAMA_DETALLES: ProgramaDetalle[];
}

