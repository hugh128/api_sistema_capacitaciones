import { Type } from 'class-transformer';
import { IsString, IsNotEmpty, MaxLength, IsArray, ArrayMinSize, IsInt } from 'class-validator';

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

    @IsArray()
    @ArrayMinSize(1, { message: 'Debe seleccionar al menos un permiso backend' })
    @IsInt({ each: true, message: 'each value in PERMISOS_IDS must be an integer number' })
    @Type(() => Number)
    PERMISOS_IDS: number[];
}
