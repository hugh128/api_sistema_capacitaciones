import { IsString, IsNotEmpty, MinLength, MaxLength, IsInt } from 'class-validator';

export class UpdatePasswordDto {
    @IsString()
    @IsNotEmpty({ message: 'La contraseña es requerida.' })
    @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres.' })
    @MaxLength(255)
    PASSWORD: string;

    @IsInt()
    USUARIO_ACCION_ID: number;
}