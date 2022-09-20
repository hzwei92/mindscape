import { UseGuards } from '@nestjs/common';
import { Args, Int, Mutation, Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { CurrentUser, GqlAuthGuard } from 'src/auth/gql-auth.guard';
import { User } from 'src/users/user.model';
import { UsersService } from 'src/users/users.service';
import { Vote } from './vote.model';
import { VotesService } from './votes.service';
import { User as UserEntity } from 'src/users/user.entity';
import { VoteArrowResult } from './dto/vote-arrow.dto';

@Resolver(() => Vote)
export class VotesResolver {
  constructor(
    private readonly usersService: UsersService,
    private readonly votesService: VotesService,
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
    @Args('clicks', {type: () => Int}) clicks: number,
  ) {
    return this.votesService.voteArrow(user, arrowId, clicks);
  }
}
