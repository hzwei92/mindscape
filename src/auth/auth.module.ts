import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthResolver } from './auth.resolver';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from 'src/users/users.module';
import { EmailModule } from 'src/email/email.module';
import { PubSubModule } from 'src/pub-sub/pub-sub.module';
import { JwtAuthStrategy } from './jwt-auth.strategy';
import { JwtRefreshStrategy } from './jwt-refresh.strategy';

@Module({
  imports: [
    ConfigModule,
    JwtModule.register({}),
    UsersModule,
    EmailModule,
    PubSubModule,
  ],
  providers: [AuthService, AuthResolver, JwtAuthStrategy, JwtRefreshStrategy]
})
export class AuthModule {}
