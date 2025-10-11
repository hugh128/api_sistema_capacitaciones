import { Puesto } from 'src/puesto/entities/puesto.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

@Entity('DEPARTAMENTO')
export class Departamento {
    @PrimaryGeneratedColumn({ name: 'ID_DEPARTAMENTO' })
    ID_DEPARTAMENTO: number;

    @Column({ name: 'NOMBRE', type: 'nvarchar', length: 100, nullable: false })
    NOMBRE: string;

    @Column({ name: 'DESCRIPCION', type: 'nvarchar', length: 255, nullable: true })
    DESCRIPCION: string;

    @Column({ name: 'ESTADO', type: 'bit', default: 1, nullable: false })
    ESTADO: boolean;

    @Column({ name: 'FECHA_CREACION', type: 'datetime', default: () => 'GETDATE()', nullable: false })
    FECHA_CREACION: Date;

    @OneToMany(() => Puesto, puesto => puesto.DEPARTAMENTO)
    PUESTOS: Puesto[];
}
