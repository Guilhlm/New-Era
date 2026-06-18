import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';
import {
  MAX_PASSWORD_LENGTH,
  MIN_PASSWORD_LENGTH,
} from '../../../common/auth/password.util';

/** Etapa 1: solicita o envio de um token de redefinição (e-mail + CPF). */
export class RequestPasswordResetDto {
  @IsEmail()
  @MaxLength(254)
  email!: string;

  @IsString()
  @MaxLength(20)
  cpf!: string;
}

/** Etapa 2: confirma a redefinição usando o token de uso único. */
export class ResetPasswordDto {
  @IsString()
  @MinLength(16)
  @MaxLength(128)
  token!: string;

  @IsString()
  @MinLength(MIN_PASSWORD_LENGTH)
  @MaxLength(MAX_PASSWORD_LENGTH)
  newPassword!: string;
}
