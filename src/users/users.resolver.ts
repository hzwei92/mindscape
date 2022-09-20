import { Inject, UseGuards } from '@nestjs/common';
import { Args, Float, Int, Mutation, Parent, Query, ResolveField, Resolver, Subscription } from '@nestjs/graphql';
import { CurrentUser, GqlAuthGuard } from 'src/auth/gql-auth.guard';
import { PUB_SUB } from 'src/pub-sub/pub-sub.module';
import { User, UserCursor } from './user.model';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import { UsersService } from './users.service';
import { ACTIVE_TIME } from 'src/constants';
import { Arrow } from 'src/arrows/arrow.model';
import { ArrowsService } from 'src/arrows/arrows.service';
import { Role } from 'src/roles/role.model';
import { Lead } from 'src/leads/lead.model';
import { RolesService } from 'src/roles/roles.service';
import { LeadsService } from 'src/leads/leads.service';
import { User as UserEntity } from 'src/users/user.entity';
import { TabsService } from 'src/tabs/tabs.service';
import { Tab } from 'src/tabs/tab.model';

@Resolver(() => User)
export class UsersResolver {
  constructor(
    private readonly usersService: UsersService,
    private readonly arrowsService: ArrowsService,
    private readonly rolesService: RolesService,
    private readonly leadsService: LeadsService,
    private readonly tabsService: TabsService,
    @Inject(PUB_SUB)
    private readonly pubSub: RedisPubSub,
  ) {}

  @ResolveField(() => Arrow, {name: 'frame', nullable: true})
  async getUserFrame(
    @Parent() user: User,
  ) {
    if (!user.frameId) return null;
    return this.arrowsService.getArrowById(user.frameId);
  }

  @ResolveField(() => Arrow, {name: 'focus', nullable: true})
  async getUserFocus(
    @Parent() user: User,
  ) {
    if (!user.focusId) return null;
    return this.arrowsService.getArrowById(user.focusId);
  }

  @ResolveField(() => [Role], {name: 'roles'})
  async getUserRoles(
    @Parent() user: User,
  ) {
    return this.rolesService.getRolesByUserId(user.id);
  }

  @ResolveField(() => [Lead], {name: 'leaders'})
  async getUserLeaders(
    @Parent() user: User,
  ) {
    return this.leadsService.getLeadsByFollowerId(user.id);
  }

  @ResolveField(() => [Lead], {name: 'followers'})
  async getUserFollowers(
    @Parent() user: User,
  ) {
    return this.leadsService.getLeadsByLeaderId(user.id, false);
  }

  @ResolveField(() => [Tab], {name: 'tabs'})
  async getUserTabs(
    @Parent() user: User,
  ) {
    return this.tabsService.getTabsByUserId(user.id);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => User, {name: 'getCurrentUser'})
  async getCurrentUser(
    @CurrentUser() user: User,
  ) {
    return user;
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => User, {name: 'getUser'})
  async getUser(
    @Args('userId') userId: string,
  ) {
    return this.usersService.getUserById(userId);
  }

  @Query(() => User, {name: 'getUserByEmail', nullable: true})
  async getUserByEmail(
    @Args('email') email: string,
  ) {
    return this.usersService.getUserByEmail(email);
  }

  @Query(() => User, {name: 'getUserByName', nullable: true})
  async getUserByName(
    @Args('name') name: string,
  ) {
    return this.usersService.getUserByName(name);
  }
  
  @UseGuards(GqlAuthGuard)
  @Mutation(() => User, {name: 'publishCursor'})
  async publishCursor(
    @CurrentUser() user: UserEntity,
    @Args('sessionId') sessionId: string,
    @Args('abstractId') abstractId: string,
    @Args('x', {type: () => Int}) x: number,
    @Args('y', {type: () => Int}) y: number,
  ) {
    this.pubSub.publish('publishCursor', {
      sessionId,
      abstractId,
      publishCursor: {
        id: user.id,
        name: user.name,
        color: user.color,
        x,
        y,
      }
    });
    const date = new Date();
    if (date.getTime() - user.updateDate.getTime() > ACTIVE_TIME) {
      const user1 = await this.usersService.setUserActiveDate(user, date);
      this.pubSub.publish('updateUser', {
        sessionId,
        userId: user1.id,
        updateUser: user1,
      })
      return user1;
    }
    return user;
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => User, {name: 'setUserMap'})
  async updateUserMap(
    @CurrentUser() user: UserEntity,
    @Args('lng',{type: () => Float}) lng: number,
    @Args('lat',{type: () => Float}) lat: number,
    @Args('zoom',{type: () => Float}) zoom: number,
  ) {
    return this.usersService.setUserMap(user, lng, lat, zoom);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => User, {name: 'setUserColor'})
  async setUserColor(
    @CurrentUser() user: UserEntity,
    @Args('sessionId') sessionId: string,
    @Args('color') color: string,
  ) {
    const user1 = await this.usersService.setUserColor(user, color);
    this.pubSub.publish('updateUser', {
      sessionId,
      userId: user1.id,
      updateUser: user1,
    });
    return user1;
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => User, {name: 'setUserPalette'})
  async setUserPalette(
    @CurrentUser() user: UserEntity,
    @Args('sessionId') sessionId: string,
    @Args('palette') palette: string,
  ) {
    const user1 = await this.usersService.setUserPalette(user, palette);
    this.pubSub.publish('updateUser', {
      sessionId,
      userId: user1.id,
      updateUser: user1,
    });
    return user1;
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => User, {name: 'setUserName'})
  async setUserName(
    @CurrentUser() user: UserEntity,
    @Args('sessionId') sessionId: string,
    @Args('name') name: string,
  ) {
    const user1 = await this.usersService.setUserName(user, name);
    this.pubSub.publish('updateUser', {
      sessionId,
      userId: user1.id,
      updateUser: user1,
    });
    return user1;
  }

  @Subscription(() => UserCursor, {name: 'publishCursor',
    filter: (payload, variables) => {
      if (payload.sessionId === variables.sessionId) return false;
      return payload.abstractId === variables.abstractId;
    }
  })
  publishCursorSub(
    @Args('sessionId') sessionId: string,
    @Args('abstractId') abstractId: string,
  ) {
    console.log('publishCursorSub')
    return this.pubSub.asyncIterator('publishCursor')
  }

  @Subscription(() => User, {name: 'updateUser', 
    filter: (payload, variables) => {
      if (payload.sessionId === variables.sessionId) return false;
      return variables.userIds.some(userId => {
        return userId === payload.userId;
      });
    },
  })
  updateUserSub(
    @Args('sessionId') sessionId: string,
    @Args('userIds', {type: () => [String]}) userIds: string[],
  ) {
    console.log('updateUserSub')
    return this.pubSub.asyncIterator('updateUser')
  }

  @Subscription(() => User, {name: 'setUserFocus', 
    filter: (payload, variables) => {
      if (payload.sessionId === variables.sessionId) return false;
      return payload.abstractId === variables.abstractId;
    },
  })
  setUserFocusSub(
    @Args('sessionId') sessionId: string,
    @Args('abstractId') abstractId: string,
  ) {
    console.log('setUserFocusSub')
    return this.pubSub.asyncIterator('setUserFocus')
  }
}
