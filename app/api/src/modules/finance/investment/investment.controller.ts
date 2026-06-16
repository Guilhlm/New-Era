import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { AuthenticatedRequest } from '../../../common/auth/auth.types';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import {
  CreateInvestmentDto,
  DepositFundsDto,
  type FinanceTab,
  RegisterPositionDto,
  TradeInvestmentDto,
  UpdateInvestmentDto,
  WithdrawFundsDto,
} from './dto/investment.dto';
import { InvestmentService } from './investment.service';

@Controller('finance/investments')
@UseGuards(JwtAuthGuard)
export class InvestmentController {
  constructor(private readonly investmentService: InvestmentService) {}

  @Post()
  create(@Req() req: AuthenticatedRequest, @Body() data: CreateInvestmentDto) {
    return this.investmentService.create(req.user.userId, data);
  }

  @Post('register')
  register(@Req() req: AuthenticatedRequest, @Body() data: RegisterPositionDto) {
    return this.investmentService.registerPosition(req.user.userId, data);
  }

  @Post('deposit')
  deposit(@Req() req: AuthenticatedRequest, @Body() data: DepositFundsDto) {
    return this.investmentService.depositFunds(req.user.userId, data);
  }

  @Post('withdraw')
  withdraw(@Req() req: AuthenticatedRequest, @Body() data: WithdrawFundsDto) {
    return this.investmentService.withdrawFunds(req.user.userId, data);
  }

  @Get()
  findAll(
    @Req() req: AuthenticatedRequest,
    @Query('tab') tab?: FinanceTab,
  ) {
    return this.investmentService.findByUser(req.user.userId, tab);
  }

  @Get(':id')
  findOne(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.investmentService.findOne(id, req.user.userId);
  }

  @Patch(':id')
  update(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() data: UpdateInvestmentDto,
  ) {
    return this.investmentService.update(id, req.user.userId, data);
  }

  @Post(':id/trade')
  trade(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() data: TradeInvestmentDto,
  ) {
    return this.investmentService.trade(id, req.user.userId, data);
  }

  @Delete(':id')
  remove(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.investmentService.remove(id, req.user.userId);
  }
}
