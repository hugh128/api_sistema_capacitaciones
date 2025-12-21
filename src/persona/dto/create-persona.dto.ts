import { 
    IsString, IsNotEmpty, IsEmail, MaxLength, IsOptional, 
    IsDateString, IsIn, IsInt
} from 'class-validator';

export class CreatePersonaDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    NOMBRE: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    APELLIDO: string;

    @IsEmail()
    @IsOptional()
    @MaxLength(150)
    CORREO?: string;

    @IsString()
    @IsOptional()
    @MaxLength(20)
    TELEFONO?: string;

    @IsString()
    @IsOptional()
    @MaxLength(50)
    DPI?: string;

    @IsDateString()
    @IsOptional()
    FECHA_NACIMIENTO?: Date;

    @IsString()
    @IsIn(['INTERNO', 'EXTERNO'], { message: "TIPO_PERSONA debe ser 'INTERNO' o 'EXTERNO'." })
    TIPO_PERSONA: 'INTERNO' | 'EXTERNO';

    @IsDateString()
    @IsOptional()
    FECHA_INGRESO?: Date;
    
    // FKs
    @IsInt()
    @IsOptional()
    EMPRESA_ID?: number;

    @IsInt()
    @IsOptional()
    DEPARTAMENTO_ID?: number;

    @IsInt()
    @IsOptional()
    PUESTO_ID?: number;

    @IsOptional()
    ESTADO?: boolean;

    @IsInt()
    USUARIO_ACCION_ID: number;
}
