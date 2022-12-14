import { Inject, UseGuards } from '@nestjs/common';
import { Args, Mutation, Parent, ResolveField, Resolver, Subscription } from '@nestjs/graphql';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import { CurrentUser, GqlAuthGuard } from 'src/auth/gql-auth.guard';
import { PUB_SUB } from 'src/pub-sub/pub-sub.module';
import { User } from 'src/users/user.model';
import { UsersService } from 'src/users/users.service';
import { Lead } from './lead.model';
import { LeadsService } from './leads.service';
import { User as UserEntity } from 'src/users/user.entity';
import { GetUserLeadsResult } from './dto/get-user-leads-result.dto';

@Resolver(() => Lead)
export class LeadsResolver {
  constructor(
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

  @UseGuards(GqlAuthGuard)
  @Mutation(() => [Lead], {name: 'getCurrentUserLeads'})
  async getCurrentUserSubs(
    @CurrentUser() user: UserEntity,
  ) {
    return this.leadsService.getLeadsByFollowerId(user.id);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => GetUserLeadsResult, {name: 'getUserLeads'})
  async getLeaders(
    @CurrentUser() user: UserEntity,
    @Args('userId') userId: string,
  ) {
    const { leaders, followers } = await this.leadsService.getUserLeads(userId);
    return {
      leaders,
      followers,
    };
  }

  
  @UseGuards(GqlAuthGuard)
  @Mutation(() => Lead, {name: 'followUser'})
  async followUser(
    @CurrentUser() user: UserEntity,
    @Args('userId') userId: string,
  ) {
    const lead = await this.leadsService.followUser(user.id, userId);
    this.pubSub.publish('userLead', {
      leaderId: lead.leaderId,
      userLead: lead,
    });
    return lead;
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Lead, {name: 'unfollowUser'})
  async unfollowUser(
    @CurrentUser() user: UserEntity,
    @Args('leadId') leadId: string,
  ) {
    const lead = await this.leadsService.unfollowUser(user.id, leadId);
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
