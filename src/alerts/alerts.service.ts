import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Arrow } from 'src/arrows/arrow.entity';
import { RoleType } from 'src/enums';
import { LeadsService } from 'src/leads/leads.service';
import { RolesService } from 'src/roles/roles.service';
import { Twig } from 'src/twigs/twig.entity';
import { User } from 'src/users/user.entity';
import { Repository } from 'typeorm';
import { Alert } from './alert.entity';

@Injectable()
export class AlertsService {
  constructor(
    @InjectRepository(Alert)
    private readonly alertsRepository: Repository<Alert>, 
    private readonly leadsService: LeadsService,
    private readonly rolesService: RolesService,
  ) {}

  async getAlertsByUserId(userId: string): Promise<Alert[]> {
    return this.alertsRepository.find({
      where: { userId },
    });
  }

  async linkAlert(user: User, source: Arrow, link: Arrow, target: Arrow, abstract: Arrow | null): Promise<Alert[]> {
    const userIdToAlert = {};

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

    const alerts = Object.values(userIdToAlert);

    return this.alertsRepository.save(alerts);
  }

}
