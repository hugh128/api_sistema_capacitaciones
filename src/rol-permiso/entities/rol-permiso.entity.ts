import { Entity, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Rol } from 'src/rol/entities/rol.entity';
import { Permiso } from 'src/permiso/entities/permiso.entity';

@Entity('ROL_PERMISO')
export class RolPermiso {
    @PrimaryColumn({ name: 'ROL_ID' })
    ROL_ID: number;

    @PrimaryColumn({ name: 'PERMISO_ID' })
    PERMISO_ID: number;

    // Relación Many-to-One a ROL
    @ManyToOne(() => Rol, rol => rol.ROL_PERMISOS, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'ROL_ID' })
    ROL: Rol;

    // Relación Many-to-One a PERMISO
    @ManyToOne(() => Permiso, permiso => permiso.ROL_PERMISOS, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'PERMISO_ID' })
    PERMISO: Permiso;
}