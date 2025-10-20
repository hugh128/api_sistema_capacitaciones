import{ IsString, IsNotEmpty, IsDateString, IsOptional, MaxLength, IsInt } from 'class-validator';

export class CreateDocumentoDto {
    @IsString()
    @IsNotEmpty({ message: 'El código del documento es obligatorio.' })
    @MaxLength(20)
    CODIGO: string;

    @IsString()
    @IsNotEmpty({ message: 'El tipo de documento es obligatorio.' })
    @MaxLength(10)
    TIPO_DOCUMENTO: string;

    @IsString()
    @IsNotEmpty({ message: 'El nombre del documento es obligatorio.' })
    @MaxLength(255)
    NOMBRE_DOCUMENTO: string;

    @IsDateString()
    @IsOptional()
    APROBACION?: Date;

    @IsNotEmpty({ message: 'La versión es obligatoria.' })
    @IsInt({ message: 'La versión debe ser un número entero.' })
    VERSION: number;

    @IsNotEmpty({ message: 'El estatus del documento es obligatorio.' })
    @IsString({ message: 'El estatus debe ser una cadena de texto.' })
    @MaxLength(20, { message: 'El estatus no puede exceder los 20 caracteres.' })
    ESTATUS: string;

    @IsNotEmpty({ message: 'El código de departamento es obligatorio.' })
    @IsString({ message: 'El código de departamento debe ser una cadena de texto.' })
    @MaxLength(20, { message: 'El código de departamento no puede exceder los 20 caracteres.' })
    DEPARTAMENTO_CODIGO: string;

}
