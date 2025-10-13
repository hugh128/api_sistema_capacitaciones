import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
//import { Permiso } from './permiso.entity';

@Entity('CATEGORIA_PERMISO')
export class CategoriaPermiso {
    @PrimaryGeneratedColumn({ name: 'ID_CATEGORIA' })
    ID_CATEGORIA: number;

    @Column({ name: 'CLAVE', type: 'nvarchar', length: 100, nullable: false })
    CLAVE: string;

    @Column({ name: 'NOMBRE', type: 'nvarchar', length: 100, nullable: false })
    NOMBRE: string;

    @Column({ name: 'DESCRIPCION', type: 'nvarchar', length: 255, nullable: false })
    DESCRIPCION: string;

    // Relación One-to-Many con PERMISO
/*     @OneToMany(() => Permiso, permiso => permiso.CATEGORIA)
    PERMISOS: Permiso[]; */
}