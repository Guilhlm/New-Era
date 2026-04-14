import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { hashPassword, hashPasswordSync } from '../../common/auth/password.util';
import type { CreateUserDto } from './dto/create-user.dto';
import type { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  create(data: CreateUserDto) {
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

    return this.prisma.user.create({ data: payload as any });
  }

  findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  findByCpf(cpfDigits: string) {
    if (!cpfDigits) return null;
    return this.prisma.user.findUnique({ where: { cpf: cpfDigits } });
  }

  findAll() {
    return this.prisma.user.findMany();
  }

  findOne(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async update(id: string, data: UpdateUserDto) {
    const { password, ...rest } = data;
    const payload: Record<string, unknown> = { ...rest };
    if (typeof password === 'string' && password.trim().length > 0) {
      payload.passwordHash = await hashPassword(password.trim());
    }
    return this.prisma.user.update({ where: { id }, data: payload as any });
  }

  remove(id: string) {
    return this.prisma.user.delete({ where: { id } });
  }
}
