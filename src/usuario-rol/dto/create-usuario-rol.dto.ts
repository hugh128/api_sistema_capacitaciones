import { IsInt, IsNotEmpty } from 'class-validator';

export class CreateUsuarioRolDto {
    @IsInt()
    @IsNotEmpty({ message: 'El ID del usuario es obligatorio.' })
    ID_USUARIO: number;

    @IsInt()
    @IsNotEmpty({ message: 'El ID del rol es obligatorio.' })
    ID_ROL: number;
}
