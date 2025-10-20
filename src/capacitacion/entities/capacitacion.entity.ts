import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, JoinColumn } from "typeorm";
import { TipoCapacitacion } from "src/tipo-capacitacion/entities/tipo-capacitacion.entity";
import { Rol } from "src/rol/entities/rol.entity";
import { DocumentoAsociado } from "src/documento-asociado/entities/documento-asociado.entity";
import { Departamento } from "src/departamento/entities/departamento.entity";

@Entity('CAPACITACION')
export class Capacitacion{
    @PrimaryGeneratedColumn({ name: 'ID_CAPACITACION' })
    ID_CAPACITACION: number;

    @Column({ name: 'CODIGO', type: 'varchar', length: 20, nullable: false})
    CODIGO: string;

    @Column({ name: 'NOMBRE_CAPACITACION', type: 'varchar', length: 250, nullable: false })
    NOMBRE_CAPACITACION: string;
     
    @Column({ name: 'DESCRIPCION', type: 'text', nullable: true })
    DESCRIPCION: string;

    @Column({ name: 'TIPO_CAPACITACION_ID', nullable: false })
    TIPO_CAPACITACION_ID: number;

    @Column({ name: 'FECHA_INICIO', type: 'datetime', nullable: false })
    FECHA_INICIO: Date;     

    @Column({ name: 'FECHA_FIN', type: 'datetime', nullable: false })
    FECHA_FIN: Date;

    @Column({ name: 'ESTADO', type: 'bit', default: 1, nullable: false })
    ESTADO: boolean;

    @Column({ name: 'ROL_ID', nullable: false })
    ROL_ID: number;

    @Column({ name: 'PLAN_ASOCIADO_ID', nullable: true})
    PLAN_ASOCIADO_ID:number;
     
    @Column({ name: 'APLICA_EXAMEN', type: 'bit', default: 1, nullable: false })
    APLICA_EXAMEN: boolean;

    @Column({ name: 'PUNTAJE_MINIMO', nullable: true })
    PUNTAJE_MINIMO: number;

    @Column({ name: 'APLICA_DIPLOMA', type: 'bit', default: 0, nullable: false  })
    APLICA_DIPLOMA: boolean;

    @Column ({ name: 'DOCUMENTO_ASOCIADO_ID', nullable: true })
    DOCUMENTO_ASOCIADO_ID: number;

    @Column ({ name: 'DEPARTAMENTO_ID', nullable: true  })
    DEPARTAMENTO_ID: number;

    @ManyToOne (()=> TipoCapacitacion, tipoCapacitacion=> tipoCapacitacion.CAPACITACIONES)
    @JoinColumn({name: 'TIPO_CAPACITACION_ID'})
    TIPO_CAPACITACION:TipoCapacitacion;

    @ManyToOne (()=> Rol, rol=> rol.CAPACITACIONES)
    @JoinColumn({name: 'ROL_ID'})
    CAPACITADOR_ID:Rol;
/*
    @ManyToOne (()=> TipoCapacitacion)
    @JoinColumn({name: 'PLAN_ASOCIADO_ID'})
    PLAN_ID:TipoCapacitacion;
*/
    @ManyToOne (()=> DocumentoAsociado, docAsociado=> docAsociado.DOCUMENTOS_ASOCIADOS)
    @JoinColumn({name: 'DOCUMENTO_ASOCIADO_ID'})
    DOCUMENTO_ASOCIADO:DocumentoAsociado;

    @ManyToOne (()=> Departamento, departamento=> departamento.DEPARTAMENTOS)
    @JoinColumn({name: 'DEPARTAMENTO_ID'})
    DEPARTAMENTO:Departamento;
}