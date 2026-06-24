import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { createHash, randomBytes } from 'node:crypto';
import {
  comparePassword,
  hashPassword,
  MIN_PASSWORD_LENGTH,
} from '../../common/auth/password.util';
import { normalizeCpf, normalizeEmail } from '../../common/auth/normalize.util';
import type { JwtPayload } from '../../common/auth/auth.types';
import type { RegisterDto } from './dto/register.dto';
import { UserService } from '../user/user.service';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  /** Janela curta de validade do token de redefinição de senha. */
  private readonly RESET_TOKEN_TTL_MS = 15 * 60_000;

  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async register(payload: RegisterDto) {
    if (process.env.APP_MODE === 'desktop') {
      const count = await this.prisma.user.count();
      if (count >= 2) {
        throw new ConflictException({
          code: 'DESKTOP_USER_LIMIT',
          message:
            'Local account limit of 2 reached. Delete an account in Profile before registering another.',
        });
      }
    }

    const user = await this.userService.create(payload);

    return this.signToken(user.id, user.email);
  }

  private hashResetToken(token: string) {
    return createHash('sha256').update(token).digest('hex');
  }

  /**
   * Etapa 1 do reset: verifica e-mail + CPF e, se conferirem, emite um token
   * de uso único com validade curta. A resposta é sempre genérica para evitar
   * enumeração de contas.
   *
   * ENTREGA INTERINA: ainda não há provedor de e-mail. O token é registrado
   * apenas no log do servidor e NUNCA retornado pela API. Ao integrar um
   * provedor, substituir o log por um MailService (o restante do fluxo já é seguro).
   */
  async requestPasswordReset(email: string, cpfRaw: string) {
    const emailNorm = normalizeEmail(email);
    const cpfDigits = normalizeCpf(cpfRaw);

    if (!emailNorm || cpfDigits.length !== 11) {
      return { ok: true as const };
    }

    const user = await this.userService.findByEmail(emailNorm);
    if (!user?.cpf || user.cpf !== cpfDigits) {
      this.logger.warn('Password reset requested with email/CPF mismatch.');
      return { ok: true as const };
    }

    const rawToken = randomBytes(32).toString('hex');
    const tokenHash = this.hashResetToken(rawToken);
    const expiresAt = new Date(Date.now() + this.RESET_TOKEN_TTL_MS);

    await this.prisma.$transaction(async (tx) => {
      await tx.passwordResetToken.updateMany({
        where: { userId: user.id, usedAt: null },
        data: { usedAt: new Date() },
      });
      await tx.passwordResetToken.create({
        data: { userId: user.id, tokenHash, expiresAt },
      });
    });

    this.logger.warn(
      `[PASSWORD RESET] token for ${emailNorm} (expires ${expiresAt.toISOString()}): ${rawToken}`,
    );

    return { ok: true as const };
  }

  /**
   * Etapa 2 do reset: troca a senha mediante token válido, não usado e não
   * expirado. O token é consumido (marcado como usado) na mesma transação.
   */
  async confirmPasswordReset(token: string, newPassword: string) {
    const cleanToken = token.trim();
    const pass = newPassword.trim();

    if (!cleanToken || pass.length < MIN_PASSWORD_LENGTH) {
      throw new BadRequestException('Invalid token or password.');
    }

    const tokenHash = this.hashResetToken(cleanToken);
    const record = await this.prisma.passwordResetToken.findUnique({
      where: { tokenHash },
    });

    if (!record || record.usedAt || record.expiresAt.getTime() < Date.now()) {
      this.logger.warn('Invalid or expired password reset token used.');
      throw new UnauthorizedException('Invalid or expired reset token.');
    }

    const passwordHash = await hashPassword(pass);
    await this.prisma.$transaction(async (tx) => {
      const consumed = await tx.passwordResetToken.updateMany({
        where: { id: record.id, usedAt: null },
        data: { usedAt: new Date() },
      });
      if (consumed.count === 0) {
        throw new UnauthorizedException('Invalid or expired reset token.');
      }
      await tx.user.update({
        where: { id: record.userId },
        data: { passwordHash },
      });
    });

    this.logger.log(`Password reset completed for user ${record.userId}`);
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
