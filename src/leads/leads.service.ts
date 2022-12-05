import { BadRequestException, forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/user.entity';
import { UsersService } from 'src/users/users.service';
import { Repository } from 'typeorm';
import { Lead } from './lead.entity';

@Injectable()
export class LeadsService {
  constructor(
    @InjectRepository(Lead)
    private readonly leadsRepository: Repository<Lead>,
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
  ) {}

  async getLeadById(id: string) {
    return this.leadsRepository.findOne({
      where: {
        id,
      },
    });
  }
  
  async getLeadsByFollowerId(followerId: string) {
    return this.leadsRepository.find({
      where: {
        followerId,
      },
    });
  }

  async getLeadsByLeaderId(leaderId: string, shouldGetFollower: boolean) {
    const relations = shouldGetFollower
      ? ['follower']
      : [];

    return this.leadsRepository.find({
      where: {
        leaderId,
      },
      relations,
    });
  }
  
  async getLeadByFollowerIdAndLeaderId(followerId: string, leaderId: string) {
    return this.leadsRepository.findOne({
      where: {
        followerId,
        leaderId,
      },
    });
  }

  async getLeaders(user: User, userId: string) {
    const user0 = await this.usersService.getUserById(userId);
    if (!user0) {
      throw new BadRequestException('This user does not exist');
    }
    const leads = await this.getLeadsByFollowerId(userId);
    return leads;
  }
  
  async followUser(followerId: string, leaderId: string) {
    const leader = await this.usersService.getUserById(leaderId);
    if (!leader) {
      throw new BadRequestException('This user does not exist');
    }
    const lead = await this.getLeadByFollowerIdAndLeaderId(followerId, leaderId);
    if (lead) {
      throw new BadRequestException('Already following');
    }
    const lead0 = new Lead();
    lead0.followerId = followerId;
    lead0.leaderId = leaderId;
    return this.leadsRepository.save(lead0);
  }

  async unfollowUser(followerId: string, leadId: string) {
    const lead = await this.getLeadById(leadId);
    if (!lead) {
      throw new BadRequestException('This lead does not exist');
    }
    await this.leadsRepository.softDelete({id: lead.id});
    return this.leadsRepository.findOne({
      where: {
        id: lead.id,
      },
      withDeleted: true,
    });
  }

}
