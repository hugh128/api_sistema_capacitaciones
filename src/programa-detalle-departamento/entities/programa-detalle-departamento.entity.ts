import { Entity, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ProgramaDetalle } from 'src/programa-detalle/entities/programa-detalle.entity';
import { Departamento } from 'src/departamento/entities/departamento.entity';

@Entity('PROGRAMA_DETALLE_DEPARTAMENTO')
export class ProgramaDetalleDepartamento {
  @PrimaryColumn({ name: 'ID_DETALLE' })
  ID_DETALLE: number;

  @PrimaryColumn({ name: 'ID_DEPARTAMENTO' })
  ID_DEPARTAMENTO: number;

  @ManyToOne(() => ProgramaDetalle, (detalle) => detalle.DEPARTAMENTO_RELACIONES)
  @JoinColumn({ name: 'ID_DETALLE' })
  PROGRAMA_DETALLE: ProgramaDetalle;

  @ManyToOne(() => Departamento, (departamento) => departamento.PROGRAMA_DETALLE_RELACIONES)
  @JoinColumn({ name: 'ID_DEPARTAMENTO', referencedColumnName: 'ID_DEPARTAMENTO' })
  DEPARTAMENTO: Departamento;
}
