import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async register(payload: Record<string, unknown>) {
    const user = await this.userService.create(payload);

    return this.signToken(user.id, user.email);
  }

  async login(email: string, password: string) {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    return this.signToken(user.id, user.email);
  }

  private signToken(userId: string, email: string) {
    const accessToken = this.jwtService.sign({
      sub: userId,
      email,
    });

    return {
      accessToken,
    };
  }
}
