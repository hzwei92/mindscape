import { BadRequestException, forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Arrow } from 'src/arrows/arrow.entity';
import { ArrowsService } from 'src/arrows/arrows.service';
import { User } from 'src/users/user.entity';
import { Repository } from 'typeorm';
import { Sub } from './sub.entity';

@Injectable()
export class SubsService {
  constructor(
    @InjectRepository(Sub)
    private readonly subsRepository: Repository<Sub>,
    @Inject(forwardRef(() => ArrowsService))
    private readonly arrowsService: ArrowsService,
  ) {}

  async getSubById(id: string) {
    return this.subsRepository.findOne({
      where: {
        id,
      }
    });
  }

  async getSubsByUserId(userId: string) {
    return this.subsRepository.find({
      where: {
        userId,
      },
    });
  }

  async getSubsByArrowId(arrowId: string, shouldGetUser) {
    const relations = shouldGetUser
      ? ['user']
      : [];
    return this.subsRepository.find({
      where: {
        arrowId,
      },
      relations,
    });
  }

  async getSubByUserIdAndArrowId(userId: string, arrowId: string) {
    return this.subsRepository.findOne({
      where: {
        userId,
        arrowId,
      },
    });
  }

  async createSubs(user: User, arrows: Arrow[]) {
    const subs0 = arrows.map(arrow => {
      const sub0 = new Sub();
      sub0.userId = user.id;
      sub0.arrowId = arrow.id;
      return sub0;
    })
    return this.subsRepository.save(subs0);
  }
  
  async sub(userId: string, arrowId: string): Promise<Sub> {
    const arrow = await this.arrowsService.getArrowById(arrowId);
    if (!arrow) {
      throw new BadRequestException('This arrow does not exist');
    }
    const sub = await this.getSubByUserIdAndArrowId(userId, arrowId);
    if (sub) {
      throw new BadRequestException('Already subbed');
    }
    const sub0 = new Sub();
    sub0.userId = userId;
    sub0.arrowId = arrowId;
    return this.subsRepository.save(sub0);
  }

  async unsub(userId: string, arrowId: string): Promise<Sub> {
    const sub = await this.getSubByUserIdAndArrowId(userId, arrowId);
    if (!sub) {
      throw new BadRequestException('This sub does not exist');
    }
    await this.subsRepository.softDelete({id: sub.id});

    return this.subsRepository.findOne({
      where: {
        id: sub.id,
      },
      withDeleted: true,
    });
  }
}
