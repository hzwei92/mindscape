import { BadRequestException, Injectable } from '@nestjs/common';
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

  async createGraphTransfer(user: User, vote: Vote, arrow: Arrow) {
    const reserveUser = await this.usersService.getReserveUser();
    if (!reserveUser) return;

    await this.usersService.incrementUserBalance(reserveUser, -9);
    await this.usersService.incrementUserBalance(user, 9);

    const transfer = new Transfer();
    transfer.sender = user;
    transfer.receiver = reserveUser;
    transfer.points = 1;
    transfer.reason = 'createGraph';
    transfer.voteId = vote.id;
    transfer.arrowId = arrow.id;

    await this.transfersRepository.save(transfer);

    return this.usersService.getUserById(user.id);
  }

  async replyTransfer(user: User, targetVote: Vote, linkVote: Vote, sourceArrow: Arrow, targetArrow: Arrow) {
    const reserveUser = await this.usersService.getReserveUser();
    if (!reserveUser) return;

    const sourceUser = await this.usersService.getUserById(sourceArrow.userId);
    if (!sourceUser) return;

    await this.usersService.incrementUserBalance(reserveUser, -9);
    if (user.id === sourceUser.id) {
      await this.usersService.incrementUserBalance(user, 9);
    }
    else {
      await this.usersService.incrementUserBalance(sourceUser, 1);
      await this.usersService.incrementUserBalance(user, 8);
    }

    const transfers = [];

    const targetTransfer = new Transfer();
    targetTransfer.sender = user;
    targetTransfer.receiver = reserveUser;
    targetTransfer.points = 1;
    targetTransfer.reason = 'reply: target-vote reserve';
    targetTransfer.voteId = targetVote.id;
    targetTransfer.arrowId = targetArrow.id;
    transfers.push(targetTransfer);

    if (user.id !== sourceUser.id) {
      const linkTransfer = new Transfer();
      linkTransfer.sender = user;
      linkTransfer.receiver = sourceUser;
      linkTransfer.points = 1;
      linkTransfer.reason = 'reply: link-vote source';
      linkTransfer.voteId = linkVote.id;
      linkTransfer.arrowId = sourceArrow.id;
      transfers.push(linkTransfer);
    }

    const bonusTransfer = new Transfer();
    bonusTransfer.sender = reserveUser;
    bonusTransfer.receiver = user;
    bonusTransfer.points = 10;
    bonusTransfer.reason = 'reply: bonus';
    bonusTransfer.voteId = targetVote.id;
    bonusTransfer.arrowId = targetArrow.id;
    transfers.push(bonusTransfer);

    await this.transfersRepository.save(transfers);

    return this.usersService.getUserById(user.id);
  }
  async linkTransfer(user: User, linkVote: Vote, linkArrow: Arrow, sourceArrow: Arrow) {
    const sourceUser = await this.usersService.getUserById(sourceArrow.userId);
    if (!sourceUser) {
      throw new BadRequestException('Source user not found');
    }
    
    if (sourceUser.id === user.id) return user;

    await this.usersService.incrementUserBalance(sourceUser, 1);
    await this.usersService.incrementUserBalance(user, -1);

    const sourceTransfer = new Transfer();
    sourceTransfer.sender = user;
    sourceTransfer.receiver = sourceUser;
    sourceTransfer.points = 1;
    sourceTransfer.reason = 'link: link-vote source';
    sourceTransfer.voteId = linkVote.id;
    sourceTransfer.arrowId = sourceArrow.id;

    await this.transfersRepository.save([sourceTransfer]);

    return this.usersService.getUserById(user.id);
  }

  async voteLinkTransfer(user: User, linkVote: Vote, sourceArrow: Arrow, linkArrow: Arrow) {
    const sourceUser = await this.usersService.getUserById(sourceArrow.userId);
    if (!sourceUser) {
      throw new BadRequestException('Source user not found');
    }

    const linkUser = await this.usersService.getUserById(linkArrow.userId);
    if (!linkUser) {
      throw new BadRequestException('Link user not found');
    }

    const transfers = [];
    if (sourceUser.id === user.id) {
      await this.usersService.incrementUserBalance(sourceUser, 1);
      const sourceTransfer = new Transfer();
      sourceTransfer.sender = user;
      sourceTransfer.receiver = user;
      sourceTransfer.points = 1;
      sourceTransfer.reason = 'vote: link-vote source';
      sourceTransfer.voteId = linkVote.id;
      sourceTransfer.arrowId = sourceArrow.id;
      transfers.push(sourceTransfer);
    }

    if (linkUser.id === user.id) {
      await this.usersService.incrementUserBalance(linkUser, 1);
      const linkTransfer = new Transfer();
      linkTransfer.sender = user;
      linkTransfer.receiver = linkUser;
      linkTransfer.points = 1;
      linkTransfer.reason = 'vote: link-vote link';
      linkTransfer.voteId = linkVote.id;
      linkTransfer.arrowId = linkArrow.id;
      transfers.push(linkTransfer);
    }

    if (transfers.length === 0) return user;

    await this.usersService.incrementUserBalance(user, -1 * transfers.length);
    await this.transfersRepository.save(transfers);

    return this.usersService.getUserById(user.id);
  }

  async votePostTransfer(user: User, targetVote: Vote, targetArrow: Arrow) {
    const reserveUser = await this.usersService.getReserveUser();
    if (!reserveUser) return;

    const targetUser = await this.usersService.getUserById(targetArrow.userId);
    if (!targetUser) return;

    await this.usersService.incrementUserBalance(reserveUser, 1);

    const transfers = [];

    const reserveTransfer = new Transfer();
    reserveTransfer.sender = user;
    reserveTransfer.receiver = reserveUser;
    reserveTransfer.points = 1;
    reserveTransfer.reason = 'vote: post-vote reserve';
    reserveTransfer.voteId = targetVote.id;
    reserveTransfer.arrowId = targetArrow.id;
    transfers.push(reserveTransfer);

    if (targetUser.id === user.id) {
      await this.usersService.incrementUserBalance(user, -1);
    }
    else {
      await this.usersService.incrementUserBalance(targetUser, 1);
      await this.usersService.incrementUserBalance(user, -2);

      const targetTransfer = new Transfer();
      targetTransfer.sender = user;
      targetTransfer.receiver = targetUser;
      targetTransfer.points = 1;
      targetTransfer.reason = 'votePost target';
      targetTransfer.voteId = targetVote.id;
      targetTransfer.arrowId = targetArrow.id;
      transfers.push(targetTransfer);
    }

    await this.transfersRepository.save(transfers);

    return this.usersService.getUserById(user.id);
  }
}
