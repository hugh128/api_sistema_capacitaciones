import { Entity, PrimaryColumn, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Capacitacion } from "src/capacitacion/entities/capacitacion.entity";

@Entity('TIPO_CAPACITACION')
export class TipoCapacitacion {
   @PrimaryGeneratedColumn({ name: 'ID_TIPO_CAPACITACION' })
   ID_TIPO_CAPACITACION: number;
   
   @Column({ name: 'ESTADO', type: 'bit', default: 1, nullable: false})
    ESTADO: boolean;

    @Column({ name: 'NOMBRE', type: 'varchar', length: 255, nullable: false, unique: true})
    NOMBRE: string;

    @OneToMany(() => Capacitacion, capacitacion => capacitacion.TIPO_CAPACITACION)
    CAPACITACIONES:Capacitacion[];
}
