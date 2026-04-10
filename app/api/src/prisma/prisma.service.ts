import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit() {
    try {
      await this.$connect();
    } catch (error) {
      this.logger.warn(
        `Falha ao conectar no banco durante bootstrap. A API seguirá ativa e tentará conectar sob demanda. Motivo: ${String(error)}`,
      );
    }
  }
}
