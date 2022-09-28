import { BadRequestException, forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Arrow } from 'src/arrows/arrow.entity';
import { ArrowsService } from 'src/arrows/arrows.service';
import { User } from 'src/users/user.entity';
import { UsersService } from 'src/users/users.service';
import { findDefaultWeight } from 'src/utils';
import { Not, Repository } from 'typeorm';
import { Vote } from './vote.entity';

@Injectable()
export class VotesService {
  constructor(
    @InjectRepository(Vote)
    private readonly votesRepository: Repository<Vote>,
    @Inject(forwardRef(() => ArrowsService))
    private readonly arrowsService: ArrowsService,
  ) {}

  async getVotesByArrowId(arrowId: string): Promise<Vote[]> {
    return this.votesRepository.find({
      where: {
        arrowId,
      },
    });
  }

  async getVoteByUserIdAndArrowId(userId:string, arrowId: string): Promise<Vote> {
    return this.votesRepository.findOne({
      where: {
        userId,
        arrowId,
      }
    })
  }

  async getForeignVote(userId: string, arrowId: string): Promise<Vote> {
    return this.votesRepository.findOne({
      where: {
        userId: Not(userId),
        arrowId,
      }
    })
  }


  async createInitialVotes(user: User, arrows: Arrow[]) {
    const votes0 = arrows.map(arrow => {
      const vote0 = new Vote();
      vote0.userId = user.id;
      vote0.arrowId = arrow.id;
      return vote0;
    })
    return this.votesRepository.save(votes0);
  }
  
  async createVote(user: User, arrow: Arrow, weight: number): Promise<Vote> {
    const vote0 = new Vote();
    vote0.userId = user.id;
    vote0.arrowId = arrow.id;
    vote0.weight = weight;
    return this.votesRepository.save(vote0);
  }

  async deleteVote(voteId: string) {
    const vote = await this.votesRepository.findOne({
      where: {
        id: voteId
      }
    });
    if (!vote) {
      throw new BadRequestException('This vote does not exist');
    }
    await this.votesRepository.softDelete({id: voteId});
  }

  async voteArrow(user: User, arrowId: string, weight: number) {
    let arrow = await this.arrowsService.getArrowById(arrowId);
    if (!arrow) {
      throw new BadRequestException('This arrow does not exist');
    }

    let vote = await this.getVoteByUserIdAndArrowId(user.id, arrowId);
    if (vote) {
      if (Math.abs(vote.weight - weight) > 1) {
        throw new BadRequestException('You can only change your vote by 1');
      }
      vote.deleteDate = new Date();
      vote = await this.votesRepository.save(vote);
    }

    const newVote = await this.createVote(user, arrow, weight);
    const votes = [newVote];
    
    if (vote) {
      votes.push(vote);
    }
    
    arrow = await this.arrowsService.incrementWeight(arrowId, weight - (vote?.weight ?? 0));

    return {
      arrow,
      votes,
    };
  }
}
