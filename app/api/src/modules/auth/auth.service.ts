import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserService } from '../user/user.service';

const MIN_PASSWORD_LENGTH = 6;

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async register(payload: Record<string, unknown>) {
    const user = await this.userService.create(payload);

    return this.signToken(user.id, user.email);
  }

  /**
   * Verifies email + CPF belong to the same user, then sets the new password.
   */
  async resetPassword(email: string, cpfRaw: string, newPassword: string) {
    const emailNorm = email.trim().toLowerCase();
    const cpfDigits = cpfRaw.replace(/\D/g, '');
    const pass = newPassword?.trim() ?? '';

    if (!emailNorm || cpfDigits.length !== 11) {
      throw new BadRequestException('Enter a valid email and CPF.');
    }
    if (pass.length < MIN_PASSWORD_LENGTH) {
      throw new BadRequestException(
        `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`,
      );
    }

    const user = await this.userService.findByEmail(emailNorm);
    if (!user?.cpf || user.cpf !== cpfDigits) {
      throw new UnauthorizedException(
        'Email and CPF do not match the same account.',
      );
    }

    const passwordHash = await bcrypt.hash(pass, 10);
    await this.userService.update(user.id, { passwordHash });

    return { ok: true as const };
  }

  async login(identifier: string, password: string) {
    const trimmed = identifier.trim();
    const user = trimmed.includes('@')
      ? await this.userService.findByEmail(trimmed.toLowerCase())
      : await this.userService.findByCpf(trimmed.replace(/\D/g, ''));
    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    return this.signToken(user.id, user.email);
  }

  private signToken(userId: string, email: string) {
    const accessToken = this.jwtService.sign({
      sub: userId,
      email,
    });

    return {
      accessToken,
    };
  }
}
