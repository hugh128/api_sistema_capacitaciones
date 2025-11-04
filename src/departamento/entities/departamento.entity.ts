import { Puesto } from 'src/puesto/entities/puesto.entity';
import { Documento } from 'src/documento/entities/documento.entity';
import { PlanCapacitacion } from 'src/plan-capacitacion/entities/plan-capacitacion.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { Capacitacion } from 'src/capacitacion/entities/capacitacion.entity';
import { ProgramaDetalleDepartamento } from 'src/programa-detalle-departamento/entities/programa-detalle-departamento.entity';
import { Persona } from 'src/persona/entities/persona.entity';

@Entity('DEPARTAMENTO')
export class Departamento {
    @PrimaryGeneratedColumn({ name: 'ID_DEPARTAMENTO' })
    ID_DEPARTAMENTO: number;

    @Column({ name: 'CODIGO', type: 'nvarchar', length: 100, unique: true, nullable: false })
    CODIGO: string;

    @Column({ name: 'NOMBRE', type: 'nvarchar', length: 100, nullable: false })
    NOMBRE: string;

    @Column({ name: 'DESCRIPCION', type: 'nvarchar', length: 255, nullable: true })
    DESCRIPCION: string;

    @Column({ name: 'ID_ENCARGADO', nullable: true })
    ID_ENCARGADO: number;

    @Column({ name: 'ESTADO', type: 'bit', default: 1, nullable: false })
    ESTADO: boolean;

    @Column({ name: 'FECHA_CREACION', type: 'datetime', default: () => 'GETDATE()', nullable: false })
    FECHA_CREACION: Date;

    @OneToMany(() => Puesto, puesto => puesto.DEPARTAMENTO)
    PUESTOS: Puesto[];

    @OneToMany(() => Documento, (documento) => documento.DEPARTAMENTO)
    DOCUMENTOS: Documento[];

    @OneToMany(() => PlanCapacitacion, (planCapacitacion) => planCapacitacion.DEPARTAMENTO)
    PLANES_CAPACITACION: PlanCapacitacion[];

    @OneToMany(()=> Capacitacion, capacitacion=>capacitacion.DEPARTAMENTO)
    DEPARTAMENTOS: Capacitacion[];

    @OneToMany(() => ProgramaDetalleDepartamento, (relacion) => relacion.DEPARTAMENTO)
    PROGRAMA_DETALLE_RELACIONES: ProgramaDetalleDepartamento[];

    @ManyToOne(() => Persona, persona => persona.ENCARGADOS)
    @JoinColumn({ name: 'ID_ENCARGADO' })
    ENCARGADO: Persona;
}
