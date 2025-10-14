import { IsString, IsNotEmpty, MaxLength, IsInt } from 'class-validator';

export class CreatePermisoDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    CLAVE: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    NOMBRE: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(255)
    DESCRIPCION: string;

    @IsInt()
    @IsNotEmpty()
    CATEGORIA_ID: number;
}
