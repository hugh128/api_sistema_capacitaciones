import{ IsString, IsNotEmpty, IsDateString, IsOptional, MaxLength } from 'class-validator';

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

    @IsNotEmpty({ message: 'El estatus del documento es obligatorio.' })
    ESTATUS?: boolean;
}
