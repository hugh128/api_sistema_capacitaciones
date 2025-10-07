import { 
    Entity, PrimaryGeneratedColumn, Column, ManyToOne, 
    JoinColumn
} from 'typeorm';
import { Persona } from 'src/persona/entities/persona.entity';

@Entity('USUARIO')
export class Usuario {
    @PrimaryGeneratedColumn({ name: 'ID_USUARIO' })
    ID_USUARIO: number;

    @Column({ name: 'PERSONA_ID', nullable: false, unique: true })
    PERSONA_ID: number;

    @Column({ name: 'USERNAME', type: 'varchar', length: 50, nullable: false, unique: true })
    USERNAME: string;

    @Column({ name: 'PASSWORD', type: 'varchar', length: 255, nullable: false })
    PASSWORD: string;

    @Column({ name: 'ESTADO', type: 'bit', default: 1, nullable: false })
    ESTADO: boolean;
    
    @Column({ name: 'ULTIMO_ACCESO', type: 'datetime', nullable: true })
    ULTIMO_ACCESO: Date;
    
    @Column({ name: 'FECHA_CREACION', type: 'datetime', nullable: false })
    FECHA_CREACION: Date;
    
    @ManyToOne(() => Persona, persona => persona.USUARIO)
    @JoinColumn({ name: 'PERSONA_ID' })
    PERSONA: Persona;
}
