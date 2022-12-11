import { Args, Context, Mutation, Parent, ResolveField, Resolver, Subscription } from '@nestjs/graphql';
import { Arrow } from 'src/arrows/arrow.model';
import { ArrowsService } from 'src/arrows/arrows.service';
import { CurrentUser, GqlAuthGuard } from 'src/auth/gql-auth.guard';
import { Lead } from 'src/leads/lead.model';
import { LeadsService } from 'src/leads/leads.service';
import { Role } from 'src/roles/role.model';
import { RolesService } from 'src/roles/roles.service';
import { User } from 'src/users/user.model';
import { UsersService } from 'src/users/users.service';
import { Alert } from './alert.model';
import { AlertsService } from './alerts.service';
import { User as UserEntity } from 'src/users/user.entity';
import { Inject, UseGuards } from '@nestjs/common';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import { PUB_SUB } from 'src/pub-sub/pub-sub.module';
import { ReadAlertsResult } from './dto/read-alerts-result.dto';
import { GetCurrentUserAlertsResult } from './dto/get-current-user-alerts.dto';

@Resolver(() => Alert)
export class AlertsResolver {
  constructor(
    private readonly alertsService: AlertsService,
    private readonly usersService: UsersService,
    private readonly arrowsService: ArrowsService,
    private readonly leadsService: LeadsService,
    private readonly rolesService: RolesService,
    @Inject(PUB_SUB)
    private readonly pubSub: RedisPubSub,
  ) {}

  @ResolveField(() => User, {name: 'user'})
  async getUser(
    @Parent() alert: Alert,
  ) {
    return this.usersService.getUserById(alert.userId);
  }

  @ResolveField(() => Arrow, {name: 'source', nullable: true})
  async getArrowSource(
    @Parent() alert: Alert,
  ) {
    return this.arrowsService.getArrowById(alert.sourceId);
  }

  @ResolveField(() => Arrow, {name: 'link', nullable: true})
  async getArrow(
    @Parent() alert: Alert,
  ) {
    return this.arrowsService.getArrowById(alert.linkId);
  }

  @ResolveField(() => Arrow, {name: 'target', nullable: true})
  async getArrowTarget(
    @Parent() alert: Alert,
  ) {
    return this.arrowsService.getArrowById(alert.targetId);
  }

  @ResolveField(() => Lead, {name: 'lead', nullable: true})
  async getLead(
    @Parent() alert: Alert,
  ) {
    return this.leadsService.getLeadById(alert.leadId);
  }

  @ResolveField(() => Role, {name: 'role', nullable: true})
  async getRole(
    @Parent() alert: Alert,
  ) {
    return this.rolesService.getRoleById(alert.roleId);
  }

  @ResolveField(() => Role, {name: 'abstractRole', nullable: true})
  async getAbstractRole(
    @Parent() alert: Alert,
  ) {
    return this.rolesService.getRoleById(alert.abstractRoleId);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => GetCurrentUserAlertsResult, {name: 'getCurrentUserAlerts'})
  async getAlertsByUserId(
    @CurrentUser() user: UserEntity,
  ) {
    const alerts = await this.alertsService.getUserAlerts(user);

    if (!user.loadFeedDate) {
      user = await this.usersService.setLoadFeedDate(user);
    }

    return {
      user, 
      alerts,
    }
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => ReadAlertsResult, {name: 'readAlerts'})
  async readAlerts(
    @CurrentUser() user: UserEntity,
    @Args('arrowIds', {type: () => [String]}) arrowIds: string[],
  ) {
    user = await this.usersService.setCheckAlertsDate(user);

    const arrows = await this.arrowsService.getArrowsByIds(arrowIds);

    return {
      user, 
      arrows,
    }
  }


  @Subscription(() => Alert, {name: 'alert',
    filter: (payload, variables) => {
      return payload.userId === variables.userId;
    },
  })
  saveArrowSub(
    @Context() context: any,
    @Args('userId') userId: string,
  ) {
    console.log('alertSub', context); // TODO check userId === context.user.id
    return this.pubSub.asyncIterator('alert');
  }
}
