import { Entity, PrimaryGeneratedColumn, Column} from 'typeorm';
//import { EmpresaDepartamento } from '../empresa-departamento/empresa-departamento.entity';

@Entity('EMPRESA')
export class Empresa {
    @PrimaryGeneratedColumn({ name: 'ID_EMPRESA' })
    ID_EMPRESA: number;

    @Column({ name: 'NOMBRE', type: 'nvarchar', length: 200, nullable: false })
    NOMBRE: string;

    @Column({ name: 'DIRECCION', type: 'nvarchar', length: 255, nullable: true })
    DIRECCION: string;

    @Column({ name: 'NIT', type: 'nvarchar', length: 20, nullable: true })
    NIT: string;

    @Column({ name: 'TELEFONO', type: 'nvarchar', length: 20, nullable: true })
    TELEFONO: string;

    @Column({ name: 'CORREO', type: 'nvarchar', length: 150, nullable: true })
    CORREO: string;

    @Column({ name: 'ESTADO', type: 'bit', default: 1, nullable: false })
    ESTADO: boolean;

    @Column({ name: 'FECHA_CREACION', type: 'datetime', nullable: false })
    FECHA_CREACION: Date; 
    
    // Relación Many-to-Many con DEPARTAMENTO a través de EMPRESA_DEPARTAMENTO
    //@OneToMany(() => EmpresaDepartamento, empresaDep => empresaDep.empresa)
    //empresaDepartamentos: EmpresaDepartamento[];
}
