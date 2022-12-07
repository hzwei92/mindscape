import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Arrow } from 'src/arrows/arrow.entity';
import { ArrowsService } from 'src/arrows/arrows.service';
import { AlertReason, RoleType } from 'src/enums';
import { LeadsService } from 'src/leads/leads.service';
import { RolesService } from 'src/roles/roles.service';
import { User } from 'src/users/user.entity';
import { MoreThan, Repository } from 'typeorm';
import { Alert } from './alert.entity';
import { v4 } from 'uuid';

@Injectable()
export class AlertsService {
  constructor(
    @InjectRepository(Alert)
    private readonly alertsRepository: Repository<Alert>, 
    @Inject(forwardRef(() => ArrowsService))
    private readonly arrowsService: ArrowsService,
    private readonly leadsService: LeadsService,
    private readonly rolesService: RolesService,
  ) {}

  async getAlertsByUserId(userId: string): Promise<Alert[]> {
    return this.alertsRepository.find({
      where: { userId },
    });
  }

  async getUserAlerts(user: User) {
    const alerts = await this.alertsRepository.find({
      where: { 
        userId: user.id,
        createDate: MoreThan(user.checkAlertsDate),
      },
    });

    if (alerts.length) return alerts;

    return this.getUserFeed(user);
  }

  async getUserFeed(user: User, offset: number = 0) {
    const arrows = await this.arrowsService.getFeedArrows(offset);
    const alerts = arrows.map(arrow => {
      const alert = new Alert();
      alert.id = v4();
      alert.sourceId = arrow.sourceId;
      alert.linkId = arrow.id;
      alert.targetId = arrow.targetId;
      alert.userId = user.id;
      alert.createDate = arrow.saveDate;
      alert.reason = AlertReason.FEED;
      return alert;
    });

    return alerts;
  }

  async linkAlert(user: User, source: Arrow, link: Arrow, target: Arrow, abstract: Arrow | null): Promise<Alert[]> {
    const alert = new Alert();
    alert.sourceId = source.id;
    alert.linkId = link.id;
    alert.targetId = target.id;
    alert.userId = source.userId;

    const userIdToAlert = {
      [alert.userId]: alert, 
    };

    const leads = await this.leadsService.getLeadsByLeaderId(user.id);

    leads.forEach(lead => {
      const alert = new Alert();
      alert.sourceId = source.id;
      alert.linkId = link.id;
      alert.targetId = target.id;

      alert.userId = lead.followerId;
      alert.leadId = lead.id;

      userIdToAlert[alert.userId] = alert; 
    })

    const roles = await this.rolesService.getRolesByArrowId(source.id);

    roles.forEach(role => {
      if (role.type === RoleType.OTHER || role.type === RoleType.NONE) return;

      const alert = userIdToAlert[role.userId] || new Alert();
      alert.sourceId = source.id;
      alert.linkId = link.id;
      alert.targetId = target.id;

      alert.userId = role.userId;
      alert.roleId = role.id;

      userIdToAlert[alert.userId] = alert; 
    });
    
    if (abstract) {
      const abstractRoles = await this.rolesService.getRolesByArrowId(abstract?.id);

      abstractRoles.forEach(role => {
        if (role.type === RoleType.OTHER || role.type === RoleType.NONE) return;

        const alert = userIdToAlert[role.userId] || new Alert();
        alert.sourceId = source.id;
        alert.linkId = link.id;
        alert.targetId = target.id;

        alert.userId = role.userId;
        alert.abstractRoleId = role.id;

        userIdToAlert[alert.userId] = alert;
      });
    }


    delete userIdToAlert[user.id];
    console.log(user.id, userIdToAlert, Object.values(userIdToAlert));

    const alerts = Object.values(userIdToAlert);

    return this.alertsRepository.save(alerts);
  }

}
