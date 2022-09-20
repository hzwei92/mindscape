import { BadRequestException, forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from './role.entity';
import { RoleType }from 'src/enums';
import { UsersService } from 'src/users/users.service';
import { User } from 'src/users/user.entity';
import { ArrowsService } from 'src/arrows/arrows.service';
import { Arrow } from 'src/arrows/arrow.entity';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private readonly rolesRepository: Repository<Role>,
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
    @Inject(forwardRef(() => ArrowsService))
    private readonly arrowsService: ArrowsService,
  ) {}

  async getRoleById(id): Promise<Role> {
    return this.rolesRepository.findOne({
      where: {
        id,
      }
    });
  }

  async getRolesByUserId(userId: string): Promise<Role[]> {
    return this.rolesRepository.find({
      where: {
        userId,
      },
    });
  }
  
  async getRolesByArrowId(arrowId: string): Promise<Role[]> {
    return this.rolesRepository.find({
      where: {
        arrowId,
      },
    });
  }

  async getRoleByUserIdAndArrowId(userId: string, arrowId: string): Promise<Role> {
    return this.rolesRepository.findOne({
      where: {
        userId,
        arrowId,
      },
    });
  }

  async createRole(user: User, arrow: Arrow, type: RoleType): Promise<Role> {
    const role0 = new Role();
    role0.userId = user.id;
    role0.arrowId = arrow.id;
    role0.type = type;
    return this.rolesRepository.save(role0);
  }

  async inviteRole(invitingUserId: string, invitedUserName: string, arrowId: string): Promise<Role> {
    const arrow = await this.arrowsService.getArrowById(arrowId);
    if (!arrow) {
      throw new BadRequestException('This abstract does not exist');
    }
    const invitingRole = await this.getRoleByUserIdAndArrowId(invitingUserId, arrowId);
    if (
      !invitingRole ||  
      (invitingRole.type !== RoleType.ADMIN &&
      invitingRole.type !== RoleType.MEMBER)
    ) {
      throw new BadRequestException('Insufficient privileges');
    }
    const invitedUser = await this.usersService.getUserByName(invitedUserName);
    if (!invitedUser) {
      throw new BadRequestException('This user does not exist');
    }
    const invitedRole = await this.getRoleByUserIdAndArrowId(invitedUser.id, arrowId);
    if (invitedRole) {
      if (invitedRole.isInvited) {
        if (invitedRole.isRequested) {
          throw new BadRequestException('This user is already part of the abstract')
        }
        else {
          throw new BadRequestException('This user has already been invited')
        }
      }
      else {
        if (invitedRole.isRequested) {
          const role0 = new Role();
          role0.id = invitedRole.id;
          role0.type = RoleType.MEMBER;
          role0.isInvited = false;
          role0.isRequested = false;
          await this.rolesRepository.save(role0);
        }
        else {
          const role0 = new Role();
          role0.id = invitedRole.id;
          role0.isInvited = true;
          await this.rolesRepository.save(role0);
        }
      }
    }
    else {
      const role0 = new Role();
      role0.userId = invitedUser.id;
      role0.arrowId = arrowId;
      role0.isInvited = true;
      role0.isRequested = false;
      role0.type = RoleType.OTHER;
      await this.rolesRepository.save(role0);
    }
    return this.getRoleByUserIdAndArrowId(invitedUser.id, arrowId);
  }

  async requestRole(userId: string, arrowId: string): Promise<Role> {
    const role = await this.getRoleByUserIdAndArrowId(userId, arrowId);
    if (role) {
      if (role.isRequested) {
        if (role.isInvited) {
          throw new BadRequestException('This user is already part of the abstract')
        }
        else {
          throw new BadRequestException('This user has already requested membership')
        }
      }
      else {
        if (role.isInvited) {
          const role0 = new Role();
          role0.id = role.id;
          role0.type = RoleType.MEMBER;
          role0.isRequested = false;
          role0.isInvited = false;
          await this.rolesRepository.save(role0);
        }
        else {
          const role0 = new Role();
          role0.id = role.id;
          role0.isRequested = true;
          await this.rolesRepository.save(role0);
        }
      }
    }
    else {
      const abstract = await this.arrowsService.getArrowById(arrowId);
      if (!abstract) {
        throw new BadRequestException('This abstract does not exist')
      }
      const role0 = new Role();
      role0.userId = userId;
      role0.arrowId = arrowId;
      role0.isInvited = false;
      role0.isRequested = true;
      role0.type === RoleType.OTHER;
      await this.rolesRepository.save(role0);
    }
    return this.getRoleByUserIdAndArrowId(userId, arrowId);
  }

  async removeRole(userId: string, roleId: string): Promise<Role> {
    const role = await this.getRoleById(roleId);
    if (!role) {
      throw new BadRequestException('This role does not exist');
    }
    if (role.type === 'ADMIN') {
      throw new BadRequestException('Admins cannot leave abstracts at this time');
    }
    const removerRole = await this.getRoleByUserIdAndArrowId(userId, role.arrowId);
    if (removerRole.type !== 'ADMIN' && removerRole.id !== role.id) {
      throw new BadRequestException('Insufficient privileges');
    }
    await this.rolesRepository.softDelete({id: role.id});

    return this.rolesRepository.findOne({
      where: {
        id: roleId, 
      },
      withDeleted: true
    });
  }
}
