import { IsOptional, IsString, MaxLength } from 'class-validator';

export class LoginDto {
  @IsString()
  @MaxLength(128)
  password!: string;

  @IsOptional()
  @IsString()
  @MaxLength(254)
  identifier?: string;

  @IsOptional()
  @IsString()
  @MaxLength(254)
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  cpf?: string;
}
