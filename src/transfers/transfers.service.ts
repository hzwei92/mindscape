import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Arrow } from 'src/arrows/arrow.entity';
import { User } from 'src/users/user.entity';
import { UsersService } from 'src/users/users.service';
import { Vote } from 'src/votes/vote.entity';
import { Repository } from 'typeorm';
import { Transfer } from './transfer.entity';

@Injectable()
export class TransfersService {
  constructor(
    @InjectRepository(Transfer)
    private readonly transfersRepository: Repository<Transfer>,
    private readonly usersService: UsersService,
  ) {}

  // reply
  async replyTransfer(user: User, targetVote: Vote, linkVote: Vote, sourceArrow: Arrow, targetArrow: Arrow) {
    const reserveUser = await this.usersService.getReserveUser();
    if (!reserveUser) return;

    const sourceUser = await this.usersService.getUserById(sourceArrow.userId);
    if (!sourceUser) return;

    await this.usersService.incrementUserBalance(reserveUser, -9);
    await this.usersService.incrementUserBalance(sourceUser, 1);
    await this.usersService.incrementUserBalance(user, 8);

    const targetTransfer = new Transfer();
    targetTransfer.sender = user;
    targetTransfer.receiver = reserveUser;
    targetTransfer.points = 1;
    targetTransfer.reason = 'replyTwig target';
    targetTransfer.voteId = targetVote.id;
    targetTransfer.arrowId = targetArrow.id;

    const linkTransfer = new Transfer();
    linkTransfer.sender = user;
    linkTransfer.receiver = sourceUser;
    linkTransfer.points = 1;
    linkTransfer.reason = 'replyTwig link';
    linkTransfer.voteId = linkVote.id;
    linkTransfer.arrowId = sourceArrow.id;


    const bonusTransfer = new Transfer();
    bonusTransfer.sender = reserveUser;
    bonusTransfer.receiver = user;
    bonusTransfer.points = 10;
    bonusTransfer.reason = 'replyTwig bonus';
    bonusTransfer.voteId = targetVote.id;
    bonusTransfer.arrowId = targetArrow.id;

    await this.transfersRepository.save([targetTransfer, linkTransfer, bonusTransfer]);

    return this.usersService.getUserById(user.id);
  }

  async linkTransfer(user: User, linkVote: Vote, linkArrow: Arrow, sourceArrow: Arrow) {
    const sourceUser = await this.usersService.getUserById(sourceArrow.userId);
    if (!sourceUser) return;

    await this.usersService.incrementUserBalance(sourceUser, 1);
    await this.usersService.incrementUserBalance(user, -1);

    const sourceTransfer = new Transfer();
    sourceTransfer.sender = user;
    sourceTransfer.receiver = sourceUser;
    sourceTransfer.points = 1;
    sourceTransfer.reason = 'linkArrow source';
    sourceTransfer.voteId = linkVote.id;
    sourceTransfer.arrowId = sourceArrow.id;

    const linkTransfer = new Transfer();
    linkTransfer.sender = user;
    linkTransfer.receiver = user;
    linkTransfer.points = 1;
    linkTransfer.reason = 'linkArrow link';
    linkTransfer.voteId = linkVote.id;
    linkTransfer.arrowId = linkArrow.id;

    await this.transfersRepository.save([linkTransfer]);

    return this.usersService.getUserById(user.id);
  }

  async voteLinkTransfer(user: User, linkVote: Vote, sourceArrow: Arrow, linkArrow: Arrow) {
    const sourceUser = await this.usersService.getUserById(sourceArrow.userId);
    if (!sourceUser) return;

    const linkUser = await this.usersService.getUserById(linkArrow.userId);
    if (!linkUser) return;

    await this.usersService.incrementUserBalance(sourceUser, 1);

    if (linkUser.id === user.id) {
      await this.usersService.incrementUserBalance(user, -1);
    }
    else {
      await this.usersService.incrementUserBalance(linkUser, 1);
      await this.usersService.incrementUserBalance(user, -2);
    }
    const sourceTransfer = new Transfer();
    sourceTransfer.sender = user;
    sourceTransfer.receiver = sourceUser;
    sourceTransfer.points = 1;
    sourceTransfer.reason = 'voteLink source';
    sourceTransfer.voteId = linkVote.id;
    sourceTransfer.arrowId = sourceArrow.id;

    const linkTransfer = new Transfer();
    linkTransfer.sender = user;
    linkTransfer.receiver = linkUser;
    linkTransfer.points = 1;
    linkTransfer.reason = 'voteLink link';
    linkTransfer.voteId = linkVote.id;
    linkTransfer.arrowId = linkArrow.id;

    await this.transfersRepository.save([sourceTransfer, linkTransfer]);

    return this.usersService.getUserById(user.id);
  }

  async votePostTransfer(user: User, targetVote: Vote, targetArrow: Arrow) {
    const reserveUser = await this.usersService.getReserveUser();
    if (!reserveUser) return;

    const targetUser = await this.usersService.getUserById(targetArrow.userId);
    if (!targetUser) return;

    await this.usersService.incrementUserBalance(reserveUser, 1);

    if (targetUser.id === user.id) {
      await this.usersService.incrementUserBalance(user, -1);
    }
    else {
      await this.usersService.incrementUserBalance(targetUser, 1);
      await this.usersService.incrementUserBalance(user, -2);
    }

    const reserveTransfer = new Transfer();
    reserveTransfer.sender = user;
    reserveTransfer.receiver = reserveUser;
    reserveTransfer.points = 1;
    reserveTransfer.reason = 'votePost reserve';
    reserveTransfer.voteId = targetVote.id;
    reserveTransfer.arrowId = targetArrow.id;

    const targetTransfer = new Transfer();
    targetTransfer.sender = user;
    targetTransfer.receiver = targetUser;
    targetTransfer.points = 1;
    targetTransfer.reason = 'votePost target';
    targetTransfer.voteId = targetVote.id;
    targetTransfer.arrowId = targetArrow.id;

    await this.transfersRepository.save([reserveTransfer, targetTransfer]);

    return this.usersService.getUserById(user.id);
  }
}
