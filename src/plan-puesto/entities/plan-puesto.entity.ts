import { Entity, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { PlanCapacitacion } from 'src/plan-capacitacion/entities/plan-capacitacion.entity';
import { Puesto } from 'src/puesto/entities/puesto.entity';

@Entity('PLAN_PUESTO')
export class PlanPuesto {
    @PrimaryColumn({ name: 'ID_PLAN' })
    ID_PLAN: number;

    @PrimaryColumn({ name: 'ID_PUESTO' })
    ID_PUESTO: number;

    // Relaciones
    @ManyToOne(() => PlanCapacitacion, (plan) => plan.PLANES_PUESTOS)
    @JoinColumn({ name: 'ID_PLAN' })
    PLAN: PlanCapacitacion;

    @ManyToOne(() => Puesto)
    @JoinColumn({ name: 'ID_PUESTO' })
    PUESTO: Puesto;
}
