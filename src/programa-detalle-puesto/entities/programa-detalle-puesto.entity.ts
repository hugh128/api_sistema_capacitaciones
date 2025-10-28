import { Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { ProgramaDetalle } from "src/programa-detalle/entities/programa-detalle.entity";
import { Puesto } from "src/puesto/entities/puesto.entity";

@Entity('PROGRAMA_DETALLE_PUESTO')
export class ProgramaDetallePuesto {
  @PrimaryColumn({ name: 'ID_DETALLE' })
  ID_DETALLE: number;

  @PrimaryColumn({ name: 'ID_PUESTO' })
  ID_PUESTO: number;

  @ManyToOne(() => ProgramaDetalle, (detalle) => detalle.PUESTO_RELACIONES)
  @JoinColumn({ name: 'ID_DETALLE' })
  PROGRAMA_DETALLE: ProgramaDetalle;

  @ManyToOne(() => Puesto, (departamento) => departamento.PROGRAMA_DETALLE_RELACIONES_PUESTO)
  @JoinColumn({ name: 'ID_PUESTO', referencedColumnName: 'ID_PUESTO' })
  PUESTO: Puesto;
}
