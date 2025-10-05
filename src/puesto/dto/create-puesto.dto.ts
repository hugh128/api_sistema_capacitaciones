import { IsString, IsNotEmpty, MaxLength, IsOptional, IsInt } from 'class-validator';

export class CreatePuestoDto {
    @IsString()
    @IsNotEmpty({ message: 'El nombre del puesto es requerido.' })
    @MaxLength(100)
    nombre: string;

    @IsString()
    @IsOptional()
    @MaxLength(255)
    descripcion?: string;

    @IsInt()
    @IsNotEmpty({ message: 'El ID del departamento es requerido.' })
    departamentoId: number;

    @IsOptional()
    estado?: boolean;
}
