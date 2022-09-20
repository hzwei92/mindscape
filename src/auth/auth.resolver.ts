import { Inject, UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';
import { PUB_SUB } from 'src/pub-sub/pub-sub.module';
import { User } from 'src/users/user.model';
import { AuthService } from './auth.service';
import { CurrentUser, GqlAuthGuard } from './gql-auth.guard';
import { GqlRefreshGuard } from './gql-refresh.guard';
import { RedisPubSub } from 'graphql-redis-subscriptions';

@Resolver()
export class AuthResolver {
  constructor(
    private readonly authService: AuthService,
    @Inject(PUB_SUB)
    private readonly pubSub: RedisPubSub,
  ) {}

  @Mutation(() => User, {name: 'initUser'})
  async initUser(
    @Context() context: any,
    @Args('palette') palette: string,
  ) {
    const {
      user,
      accessTokenCookie,
      refreshTokenCookie,
    } = await this.authService.initUser(palette);

    context.res.cookie(accessTokenCookie.name, accessTokenCookie.value, accessTokenCookie.options);
    context.res.cookie(refreshTokenCookie.name, refreshTokenCookie.value, refreshTokenCookie.options);
    return user;
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => User, {name: 'registerUser'})
  async registerUser(
    @Context() context: any,
    @CurrentUser() user: User,
    @Args('email') email: string,
    @Args('pass') pass: string,
  ) {
    const {
      user: user1,
      accessTokenCookie,
      refreshTokenCookie,
    } = await this.authService.registerUser(user.id, email, pass);

    context.res.cookie(accessTokenCookie.name, accessTokenCookie.value, accessTokenCookie.options);
    context.res.cookie(refreshTokenCookie.name, refreshTokenCookie.value, refreshTokenCookie.options);

    return user1;
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => User, {name: 'loginUser'})
  async loginUser(
    @Context() context: any,
    @CurrentUser() user: User,
    @Args('email') email: string,
    @Args('pass') pass: string,
  ) {
    console.log(email, pass);
    const {
      user: user1,
      accessTokenCookie,
      refreshTokenCookie,
    } = await this.authService.loginUser(user.id, email, pass);

    context.res.cookie(accessTokenCookie.name, accessTokenCookie.value, accessTokenCookie.options);
    context.res.cookie(refreshTokenCookie.name, refreshTokenCookie.value, refreshTokenCookie.options);
    
    return user1;
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => User, {name: 'registerGoogleUser'})
  async registerGoogleUser(
    @Context() context: any,
    @CurrentUser() user: User,
    @Args('token') token: string,
  ) {
    const {
      user: user1,
      accessTokenCookie,
      refreshTokenCookie,
    } = await this.authService.registerGoogleUser(user.id, token);

    context.res.cookie(accessTokenCookie.name, accessTokenCookie.value, accessTokenCookie.options);
    context.res.cookie(refreshTokenCookie.name, refreshTokenCookie.value, refreshTokenCookie.options);

    return user1;
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => User, {name: 'loginGoogleUser'})
  async loginGoogleUser(
    @CurrentUser() user: User,
    @Context() context: any,
    @Args('token') token: string,
  ) {
    const {
      user: user1,
      accessTokenCookie,
      refreshTokenCookie,
    } = await this.authService.loginGoogleUser(user.id, token);

    context.res.cookie(accessTokenCookie.name, accessTokenCookie.value, accessTokenCookie.options);
    context.res.cookie(refreshTokenCookie.name, refreshTokenCookie.value, refreshTokenCookie.options);

    return user1;
  }

  @UseGuards(GqlRefreshGuard)
  @Mutation(() => User, {name: 'refreshToken'})
  async refreshToken(
    @Context() context: any,
    @CurrentUser() user: User,
  ) {
    const { name, value, options } = this.authService.getAccessTokenCookie(user.id);
    context.res.cookie(name, value, options);
    return user;
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => User, {name: 'logoutUser'})
  async logoutUser (
    @Context() context: any,
    @CurrentUser() user: User,
  ) {
    const {
      accessTokenCookie,
      refreshTokenCookie,
    } = await this.authService.logoutUser(user.id);
    
    context.res.cookie(accessTokenCookie.name, accessTokenCookie.value, accessTokenCookie.options);
    context.res.cookie(refreshTokenCookie.name, refreshTokenCookie.value, refreshTokenCookie.options);

    return user;
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => User, {name: 'verifyUser'})
  async verifyUser (
    @CurrentUser() user: User,
    @Args('code') code: string,
  ) {
    return this.authService.verifyUser(user.id, code)
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => User, {name: 'resendUserVerification'})
  async resendUserVerification (
    @CurrentUser() user: User,
  ) {
    return this.authService.resendUserVerification(user.id);
  }
}
