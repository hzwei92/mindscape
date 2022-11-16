import { Args, Int, Mutation, Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { User } from 'src/users/user.model';
import { UsersService } from 'src/users/users.service';
import { Vote } from './vote.model';
import { VotesService } from './votes.service';
import { VoteArrowResult } from './dto/vote-arrow-result.dto';
import { TransfersService } from 'src/transfers/transfers.service';
import { ArrowsService } from 'src/arrows/arrows.service';
import { UseGuards } from '@nestjs/common';
import { CurrentUser, GqlAuthGuard } from 'src/auth/gql-auth.guard';
import { User as UserEntity } from 'src/users/user.entity';

@Resolver(() => Vote)
export class VotesResolver {
  constructor(
    private readonly usersService: UsersService,
    private readonly votesService: VotesService,
    private readonly arrowsService: ArrowsService,
    private readonly transfersService: TransfersService,
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
    const result = await this.votesService.voteArrow(user, arrowId, weight);

    let user1;
    if (result.arrow.sourceId === result.arrow.targetId) {
      user1 = await this.transfersService.votePostTransfer(user, result.votes[0], result.arrow)
    }
    else {
      const sourceArrow = await this.arrowsService.getArrowById(result.arrow.sourceId);
      user1 = await this.transfersService.voteLinkTransfer(user, result.votes[0], sourceArrow, result.arrow)
    }

    return {
      ...result,
      user: user1,
    }
  }
}
