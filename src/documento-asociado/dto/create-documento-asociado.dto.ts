import { IsDateString, IsInt, IsNotEmpty, IsOptional, IsString, MaxLength} from 'class-validator';    
export class CreateDocumentoAsociadoDto {
    @IsString()
    @IsNotEmpty({ message: 'El código del documento asociado es obligatorio.' })
    @MaxLength(20)    
    CODIGO: string;

    @IsString()
    @IsNotEmpty({ message: 'El nombre del documento asociado es obligatorio.' })
    @MaxLength(255)
    NOMBRE_DOCUMENTO: string;

    @IsDateString()
    @IsOptional()
    FECHA_APROBACION?: Date;

    @IsNotEmpty({ message: 'La versión es obligatoria.' })
    @IsInt({ message: 'La versión debe ser un número entero.' })
    VERSION: number;

    @IsNotEmpty({ message: 'El estatus es obligatorio.' })
    @IsString({ message: 'El estatus debe ser una cadena de texto.' })
    @MaxLength(20, { message: 'El estatus no puede exceder los 20 caracteres.' })
    ESTATUS: string;

    @IsInt()
    @IsNotEmpty({ message: 'El ID del documento padre es obligatorio.' })
    DOCUMENTO_ID: number;

}
