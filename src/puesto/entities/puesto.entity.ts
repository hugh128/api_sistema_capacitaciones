import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Departamento } from 'src/departamento/entities/departamento.entity';

@Entity('PUESTO')
export class Puesto {
    @PrimaryGeneratedColumn({ name: 'ID_PUESTO' })
    ID_PUESTO: number;

    @Column({ name: 'NOMBRE', type: 'nvarchar', length: 100, nullable: false })
    NOMBRE: string;

    @Column({ name: 'DESCRIPCION', type: 'nvarchar', length: 255, nullable: true })
    DESCRIPCION: string;

    @Column({ name: 'ESTADO', type: 'bit', default: 1, nullable: false })
    ESTADO: boolean;
    
    // Columna de clave foránea
    @Column({ name: 'DEPARTAMENTO_ID', nullable: false })
    DEPARTAMENTO_ID: number;

    @ManyToOne(() => Departamento, departamento => departamento.puestos)
    @JoinColumn({ name: 'DEPARTAMENTO_ID' })
    departamento: Departamento;
}
