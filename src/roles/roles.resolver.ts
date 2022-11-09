import { Args, Mutation, Parent, ResolveField, Resolver, Subscription } from '@nestjs/graphql';
import { User } from 'src/users/user.model';
import { UsersService } from 'src/users/users.service';
import { Role } from './role.model';
import { RolesService } from './roles.service';
import { BadRequestException, forwardRef, Inject } from '@nestjs/common';
import { PUB_SUB } from 'src/pub-sub/pub-sub.module';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import { Arrow } from 'src/arrows/arrow.model';
import { ArrowsService } from 'src/arrows/arrows.service';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

@Resolver(() => Role)
export class RolesResolver {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly rolesService: RolesService,
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
    private readonly arrowsService: ArrowsService,
    @Inject(PUB_SUB)
    private readonly pubSub: RedisPubSub,
  ) {}

  @ResolveField(() => User, {name: 'user'})
  async getRoleUser(
    @Parent() role: Role,
  ) {
    return this.usersService.getUserById(role.userId);
  }

  @ResolveField(() => Arrow, {name: 'arrow'})
  async getRoleArrow(
    @Parent() role: Role,
  ) {
    return this.arrowsService.getArrowById(role.arrowId);
  }

  @Mutation(() => Role, {name: 'inviteRole'})
  async inviteRole(
    @Args('accessToken') accessToken: string,
    @Args('sessionId') sessionId: string,
    @Args('userName') userName: string,
    @Args('arrowId') arrowId: string,
  ) {
    const payload = this.jwtService.verify(accessToken, {
      secret: this.configService.get('JWT_ACCESS_TOKEN_SECRET')
    });
    const user = await this.usersService.getUserById(payload.userId);
    if (!user) {
      throw new BadRequestException('Invalid accessToken');
    }

    const role = await this.rolesService.inviteRole(user.id, userName, arrowId);
    const arrow = await this.arrowsService.getArrowById(arrowId);

    this.pubSub.publish('userRole', {
      sessionId,
      userId: role.userId,
      userRole: {
        ...role,
        user,
        arrow,
      }
    });

    this.pubSub.publish('arrowRole', {
      sessionId,
      arrowId,
      arrowRole: {
        ...role,
        user,
        arrow,
      },
    });

    return role;
  }

  @Mutation(() => Role, {name: 'requestRole'})
  async requestRole(
    @Args('accessToken') accessToken: string,
    @Args('sessionId') sessionId: string,
    @Args('arrowId') arrowId: string,
  ) {
    const payload = this.jwtService.verify(accessToken, {
      secret: this.configService.get('JWT_ACCESS_TOKEN_SECRET')
    });
    const user = await this.usersService.getUserById(payload.userId);
    if (!user) {
      throw new BadRequestException('Invalid accessToken');
    }

    const role = await this.rolesService.requestRole(user.id, arrowId)
    const arrow = await this.arrowsService.getArrowById(arrowId);

    this.pubSub.publish('userRole', {
      sessionId,
      userId: user.id,
      userRole: {
        ...role,
        user,
        arrow,
      }
    });

    this.pubSub.publish('arrowRole', {
      sessionId,
      arrowId,
      arrowRole: {
        ...role,
        user,
        arrow
      },
    });

    return role;
  }

  @Mutation(() => Role, {name: 'removeRole'})
  async removeRole(
    @Args('accessToken') accessToken: string,
    @Args('sessionId') sessionId: string,
    @Args('roleId') roleId: string,
  ) {
    const payload = this.jwtService.verify(accessToken, {
      secret: this.configService.get('JWT_ACCESS_TOKEN_SECRET')
    });
    const user = await this.usersService.getUserById(payload.userId);
    if (!user) {
      throw new BadRequestException('Invalid accessToken');
    }
    
    const role = await this.rolesService.removeRole(user.id, roleId)
    const removedUser = await this.usersService.getUserById(role.userId);
    const arrow = await this.arrowsService.getArrowById(role.arrowId);

    this.pubSub.publish('userRole', {
      sessionId,
      userId: role.userId,
      userRole: {
        ...role,
        user: removedUser,
        arrow,
      }
    });

    this.pubSub.publish('arrowRole', {
      sessionId,
      arrowId: role.arrowId,
      arrowRole: {
        ...role,
        user: removedUser,
        arrow
      },
    });

    return role;
  }

  @Subscription(() => Role, {name: 'userRole',
    filter: (payload, variables) => {
      if (payload.sessionId === variables.sessionId) return false;
      return payload.userId === variables.userId;
    }
  })
  userRoleSubscription(
    @Args('sessionId') sessionId: string,
    @Args('userId') userId: string,
  ) {
    return this.pubSub.asyncIterator('userRole')
  }
  @Subscription(() => Role, {name: 'arrowRole',
    filter: (payload, variables) => {
      if (payload.sessionId === variables.sessionId) return false;
      return payload.arrowId === variables.arrowId;
    }
  })
  arrowRoleSubscription(
    @Args('sessionId') sessionId: string,
    @Args('arrowId') arrowId: string,
  ) {
    return this.pubSub.asyncIterator('arrowRole')
  }
}
