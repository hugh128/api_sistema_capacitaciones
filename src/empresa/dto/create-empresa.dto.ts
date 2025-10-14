import { 
    IsString, IsNotEmpty, MaxLength, IsOptional, IsEmail
} from 'class-validator';

export class CreateEmpresaDto {
    @IsString()
    @IsNotEmpty({ message: 'El nombre de la empresa es obligatorio.' })
    @MaxLength(200)
    NOMBRE: string;

    @IsString()
    @IsOptional()
    @MaxLength(255)
    DIRECCION?: string;

    @IsString()
    @IsOptional()
    @MaxLength(20)
    NIT?: string;

    @IsString()
    @IsOptional()
    @MaxLength(20)
    TELEFONO?: string;

    @IsEmail()
    @IsOptional()
    @MaxLength(150)
    CORREO?: string;

    @IsOptional()
    ESTADO?: boolean;
}
