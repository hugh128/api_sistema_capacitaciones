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

      return { 
        message: "Inicio de sesion exitoso",
        usuario: { id: usuario.ID_USUARIO, nombre: usuario.USERNAME, token }
      };

    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      
      this.databaseErrorService.handle(error);
    }
  }
}
