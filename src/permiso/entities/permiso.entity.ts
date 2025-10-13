import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { CategoriaPermiso } from 'src/categoria-permiso/entities/categoria-permiso.entity';
//import { RolPermiso } from './rol-permiso.entity';

@Entity('PERMISO')
export class Permiso {
    @PrimaryGeneratedColumn({ name: 'ID_PERMISO' })
    ID_PERMISO: number;

    @Column({ name: 'CLAVE', type: 'nvarchar', length: 100, nullable: false })
    CLAVE: string;

    @Column({ name: 'NOMBRE', type: 'nvarchar', length: 100, nullable: false })
    NOMBRE: string;

    @Column({ name: 'DESCRIPCION', type: 'nvarchar', length: 255, nullable: false })
    DESCRIPCION: string;

    @Column({ name: 'CATEGORIA_ID', nullable: false })
    CATEGORIA_ID: number;

    // Relación Many-to-One con CATEGORIA_PERMISO
    @ManyToOne(() => CategoriaPermiso, categoria => categoria.PERMISOS, { onDelete: 'NO ACTION', onUpdate: 'CASCADE' })
    @JoinColumn({ name: 'CATEGORIA_ID' })
    CATEGORIA: CategoriaPermiso;
    
    // Relación Many-to-Many con ROL a través de RolPermiso
/*     @OneToMany(() => RolPermiso, rolPermiso => rolPermiso.PERMISO)
    ROL_PERMISOS: RolPermiso[]; */
}