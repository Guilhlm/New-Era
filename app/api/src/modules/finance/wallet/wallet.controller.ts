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
import { CreateWalletDto, UpdateWalletDto } from './dto/wallet.dto';
import { WalletService } from './wallet.service';

@Controller('finance/wallet')
@UseGuards(JwtAuthGuard)
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Post()
  create(@Req() req: AuthenticatedRequest, @Body() data: CreateWalletDto) {
    return this.walletService.create(req.user.userId, data);
  }

  @Get()
  findAll(@Req() req: AuthenticatedRequest) {
    return this.walletService.findByUser(req.user.userId);
  }

  @Get(':id')
  findOne(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.walletService.findOne(id, req.user.userId);
  }

  @Patch(':id')
  update(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() data: UpdateWalletDto,
  ) {
    return this.walletService.update(id, req.user.userId, data);
  }

  @Delete(':id')
  remove(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.walletService.remove(id, req.user.userId);
  }
}
