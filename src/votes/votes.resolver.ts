import { Args, Int, Mutation, Parent, ResolveField, Resolver, Subscription } from '@nestjs/graphql';
import { User } from 'src/users/user.model';
import { UsersService } from 'src/users/users.service';
import { Vote } from './vote.model';
import { VotesService } from './votes.service';
import { VoteArrowResult } from './dto/vote-arrow-result.dto';
import { TransfersService } from 'src/transfers/transfers.service';
import { ArrowsService } from 'src/arrows/arrows.service';
import { Inject, UseGuards } from '@nestjs/common';
import { CurrentUser, GqlAuthGuard } from 'src/auth/gql-auth.guard';
import { User as UserEntity } from 'src/users/user.entity';
import { PUB_SUB } from 'src/pub-sub/pub-sub.module';
import { RedisPubSub } from 'graphql-redis-subscriptions';

@Resolver(() => Vote)
export class VotesResolver {
  constructor(
    private readonly usersService: UsersService,
    private readonly votesService: VotesService,
    private readonly arrowsService: ArrowsService,
    private readonly transfersService: TransfersService,
    @Inject(PUB_SUB)
    private readonly pubSub: RedisPubSub,
  ) {}

  @ResolveField(() => User, {name: 'user'})
  getVoteUser(
    @Parent() vote: Vote,
  ) {
    return this.usersService.getUserById(vote.userId);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => VoteArrowResult, {name: 'voteArrow'})
  async voteArrow(
    @CurrentUser() user: UserEntity,
    @Args('sessionId') sessionId: string,
    @Args('arrowId') arrowId: string,
    @Args('weight', {type: () => Int}) weight: number,
  ) {
    const { arrow, votes } = await this.votesService.voteArrow(user, arrowId, weight);

    let user1;
    if (arrow.sourceId === arrow.targetId) {
      user1 = await this.transfersService.votePostTransfer(user, votes[0], arrow)
    }
    else {
      const sourceArrow = await this.arrowsService.getArrowById(arrow.sourceId);
      user1 = await this.transfersService.voteLinkTransfer(user, votes[0], sourceArrow, arrow)
    }

    this.pubSub.publish('voteArrow', {
      sessionId,
      voteArrow: {
        user: user1,
        arrow,
        votes,
      },
    });

    return {
      user: user1,
      arrow,
      votes,
    }
  }

  @Subscription(() => VoteArrowResult, {name: 'voteArrow',
    filter: (payload, variables) => {
      if (payload.sessionId === variables.sessionId) return false;
      return variables.arrowIds.some(id => id === payload.voteArrow.arrow.id);
    },
  })
  async voteArrowSub(
    @Args('sessionId') sessionId: string,
    @Args('arrowIds', {type: () => [String]}) arrowIds: string[],
  ) {
    console.log('voteArrowSub');
    return this.pubSub.asyncIterator('voteArrow');
  }
}
