import { Entity, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Usuario } from 'src/usuario/entities/usuario.entity';
import { Rol } from 'src/rol/entities/rol.entity';

@Entity('USUARIO_ROL')
export class UsuarioRol {
    @PrimaryColumn({ name: 'ID_USUARIO' })
    ID_USUARIO: number;

    @PrimaryColumn({ name: 'ID_ROL' })
    ID_ROL: number;

    // Relación Many-to-One a USUARIO
    @ManyToOne(() => Usuario, usuario => usuario.USUARIO_ROLES)
    @JoinColumn({ name: 'ID_USUARIO' })
    USUARIO: Usuario;

    // Relación Many-to-One a ROL
    @ManyToOne(() => Rol, rol => rol.USUARIO_ROLES)
    @JoinColumn({ name: 'ID_ROL' })
    ROL: Rol;
}
