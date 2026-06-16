import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { AuthenticatedRequest } from '../../../common/auth/auth.types';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import {
  CreateTransactionDto,
  UpdateTransactionDto,
} from './dto/transaction.dto';
import { TransactionService } from './transaction.service';

@Controller('finance/transactions')
@UseGuards(JwtAuthGuard)
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post()
  create(@Req() req: AuthenticatedRequest, @Body() data: CreateTransactionDto) {
    return this.transactionService.create(req.user.userId, data);
  }

  @Get()
  findAll(@Req() req: AuthenticatedRequest) {
    return this.transactionService.findByUser(req.user.userId);
  }

  @Get(':id')
  findOne(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.transactionService.findOne(id, req.user.userId);
  }

  @Patch(':id')
  update(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() data: UpdateTransactionDto,
  ) {
    return this.transactionService.update(id, req.user.userId, data);
  }

  @Delete(':id')
  remove(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.transactionService.remove(id, req.user.userId);
  }
}
