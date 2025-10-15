import { IsInt, IsNotEmpty, IsString, MaxLength} from 'class-validator';    
export class CreateDocumentoAsociadoDto {
    @IsString()
    @IsNotEmpty({ message: 'El código del documento asociado es obligatorio.' })
    @MaxLength(20)    
    CODIGO: string;

    @IsString()
    @IsNotEmpty({ message: 'El nombre del documento asociado es obligatorio.' })
    @MaxLength(255)
    NOMBRE_DOCUMENTO: string;

    @IsInt()
    @IsNotEmpty({ message: 'El ID del documento padre es obligatorio.' })
    DOCUMENTO_ID: number; 

    @IsNotEmpty({ message: 'El estatus del documento asociado es obligatorio.' })   
    ESTATUS?: boolean;  

}
