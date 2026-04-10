import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() payload: Record<string, unknown>) {
    return this.authService.register(payload);
  }

  @Post('reset-password')
  resetPassword(
    @Body('email') email?: string,
    @Body('cpf') cpf?: string,
    @Body('newPassword') newPassword?: string,
  ) {
    return this.authService.resetPassword(
      email ?? '',
      cpf ?? '',
      newPassword ?? '',
    );
  }

  @Post('login')
  login(
    @Body('password') password: string,
    @Body('identifier') identifier?: string,
    @Body('email') email?: string,
    @Body('cpf') cpf?: string,
  ) {
    const id = identifier ?? email ?? cpf ?? '';
    return this.authService.login(id, password);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@Req() req: { user: unknown }) {
    return req.user;
  }
}
