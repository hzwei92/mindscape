import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { UsersService } from '../users/users.service';
import TokenPayload from './tokenPayload.interface';

@Injectable()
export class JwtAuthStrategy extends PassportStrategy(Strategy, 'jwt-auth') {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([(request: Request) => {
        return request.headers.accesstoken;
      }]),
      secretOrKey: configService.get('JWT_ACCESS_TOKEN_SECRET')
    });
  }
 
  async validate(payload: TokenPayload) {
    return this.usersService.getUserById(payload.userId);
  }
}