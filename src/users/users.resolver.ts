import { BadRequestException, Inject } from '@nestjs/common';
import { Args, Float, Int, Mutation, Parent, Query, ResolveField, Resolver, Subscription } from '@nestjs/graphql';
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
import { TabsService } from 'src/tabs/tabs.service';
import { Tab } from 'src/tabs/tab.model';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

@Resolver(() => User)
export class UsersResolver {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
    private readonly arrowsService: ArrowsService,
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
    return this.leadsService.getLeadsByLeaderId(user.id, false);
  }

  @ResolveField(() => [Tab], {name: 'tabs'})
  async getUserTabs(
    @Parent() user: User,
  ) {
    return this.tabsService.getTabsByUserId(user.id);
  }

  @Mutation(() => User, {name: 'getCurrentUser'})
  async getCurrentUser(
    @Args('accessToken') accessToken: string,
  ) {
    const payload = this.jwtService.verify(accessToken, {
      secret: this.configService.get('JWT_ACCESS_TOKEN_SECRET')
    });
    const user = await this.usersService.getUserById(payload.userId);
    if (!user) {
      throw new BadRequestException('Invalid accessToken');
    }
    return user;
  }

  @Mutation(() => User, {name: 'getUser'})
  async getUser(
    @Args('accessToken') accessToken: string,
    @Args('userId') userId: string,
  ) {
    const payload = this.jwtService.verify(accessToken, {
      secret: this.configService.get('JWT_ACCESS_TOKEN_SECRET')
    });
    const user = await this.usersService.getUserById(payload.userId);
    if (!user) {
      throw new BadRequestException('Invalid accessToken');
    }
    return this.usersService.getUserById(userId);
  }

  @Query(() => User, {name: 'getUserByEmail', nullable: true})
  async getUserByEmail(
    @Args('accessToken') accessToken: string,
    @Args('email') email: string,
  ) {
    const payload = this.jwtService.verify(accessToken, {
      secret: this.configService.get('JWT_ACCESS_TOKEN_SECRET')
    });
    const user = await this.usersService.getUserById(payload.userId);
    if (!user) {
      throw new BadRequestException('Invalid accessToken');
    }
    return this.usersService.getUserByEmail(email);
  }

  @Query(() => User, {name: 'getUserByName', nullable: true})
  async getUserByName(
    @Args('accessToken') accessToken: string,
    @Args('name') name: string,
  ) {
    const payload = this.jwtService.verify(accessToken, {
      secret: this.configService.get('JWT_ACCESS_TOKEN_SECRET')
    });
    const user = await this.usersService.getUserById(payload.userId);
    if (!user) {
      throw new BadRequestException('Invalid accessToken');
    }
    return this.usersService.getUserByName(name);
  }
  
  @Mutation(() => User, {name: 'publishCursor'})
  async publishCursor(
    @Args('accessToken') accessToken: string,
    @Args('sessionId') sessionId: string,
    @Args('abstractId') abstractId: string,
    @Args('x', {type: () => Int}) x: number,
    @Args('y', {type: () => Int}) y: number,
  ) {
    const payload = this.jwtService.verify(accessToken, {
      secret: this.configService.get('JWT_ACCESS_TOKEN_SECRET')
    });
    const user = await this.usersService.getUserById(payload.userId);
    if (!user) {
      throw new BadRequestException('Invalid accessToken');
    }
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

  @Mutation(() => User, {name: 'setUserMap'})
  async updateUserMap(
    @Args('accessToken') accessToken: string,
    @Args('lng',{type: () => Float}) lng: number,
    @Args('lat',{type: () => Float}) lat: number,
    @Args('zoom',{type: () => Float}) zoom: number,
  ) {
    const payload = this.jwtService.verify(accessToken, {
      secret: this.configService.get('JWT_ACCESS_TOKEN_SECRET')
    });
    const user = await this.usersService.getUserById(payload.userId);
    if (!user) {
      throw new BadRequestException('Invalid accessToken');
    }
    return this.usersService.setUserMap(user, lng, lat, zoom);
  }

  @Mutation(() => User, {name: 'setUserColor'})
  async setUserColor(
    @Args('accessToken') accessToken: string,
    @Args('sessionId') sessionId: string,
    @Args('color') color: string,
  ) {
    const payload = this.jwtService.verify(accessToken, {
      secret: this.configService.get('JWT_ACCESS_TOKEN_SECRET')
    });
    const user = await this.usersService.getUserById(payload.userId);
    if (!user) {
      throw new BadRequestException('Invalid accessToken');
    }
    const user1 = await this.usersService.setUserColor(user, color);
    this.pubSub.publish('updateUser', {
      sessionId,
      userId: user1.id,
      updateUser: user1,
    });
    return user1;
  }

  @Mutation(() => User, {name: 'setUserPalette'})
  async setUserPalette(
    @Args('accessToken') accessToken: string,
    @Args('sessionId') sessionId: string,
    @Args('palette') palette: string,
  ) {
    const payload = this.jwtService.verify(accessToken, {
      secret: this.configService.get('JWT_ACCESS_TOKEN_SECRET')
    });
    const user = await this.usersService.getUserById(payload.userId);
    if (!user) {
      throw new BadRequestException('Invalid accessToken');
    }
    const user1 = await this.usersService.setUserPalette(user, palette);
    this.pubSub.publish('updateUser', {
      sessionId,
      userId: user1.id,
      updateUser: user1,
    });
    return user1;
  }

  @Mutation(() => User, {name: 'setUserName'})
  async setUserName(
    @Args('accessToken') accessToken: string,
    @Args('sessionId') sessionId: string,
    @Args('name') name: string,
  ) {
    const payload = this.jwtService.verify(accessToken, {
      secret: this.configService.get('JWT_ACCESS_TOKEN_SECRET')
    });
    const user = await this.usersService.getUserById(payload.userId);
    if (!user) {
      throw new BadRequestException('Invalid accessToken');
    }
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
