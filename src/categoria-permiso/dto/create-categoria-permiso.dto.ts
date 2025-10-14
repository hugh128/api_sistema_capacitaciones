import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateCategoriaPermisoDto {
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
}
