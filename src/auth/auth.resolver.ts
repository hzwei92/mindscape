import { BadRequestException, Inject } from '@nestjs/common';
import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { PUB_SUB } from 'src/pub-sub/pub-sub.module';
import { User } from 'src/users/user.model';
import { AuthService } from './auth.service';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import { UserWithTokens } from './dto/init-user-result.dto';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';

@Resolver()
export class AuthResolver {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
    @Inject(PUB_SUB)
    private readonly pubSub: RedisPubSub,
  ) {}

  @Mutation(() => String, {name: 'refreshToken'})
  async refreshToken(
    @Args('refreshToken') refreshToken: string,
  ) {
    return this.authService.refreshToken(refreshToken);
  }

  @Mutation(() => UserWithTokens, {name: 'initUser'})
  async initUser(
    @Args('palette') palette: string,
  ) {
    return this.authService.initUser(palette);
  }

  @Mutation(() => UserWithTokens, {name: 'registerUser'})
  async registerUser(
    @Args('accessToken') accessToken: string,
    @Args('email') email: string,
    @Args('pass') pass: string,
  ) {
    const payload = this.jwtService.verify(accessToken, {
      secret: this.configService.get('JWT_ACCESS_TOKEN_SECRET')
    });
    const user = await this.usersService.getUserById(payload.userId);
    if (!user) {
      throw new BadRequestException('Invalid accessToken');
    }
    return this.authService.registerUser(user.id, email, pass);
  }

  @Mutation(() => UserWithTokens, {name: 'loginUser'})
  async loginUser(
    @Args('accessToken') accessToken: string,
    @Args('email') email: string,
    @Args('pass') pass: string,
  ) {
    const payload = this.jwtService.verify(accessToken, {
      secret: this.configService.get('JWT_ACCESS_TOKEN_SECRET')
    });
    const user = await this.usersService.getUserById(payload.userId);
    if (!user) {
      throw new BadRequestException('Invalid accessToken');
    }

    return this.authService.loginUser(user, email, pass);
  }

  @Mutation(() => User, {name: 'registerGoogleUser'})
  async registerGoogleUser(
    @Args('accessToken') accessToken: string,
    @Args('token') token: string,
  ) {
    const payload = this.jwtService.verify(accessToken, {
      secret: this.configService.get('JWT_ACCESS_TOKEN_SECRET')
    });
    const user = await this.usersService.getUserById(payload.userId);
    if (!user) {
      throw new BadRequestException('Invalid accessToken');
    }
    return this.authService.registerGoogleUser(user, token);
  }
  @Mutation(() => UserWithTokens, {name: 'loginGoogleUser'})
  async loginGoogleUser(
    @Args('accessToken') accessToken: string,
    @Args('token') token: string,
  ) {
    const payload = this.jwtService.verify(accessToken, {
      secret: this.configService.get('JWT_ACCESS_TOKEN_SECRET')
    });
    const user = await this.usersService.getUserById(payload.userId);
    if (!user) {
      throw new BadRequestException('Invalid accessToken');
    }

    return this.authService.loginGoogleUser(user, token);
  }


  @Mutation(() => User, {name: 'logoutUser'})
  async logoutUser (
    @Args('accessToken') accessToken: string,
  ) {
    const payload = this.jwtService.verify(accessToken, {
      secret: this.configService.get('JWT_ACCESS_TOKEN_SECRET')
    });
    const user = await this.usersService.getUserById(payload.userId);
    if (!user) {
      throw new BadRequestException('Invalid accessToken');
    }

    await this.authService.logoutUser(user);

    return user;
  }

  @Mutation(() => User, {name: 'verifyUser'})
  async verifyUser (
    @Args('accessToken') accessToken: string,
    @Args('code') code: string,
  ) {
    const payload = this.jwtService.verify(accessToken, {
      secret: this.configService.get('JWT_ACCESS_TOKEN_SECRET')
    });
    const user = await this.usersService.getUserById(payload.userId);
    if (!user) {
      throw new BadRequestException('Invalid accessToken');
    }
    return this.authService.verifyUser(user, code)
  }

  @Mutation(() => User, {name: 'resendUserVerification'})
  async resendUserVerification (
    @Args('accessToken') accessToken: string,
  ) {
    const payload = this.jwtService.verify(accessToken, {
      secret: this.configService.get('JWT_ACCESS_TOKEN_SECRET')
    });
    const user = await this.usersService.getUserById(payload.userId);
    if (!user) {
      throw new BadRequestException('Invalid accessToken');
    }
    return this.authService.resendUserVerification(user);
  }
}
