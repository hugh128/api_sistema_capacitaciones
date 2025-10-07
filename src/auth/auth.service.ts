import { HttpException, Injectable, UnauthorizedException } from "@nestjs/common";
import { UsuarioService } from "src/usuario/usuario.service";
import { JwtService } from "@nestjs/jwt";
import { HashingService } from "src/common/hashing.service";
import { DatabaseErrorService } from "src/common/database-error.service";

@Injectable()
export class AuthService {
  constructor(
    private readonly usuarioService: UsuarioService,
    private readonly jwtService: JwtService,
    private readonly hashingService: HashingService,
    private readonly databaseErrorService: DatabaseErrorService,
  ) {}

  async login(username: string, password: string) {
    try {
      const usuario = await this.usuarioService.findByUsername(username);

      if (!usuario) {
        throw new UnauthorizedException('Usuario no encontrado');
      }

      const isPasswordValid = await this.hashingService.compare(password, usuario.PASSWORD);

      if (!isPasswordValid) {
        throw new UnauthorizedException('Credenciales invalidas');
      }

      const payload = { 
          username: usuario.USERNAME, 
          sub: usuario.ID_USUARIO, 
          role: 'rrhh'
      };

      const token = this.jwtService.sign(payload); 

      const usuarioAuth = {
        id: usuario.ID_USUARIO,
        username: usuario.USERNAME,
        email: usuario.PERSONA.CORREO,
        nombre: usuario.PERSONA.NOMBRE,
        apellido: usuario.PERSONA.APELLIDO,
        telefono: usuario.PERSONA.TELEFONO,
        dpi: usuario.PERSONA.DPI,
        puesto: usuario.PERSONA.PUESTO.NOMBRE,
        departamento: usuario.PERSONA.DEPARTAMENTO.NOMBRE,
        roles: [
          {
            id: "1",
            nombre: "RRHH",
            permisos: ["all"],
          },
        ],
        estado: usuario.ESTADO ? "activo" : "inactivo"
      }

      console.log("Usuario autenticado")
      console.log(usuarioAuth)

      return { 
        message: "Inicio de sesion exitoso",
        usuario: { data: usuarioAuth, token }
      };

    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      
      this.databaseErrorService.handle(error);
    }
  }
}
