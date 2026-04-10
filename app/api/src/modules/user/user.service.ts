import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Record<string, unknown>) {
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
      passwordHash: bcrypt.hashSync(passwordToHash, 10),
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

  update(id: string, data: Record<string, unknown>) {
    return this.prisma.user.update({ where: { id }, data: data as any });
  }

  remove(id: string) {
    return this.prisma.user.delete({ where: { id } });
  }
}
