import { ConflictException, ForbiddenException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { assertResourceExists, assertResourceOwner } from '../../common/auth/ownership.util';
import { USER_PUBLIC_SELECT, omitPasswordHash } from '../../common/auth/user.select';
import { PrismaService } from '../../prisma/prisma.service';
import {
  hashPassword,
  hashPasswordSync,
} from '../../common/auth/password.util';
import type { CreateUserDto } from './dto/create-user.dto';
import type { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateUserDto) {
    const {
      password: rawPassword,
      passwordHash: incomingPasswordHash,
      ...rest
    } = data;
    const passwordToHash =
      (rawPassword as string | undefined) ??
      (incomingPasswordHash as string | undefined) ??
      'changeme123';
    const payload = {
      ...rest,
      passwordHash: hashPasswordSync(passwordToHash),
    };

    try {
      const user = await this.prisma.user.create({ data: payload as any });
      return omitPasswordHash(user);
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

  findAll() {
    return this.prisma.user.findMany({ select: USER_PUBLIC_SELECT });
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

    const { password, ...rest } = data;
    const payload: Record<string, unknown> = { ...rest };
    if (typeof password === 'string' && password.trim().length > 0) {
      payload.passwordHash = await hashPassword(password.trim());
    }
    const user = await this.prisma.user.update({
      where: { id },
      data: payload as any,
      select: USER_PUBLIC_SELECT,
    });
    return user;
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
