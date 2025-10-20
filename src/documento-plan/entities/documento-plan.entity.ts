import { Entity, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { PlanCapacitacion } from 'src/plan-capacitacion/entities/plan-capacitacion.entity';
import { Documento } from 'src/documento/entities/documento.entity';

@Entity('DOCUMENTO_PLAN')
export class DocumentoPlan {
    @PrimaryColumn({ name: 'ID_DOCUMENTO' })
    ID_DOCUMENTO: number;

    @PrimaryColumn({ name: 'ID_PLAN' })
    ID_PLAN: number;

    @ManyToOne(() => PlanCapacitacion, (plan) => plan.DOCUMENTOS_PLANES)
    @JoinColumn({ name: 'ID_PLAN' })
    PLAN_CAPACITACION: PlanCapacitacion;

    @ManyToOne(() => Documento)
    @JoinColumn({ name: 'ID_DOCUMENTO' })
    DOCUMENTO: Documento;
}
