import { Args, Mutation, Parent, ResolveField, Resolver, Subscription } from '@nestjs/graphql';
import { User } from 'src/users/user.model';
import { UsersService } from 'src/users/users.service';
import { Role } from './role.model';
import { RolesService } from './roles.service';
import { forwardRef, Inject, UseGuards } from '@nestjs/common';
import { PUB_SUB } from 'src/pub-sub/pub-sub.module';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import { Arrow } from 'src/arrows/arrow.model';
import { ArrowsService } from 'src/arrows/arrows.service';
import { CurrentUser, GqlAuthGuard } from 'src/auth/gql-auth.guard';
import { User as UserEntity } from 'src/users/user.entity';

@Resolver(() => Role)
export class RolesResolver {
  constructor(
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

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Role, {name: 'inviteRole'})
  async inviteRole(
    @CurrentUser() user: UserEntity,
    @Args('sessionId') sessionId: string,
    @Args('userName') userName: string,
    @Args('arrowId') arrowId: string,
  ) {
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

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Role, {name: 'requestRole'})
  async requestRole(
    @CurrentUser() user: UserEntity,
    @Args('sessionId') sessionId: string,
    @Args('arrowId') arrowId: string,
    @Args('type') type: string,
  ) {
    const role = await this.rolesService.requestRole(user, arrowId, type)
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

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Role, {name: 'removeRole'})
  async removeRole(
    @CurrentUser() user: UserEntity,
    @Args('sessionId') sessionId: string,
    @Args('roleId') roleId: string,
  ) {
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

  @UseGuards(GqlAuthGuard)
  @Mutation(() => [Role], {name: 'getRolesByArrowId'})
  async getRolesByArrowId(
    @CurrentUser() user: UserEntity,
    @Args('arrowId') arrowId: string,
  ) {
    return this.rolesService.getRolesByArrowId(arrowId);
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
