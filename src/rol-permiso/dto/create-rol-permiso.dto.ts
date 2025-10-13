import { IsInt, IsNotEmpty } from 'class-validator';

export class CreateRolPermisoDto {
    @IsInt()
    @IsNotEmpty({ message: 'El ID del Rol es obligatorio.' })
    ROL_ID: number;

    @IsInt()
    @IsNotEmpty({ message: 'El ID del Permiso es obligatorio.' })
    PERMISO_ID: number;
}
