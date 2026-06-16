import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { assertResourceExists } from '../../common/auth/ownership.util';
import { USER_PUBLIC_SELECT } from '../../common/auth/user.select';
import { PrismaService } from '../../prisma/prisma.service';
import { hashPassword } from '../../common/auth/password.util';
import { normalizeCpf, normalizeEmail } from '../../common/auth/normalize.util';
import type { CreateUserDto } from './dto/create-user.dto';
import type { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateUserDto) {
    const payload: Prisma.UserCreateInput = {
      name: data.name.trim(),
      email: normalizeEmail(data.email),
      passwordHash: await hashPassword(data.password),
      cpf: data.cpf ? normalizeCpf(data.cpf) : null,
      phone: data.phone ?? null,
      birthDate: data.birthDate ? new Date(data.birthDate) : null,
      monthlyIncome: data.monthlyIncome ?? null,
      photoUser: data.photoUser ?? null,
    };

    try {
      const user = await this.prisma.user.create({
        data: payload,
        select: USER_PUBLIC_SELECT,
      });
      return user;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          'An account with this CPF or email already exists.',
        );
      }
      throw error;
    }
  }

  findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  findByCpf(cpfDigits: string) {
    if (!cpfDigits) return null;
    return this.prisma.user.findUnique({ where: { cpf: cpfDigits } });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: USER_PUBLIC_SELECT,
    });
    return assertResourceExists(user, 'User');
  }

  async updatePassword(id: string, passwordHash: string) {
    return this.prisma.user.update({
      where: { id },
      data: { passwordHash },
      select: USER_PUBLIC_SELECT,
    });
  }

  async update(id: string, requestUserId: string, data: UpdateUserDto) {
    if (id !== requestUserId) {
      throw new ForbiddenException('You can only update your own profile.');
    }

    const payload: Prisma.UserUpdateInput = {};
    if (data.name !== undefined) payload.name = data.name.trim();
    if (data.email !== undefined) payload.email = normalizeEmail(data.email);
    if (data.phone !== undefined) payload.phone = data.phone;
    if (data.birthDate !== undefined) {
      payload.birthDate = data.birthDate ? new Date(data.birthDate) : null;
    }
    if (data.monthlyIncome !== undefined) {
      payload.monthlyIncome = data.monthlyIncome;
    }
    if (data.photoUser !== undefined) payload.photoUser = data.photoUser;
    if (data.password && data.password.trim().length > 0) {
      payload.passwordHash = await hashPassword(data.password.trim());
    }

    if (Object.keys(payload).length === 0) {
      throw new BadRequestException('Nothing to update.');
    }

    try {
      return await this.prisma.user.update({
        where: { id },
        data: payload,
        select: USER_PUBLIC_SELECT,
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          'An account with this CPF or email already exists.',
        );
      }
      throw error;
    }
  }

  async remove(id: string, requestUserId: string) {
    if (id !== requestUserId) {
      throw new ForbiddenException('You can only delete your own account.');
    }
    const user = await this.prisma.user.delete({
      where: { id },
      select: USER_PUBLIC_SELECT,
    });
    return user;
  }
}
