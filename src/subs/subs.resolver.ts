import { BadRequestException, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { JwtService } from '@nestjs/jwt';
import { CurrentUser, GqlAuthGuard } from 'src/auth/gql-auth.guard';
import { User } from 'src/users/user.model';
import { Sub } from './sub.model';
import { SubsService } from './subs.service';
import { UsersService } from 'src/users/users.service';

@Resolver(() => Sub)
export class SubsResolver {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly subsService: SubsService,
    private readonly usersService: UsersService,
  ) {}

  @Mutation(() => Sub, {name: 'subPost'})
  async subPost(
    @Args('accessToken') accessToken: string,
    @Args('arrowId') arrowId: string,
  ) {
    const payload = this.jwtService.verify(accessToken, {
      secret: this.configService.get('JWT_ACCESS_TOKEN_SECRET')
    });
    const user = await this.usersService.getUserById(payload.userId);
    if (!user) {
      throw new BadRequestException('Invalid accessToken');
    }
    return this.subsService.sub(user.id, arrowId);
  }

  @Mutation(() => Sub, {name: 'unsubPost'})
  async unsubPost(
    @Args('accessToken') accessToken: string,
    @Args('arrowId') arrowId: string,
  ) {
    const payload = this.jwtService.verify(accessToken, {
      secret: this.configService.get('JWT_ACCESS_TOKEN_SECRET')
    });
    const user = await this.usersService.getUserById(payload.userId);
    if (!user) {
      throw new BadRequestException('Invalid accessToken');
    }
    return this.subsService.unsub(user.id, arrowId);
  }
}
