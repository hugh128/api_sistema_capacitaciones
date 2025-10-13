import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { RolPermiso } from 'src/rol-permiso/entities/rol-permiso.entity';

@Entity('ROL')
export class Rol {
    @PrimaryGeneratedColumn({ name: 'ID_ROL' })
    ID_ROL: number;

    @Column({ name: 'NOMBRE', type: 'varchar', length: 50, nullable: false, unique: true })
    NOMBRE: string;

    @Column({ name: 'DESCRIPCION', type: 'varchar', length: 255, nullable: true })
    DESCRIPCION: string;

    @Column({ name: 'ESTADO', type: 'bit', default: 1, nullable: false })
    ESTADO: boolean;
    
    // Relación Many-to-Many con PERMISO a través de RolPermiso
    @OneToMany(() => RolPermiso, rolPermiso => rolPermiso.ROL)
    ROL_PERMISOS: RolPermiso[];
}
