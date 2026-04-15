import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { comparePassword, hashPassword, MIN_PASSWORD_LENGTH } from '../../common/auth/password.util';
import { normalizeCpf, normalizeEmail } from '../../common/auth/normalize.util';
import type { JwtPayload } from '../../common/auth/auth.types';
import type { RegisterDto } from './dto/register.dto';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async register(payload: RegisterDto) {
    const user = await this.userService.create(payload);

    return this.signToken(user.id, user.email);
  }

  /**
   * Verifies email + CPF belong to the same user, then sets the new password.
   */
  async resetPassword(email: string, cpfRaw: string, newPassword: string) {
    const emailNorm = normalizeEmail(email);
    const cpfDigits = normalizeCpf(cpfRaw);
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

    const passwordHash = await hashPassword(pass);
    await this.userService.update(user.id, { passwordHash });

    return { ok: true as const };
  }

  async login(identifier: string, password: string) {
    const trimmed = identifier.trim();
    const user = trimmed.includes('@')
      ? await this.userService.findByEmail(normalizeEmail(trimmed))
      : await this.userService.findByCpf(normalizeCpf(trimmed));
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isValid = await comparePassword(password, user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.signToken(user.id, user.email);
  }

  async getMe(userId: string) {
    const user = await this.userService.findOne(userId);
    if (!user) {
      throw new UnauthorizedException();
    }
    const { passwordHash: _omit, ...safe } = user;
    return safe;
  }

  private signToken(userId: string, email: string) {
    const payload: JwtPayload = {
      sub: userId,
      email,
    };
    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
    };
  }
}
