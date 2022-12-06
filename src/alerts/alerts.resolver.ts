import { Mutation, Parent, ResolveField, Resolver } from '@nestjs/graphql';
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
import { UseGuards } from '@nestjs/common';

@Resolver(() => Alert)
export class AlertsResolver {
  constructor(
    private readonly alertsService: AlertsService,
    private readonly usersService: UsersService,
    private readonly arrowsService: ArrowsService,
    private readonly leadsService: LeadsService,
    private readonly rolesService: RolesService,
  ) {}

  @ResolveField(() => User, {name: 'user'})
  async getUser(
    @Parent() alert: Alert,
  ) {
    return this.usersService.getUserById(alert.userId);
  }

  @ResolveField(() => Arrow, {name: 'arrow', nullable: true})
  async getArrow(
    @Parent() alert: Alert,
  ) {
    return this.arrowsService.getArrowById(alert.arrowId);
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
  @Mutation(() => [Alert], {name: 'getCurrentUserAlerts'})
  async getAlertsByUserId(
    @CurrentUser() user: UserEntity,
  ) {
    return this.alertsService.getAlertsByUserId(user.id);
  }
}
