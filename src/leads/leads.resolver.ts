import { BadRequestException, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Args, Mutation, Parent, ResolveField, Resolver, Subscription } from '@nestjs/graphql';
import { JwtService } from '@nestjs/jwt';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import { PUB_SUB } from 'src/pub-sub/pub-sub.module';
import { User } from 'src/users/user.model';
import { UsersService } from 'src/users/users.service';
import { Lead } from './lead.model';
import { LeadsService } from './leads.service';

@Resolver(() => Lead)
export class LeadsResolver {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly leadsService: LeadsService,
    private readonly usersService: UsersService,
    @Inject(PUB_SUB)
    private readonly pubSub: RedisPubSub, 
  ) {}

  @ResolveField(() => User, {name: 'leader'})
  async getLeadLeader(
    @Parent() lead: Lead,
  ) {
    return this.usersService.getUserById(lead.leaderId);
  }

  @ResolveField(() => User, {name: 'follower'})
  async getLeadFollower(
    @Parent() lead: Lead,
  ) {
    return this.usersService.getUserById(lead.followerId);
  }

  @Mutation(() => [Lead], {name: 'getCurrentUserLeads'})
  async getCurrentUserSubs(
    @Args('accessToken') accessToken: string,
  ) {
    const payload = this.jwtService.verify(accessToken, {
      secret: this.configService.get('JWT_ACCESS_TOKEN_SECRET')
    });
    const user = await this.usersService.getUserById(payload.userId);
    if (!user) {
      throw new BadRequestException('Invalid accessToken');
    }
    return this.leadsService.getLeadsByFollowerId(user.id);
  }
  
  @Mutation(() => Lead, {name: 'followUser'})
  async followUser(
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

    const lead = await this.leadsService.followUser(user.id, userId);
    this.pubSub.publish('userLead', {
      leaderId: lead.leaderId,
      userLead: lead,
    });
    return lead;
  }

  @Mutation(() => Lead, {name: 'unfollowUser'})
  async unfollowUser(
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
    const lead = await this.leadsService.unfollowUser(user.id, userId);
    this.pubSub.publish('userLead', {
      leaderId: lead.leaderId,
      userLead: lead,
    });
    return lead;
  }

  @Subscription(() => Lead, {name: 'userLead',
    filter: (payload, variables) => {
      return payload.leaderId === variables.userId;
    }
  })
  leadSubscription(
    @Args('userId') userId: string,
  ) {
    console.log('userLeadSub')
    return this.pubSub.asyncIterator('userLead'); 
  }
}
