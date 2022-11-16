import { BadRequestException, Inject, UseGuards } from '@nestjs/common';
import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { PUB_SUB } from 'src/pub-sub/pub-sub.module';
import { User } from 'src/users/user.model';
import { AuthService } from './auth.service';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import { UserWithTokens } from './dto/init-user-result.dto';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import { CurrentUser, GqlAuthGuard } from './gql-auth.guard';
import { User as UserEntity } from 'src/users/user.entity';

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

  @UseGuards(GqlAuthGuard)
  @Mutation(() => UserWithTokens, {name: 'registerUser'})
  async registerUser(
    @CurrentUser() user: UserEntity,
    @Args('email') email: string,
    @Args('pass') pass: string,
  ) {
    return this.authService.registerUser(user.id, email, pass);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => UserWithTokens, {name: 'loginUser'})
  async loginUser(
    @CurrentUser() user: UserEntity,
    @Args('email') email: string,
    @Args('pass') pass: string,
  ) {
    return this.authService.loginUser(user, email, pass);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => User, {name: 'registerGoogleUser'})
  async registerGoogleUser(
    @CurrentUser() user: UserEntity,
    @Args('token') token: string,
  ) {
    return this.authService.registerGoogleUser(user, token);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => UserWithTokens, {name: 'loginGoogleUser'})
  async loginGoogleUser(
    @CurrentUser() user: UserEntity,
    @Args('token') token: string,
  ) {
    return this.authService.loginGoogleUser(user, token);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => User, {name: 'logoutUser'})
  async logoutUser (
    @CurrentUser() user: UserEntity,
  ) {
    await this.authService.logoutUser(user);
    return user;
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => User, {name: 'verifyUser'})
  async verifyUser (
    @CurrentUser() user: UserEntity,
    @Args('code') code: string,
  ) {

    return this.authService.verifyUser(user, code)
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => User, {name: 'resendUserVerification'})
  async resendUserVerification (
    @CurrentUser() user: UserEntity,
  ) {

    return this.authService.resendUserVerification(user);
  }
}
