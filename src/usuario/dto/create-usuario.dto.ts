import { 
    IsInt, IsNotEmpty, IsString, MaxLength, IsOptional, 
    ArrayMinSize, ArrayUnique, IsDateString
} from 'class-validator';

export class CreateUsuarioDto {
    @IsInt()
    @IsNotEmpty({ message: 'El ID de la persona es requerido para crear un usuario.' })
    PERSONA_ID: number;

    @IsString()
    @IsNotEmpty()
    @MaxLength(50)
    USERNAME: string;

    @IsString()
    @IsNotEmpty({ message: 'La contraseña es requerida.' })
    @MaxLength(255)
    PASSWORD: string; 

    @IsOptional()
    ESTADO?: boolean;

    @IsInt()
    USUARIO_ACCION_ID: number;
    
    @IsDateString()
    @IsOptional()
    ULTIMO_ACCESO?: Date; 
    
    // Roles asociados al usuario
    @IsInt({ each: true })
    @ArrayMinSize(1, { message: 'El usuario debe tener al menos un rol.' })
    @ArrayUnique()
    ID_ROLES: number[];
}
