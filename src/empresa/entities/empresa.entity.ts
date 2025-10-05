import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: 'EMPRESA' })
export class Empresa {
  @PrimaryGeneratedColumn()
  ID_EMPRESA: number;

  @Column()
  NOMBRE: string;

  @Column({ nullable: true })
  DIRECCION: string;

  @Column({ nullable: true })
  NIT: string;

  @Column({ nullable: true })
  TELEFONO: string;

  @Column({ nullable: true })
  CORREO: string;

  @Column({ default: 1 })
  ESTADO: boolean;

  @Column({ type: 'datetime', default: () => 'GETDATE()' })
  FECHA_CREACION: Date;
}
