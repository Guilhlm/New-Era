import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { WalletService } from './wallet.service';

@Controller('finance/wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Post()
  create(@Body() data: Record<string, unknown>) {
    return this.walletService.create(data);
  }

  @Get()
  findAll() {
    return this.walletService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.walletService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() data: Record<string, unknown>) {
    return this.walletService.update(id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.walletService.remove(id);
  }
}
