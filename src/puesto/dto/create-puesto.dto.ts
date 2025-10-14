import { IsString, IsNotEmpty, MaxLength, IsOptional, IsInt } from 'class-validator';

export class CreatePuestoDto {
    @IsString()
    @IsNotEmpty({ message: 'El nombre del puesto es requerido.' })
    @MaxLength(100)
    NOMBRE: string;

    @IsString()
    @IsOptional()
    @MaxLength(255)
    DESCRIPCION?: string;

    @IsInt()
    @IsNotEmpty({ message: 'El ID del departamento es requerido.' })
    DEPARTAMENTO_ID: number;

    @IsOptional()
    ESTADO?: boolean;
}
