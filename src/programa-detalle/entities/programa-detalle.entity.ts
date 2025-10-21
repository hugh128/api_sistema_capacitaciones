import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { ProgramaCapacitacion } from 'src/programa-capacitacion/entities/programa-capacitacion.entity';
import { ProgramaDetalleDepartamento } from 'src/programa-detalle-departamento/entities/programa-detalle-departamento.entity';

@Entity('PROGRAMA_DETALLE')
export class ProgramaDetalle {
  @PrimaryGeneratedColumn({ name: 'ID_DETALLE' })
  ID_DETALLE: number;

  @Column({ name: 'NOMBRE', length: 255, nullable: false })
  NOMBRE: string;

  @Column({ name: 'CATEGORIA_CAPACITACION', length: 20, nullable: false })
  CATEGORIA_CAPACITACION: 'GENERAL' | 'ESPECIFICA' | 'CONTINUA';

  @Column({ name: 'TIPO_CAPACITACION', length: 10, nullable: false })
  TIPO_CAPACITACION: 'INTERNA' | 'EXTERNA';

  @Column({ name: 'APLICA_TODOS_DEPARTAMENTOS', type: 'bit', default: 0 })
  APLICA_TODOS_DEPARTAMENTOS: boolean;

  @Column({ name: 'FECHA_PROGRAMADA', type: 'date', nullable: true })
  FECHA_PROGRAMADA: Date;

  @Column({ name: 'ESTADO', length: 20, default: 'ACTIVO' })
  ESTADO: string;

  @Column({ name: 'PROGRAMA_ID', nullable: false })
  PROGRAMA_ID: number;

  @ManyToOne(() => ProgramaCapacitacion, (programa) => programa.PROGRAMA_DETALLES)
  @JoinColumn({ name: 'PROGRAMA_ID' })
  PROGRAMA_CAPACITACION: ProgramaCapacitacion;

  @OneToMany(() => ProgramaDetalleDepartamento, (relacion) => relacion.PROGRAMA_DETALLE)
  DEPARTAMENTO_RELACIONES: ProgramaDetalleDepartamento[];
}
