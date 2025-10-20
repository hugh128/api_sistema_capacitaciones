import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { Departamento } from 'src/departamento/entities/departamento.entity';
import { DocumentoPlan } from 'src/documento-plan/entities/documento-plan.entity';
import { PlanPuesto } from 'src/plan-puesto/entities/plan-puesto.entity';

// Entidad principal para los Planes de Capacitación
@Entity('PLAN_CAPACITACION')
export class PlanCapacitacion {
  @PrimaryGeneratedColumn({ name: 'ID_PLAN' })
  ID_PLAN: number;

  @Column({ name: 'NOMBRE', length: 150 })
  NOMBRE: string;

  @Column({ name: 'DESCRIPCION', length: 255, nullable: true })
  DESCRIPCION: string;

  @Column({ name: 'TIPO', length: 200 })
  TIPO: string;

  @Column({ name: 'DEPARTAMENTO_ID', nullable: false })
  DEPARTAMENTO_ID: number;

  @Column({ name: 'APLICA_TODOS_PUESTOS_DEP', type: 'bit', default: false })
  APLICA_TODOS_PUESTOS_DEP: boolean;

  @Column({ name: 'FECHA_CREACION', type: 'date', default: () => 'GETDATE()' })
  FECHA_CREACION: Date;

  @Column({ name: 'ESTADO', length: 20, default: 'ACTIVO' })
  ESTADO: string;

  // Relación Many-to-One con DEPARTAMENTO
  @ManyToOne(() => Departamento, (departamento) => departamento.PLANES_CAPACITACION)
  @JoinColumn({ name: 'DEPARTAMENTO_ID' })
  DEPARTAMENTO: Departamento;

  // Relación One-to-Many con PLAN_PUESTO (para puestos específicos)
  @OneToMany(() => PlanPuesto, (planPuesto) => planPuesto.PLAN)
  PLANES_PUESTOS: PlanPuesto[];

  // Relación One-to-Many con DOCUMENTO_PLAN (para documentos del plan)
  @OneToMany(() => DocumentoPlan, (documentoPlan) => documentoPlan.PLAN_CAPACITACION)
  DOCUMENTOS_PLANES: DocumentoPlan[];
}
