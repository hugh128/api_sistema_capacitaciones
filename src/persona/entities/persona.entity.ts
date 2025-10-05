import { 
    Entity, PrimaryGeneratedColumn, Column, ManyToOne, 
    JoinColumn
} from 'typeorm';
import { Empresa } from 'src/empresa/entities/empresa.entity';
import { Departamento } from 'src/departamento/entities/departamento.entity';
import { Puesto } from 'src/puesto/entities/puesto.entity';

@Entity('PERSONA')
export class Persona {
    @PrimaryGeneratedColumn({ name: 'ID_PERSONA' })
    ID_PERSONA: number;

    @Column({ name: 'NOMBRE', type: 'varchar', length: 100, nullable: false })
    NOMBRE: string;

    @Column({ name: 'APELLIDO', type: 'varchar', length: 100, nullable: false })
    APELLIDO: string;

    @Column({ name: 'CORREO', type: 'varchar', length: 150, nullable: true })
    CORREO: string;

    @Column({ name: 'TELEFONO', type: 'varchar', length: 20, nullable: true })
    TELEFONO: string;

    @Column({ name: 'DPI', type: 'nvarchar', length: 50, nullable: true })
    DPI: string;

    @Column({ name: 'FECHA_NACIMIENTO', type: 'date', nullable: true })
    FECHA_NACIMIENTO: Date;

    @Column({ name: 'TIPO_PERSONA', type: 'varchar', length: 20, nullable: false })
    TIPO_PERSONA: 'INTERNO' | 'EXTERNO';

    @Column({ name: 'FECHA_INGRESO', type: 'date', nullable: true })
    FECHA_INGRESO: Date;

    @Column({ name: 'EMPRESA_ID', nullable: true })
    EMPRESA_ID: number;

    @Column({ name: 'DEPARTAMENTO_ID', nullable: true })
    DEPARTAMENTO_ID: number;

    @Column({ name: 'PUESTO_ID', nullable: true })
    PUESTO_ID: number;

    @Column({ name: 'ESTADO', type: 'bit', default: 1, nullable: false })
    ESTADO: boolean;
    
    // Relaciones de clave foránea
    @ManyToOne(() => Empresa)
    @JoinColumn({ name: 'EMPRESA_ID' })
    EMPRESA: Empresa;

    @ManyToOne(() => Departamento)
    @JoinColumn({ name: 'DEPARTAMENTO_ID' })
    DEPARTAMENTO: Departamento;

    @ManyToOne(() => Puesto)
    @JoinColumn({ name: 'PUESTO_ID' })
    PUESTO: Puesto;
    
}