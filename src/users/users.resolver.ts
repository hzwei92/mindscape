import { Inject, UseGuards } from '@nestjs/common';
import { Args, Float, Int, Mutation, Parent, Query, ResolveField, Resolver, Subscription } from '@nestjs/graphql';
import { PUB_SUB } from 'src/pub-sub/pub-sub.module';
import { User, UserAvatar } from './user.model';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import { UsersService } from './users.service';
import { ACTIVE_TIME } from 'src/constants';
import { Role } from 'src/roles/role.model';
import { Lead } from 'src/leads/lead.model';
import { RolesService } from 'src/roles/roles.service';
import { LeadsService } from 'src/leads/leads.service';
import { TabsService } from 'src/tabs/tabs.service';
import { Tab } from 'src/tabs/tab.model';
import { CurrentUser, GqlAuthGuard } from 'src/auth/gql-auth.guard';
import { User as UserEntity } from './user.entity';

@Resolver(() => User)
export class UsersResolver {
  constructor(
    private readonly usersService: UsersService,
    private readonly rolesService: RolesService,
    private readonly leadsService: LeadsService,
    private readonly tabsService: TabsService,
    @Inject(PUB_SUB)
    private readonly pubSub: RedisPubSub,
  ) {}

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
    return this.leadsService.getLeadsByLeaderId(user.id);
  }

  @ResolveField(() => [Tab], {name: 'tabs'})
  async getUserTabs(
    @Parent() user: User,
  ) {
    return this.tabsService.getTabsByUserId(user.id);
  }

  @ResolveField(() => Lead, {name: 'currentUserLead', nullable: true})
  async getCurrentUserLead(
    @Parent() user: User,
    @CurrentUser() currentUser: UserEntity,
  ) {
    if (user?.id && currentUser?.id && user.id !== currentUser.id) {
      return this.leadsService.getLeadByFollowerIdAndLeaderId(currentUser.id, user.id);
    }
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => User, {name: 'getCurrentUser'})
  async getCurrentUser(
    @CurrentUser() user: UserEntity,
  ) {
    return user;
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => User, {name: 'getUser'})
  async getUser(
    @CurrentUser() user: UserEntity,
    @Args('userId') userId: string,
  ) {
    return this.usersService.getUserById(userId);
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => User, {name: 'getUserByEmail', nullable: true})
  async getUserByEmail(
    @CurrentUser() user: UserEntity,
    @Args('email') email: string,
  ) {
    return this.usersService.getUserByEmail(email);
  }

  @Mutation(() => User, {name: 'getUserByName', nullable: true})
  async getUserByName(
    @CurrentUser() user: UserEntity,
    @Args('name') name: string,
  ) {
    return this.usersService.getUserByName(name);
  }
  
  @UseGuards(GqlAuthGuard)
  @Mutation(() => User, {name: 'publishAvatar'})
  async publishAvatar(
    @CurrentUser() user: UserEntity,
    @Args('sessionId') sessionId: string,
    @Args('abstractId') abstractId: string,
    @Args('x', {type: () => Int, nullable: true}) x: number,
    @Args('y', {type: () => Int, nullable: true}) y: number,
  ) {
    const activeDate = new Date();
    this.pubSub.publish('publishAvatar', {
      sessionId,
      abstractId,
      publishAvatar: {
        id: user.id,
        abstractId,
        name: user.name,
        color: user.color,
        x,
        y,
        activeDate,
      }
    });
    if (activeDate.getTime() - user.updateDate.getTime() > ACTIVE_TIME) {
      const user1 = await this.usersService.setUserActiveDate(user, activeDate);
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

  @UseGuards(GqlAuthGuard)
  @Mutation(() => User, {name: 'setUserOpenPostDate'})
  async setUserOpenPostDate(
    @CurrentUser() user: UserEntity,
  ) {
    return this.usersService.setOpenPostDate(user);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => User, {name: 'setUserOpenLinkDate'})
  async setUserOpenLinkDate(
    @CurrentUser() user: UserEntity,
  ) {
    return this.usersService.setOpenLinkDate(user);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => User, {name: 'setUserMoveTwigDate'})
  async setUserMoveTwigDate(
    @CurrentUser() user: UserEntity,
  ) {
    return this.usersService.setMoveTwigDate(user);
  }
  @UseGuards(GqlAuthGuard)
  @Mutation(() => User, {name: 'setUserGraftTwigDate'})
  async setUserGraftTwigDate(
    @CurrentUser() user: UserEntity,
  ) {
    return this.usersService.setGraftTwigDate(user);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => User, {name: 'setUserNavDate'})
  async setUserNavDate(
    @CurrentUser() user: UserEntity,
  ) {
    return this.usersService.setNavDate(user);
  }


  @Subscription(() => UserAvatar, {name: 'publishAvatar',
    filter: (payload, variables) => {
      if (payload.sessionId === variables.sessionId) return false;
      return variables.abstractIds.some(abstractId => abstractId === payload.abstractId);
    }
  })
  publishAvatarSub(
    @Args('sessionId') sessionId: string,
    @Args('abstractIds', {type: () => [String]}) abstractIds: string[],
  ) {
    console.log('publishAvatarSub')
    return this.pubSub.asyncIterator('publishAvatar')
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
