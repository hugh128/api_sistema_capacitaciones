import { IsString, IsNotEmpty, MaxLength, IsOptional } from 'class-validator';

export class CreateDepartamentoDto {
    @IsString()
    @IsNotEmpty({ message: 'El nombre del departamento es requerido.' })
    @MaxLength(100)
    NOMBRE: string;

    @IsString()
    @IsOptional()
    @MaxLength(255)
    DESCRIPCION?: string;

    @IsOptional()
    ESTADO?: boolean;
}
