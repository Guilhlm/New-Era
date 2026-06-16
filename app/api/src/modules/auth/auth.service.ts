import {
  BadRequestException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { comparePassword, hashPassword } from '../../common/auth/password.util';
import { normalizeCpf, normalizeEmail } from '../../common/auth/normalize.util';
import type { JwtPayload } from '../../common/auth/auth.types';
import type { RegisterDto } from './dto/register.dto';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

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
   * Responses are intentionally generic to avoid account enumeration.
   * NOTE: a single-use emailed token flow should replace this once an
   * e-mail provider is available (documented as a remaining risk).
   */
  async resetPassword(email: string, cpfRaw: string, newPassword: string) {
    const emailNorm = normalizeEmail(email);
    const cpfDigits = normalizeCpf(cpfRaw);
    const pass = newPassword.trim();

    if (!emailNorm || cpfDigits.length !== 11) {
      throw new BadRequestException('Enter a valid email and CPF.');
    }

    const user = await this.userService.findByEmail(emailNorm);
    if (!user?.cpf || user.cpf !== cpfDigits) {
      this.logger.warn('Failed password reset attempt (email/CPF mismatch).');
      throw new UnauthorizedException(
        'Unable to reset password with the provided information.',
      );
    }

    const passwordHash = await hashPassword(pass);
    await this.userService.updatePassword(user.id, passwordHash);
    this.logger.log(`Password reset completed for user ${user.id}`);

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
    return this.userService.findOne(userId);
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
