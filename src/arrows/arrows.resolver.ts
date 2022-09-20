import { Inject, UseGuards } from '@nestjs/common';
import { Args, Context, Int, Mutation, Parent, Query, ResolveField, Resolver, Subscription } from '@nestjs/graphql';
import { CurrentUser, GqlAuthGuard } from 'src/auth/gql-auth.guard';
import { PUB_SUB } from 'src/pub-sub/pub-sub.module';
import { User } from 'src/users/user.model';
import { UsersService } from 'src/users/users.service';
import { Arrow } from './arrow.model';
import { ArrowsService } from './arrows.service';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import { SubsService } from 'src/subs/subs.service';
import { Sub } from 'src/subs/sub.model';
import { Role } from 'src/roles/role.model';
import { RolesService } from 'src/roles/roles.service';
import { VotesService } from 'src/votes/votes.service';
import { Vote } from 'src/votes/vote.model';
import { User as UserEntity } from 'src/users/user.entity';
import { Sheaf } from 'src/sheafs/sheaf.model';
import { SheafsService } from 'src/sheafs/sheafs.service';
import { ReplyArrowResult } from './dto/reply-arrow-result.dto';

@Resolver(() => Arrow)
export class ArrowsResolver {
  constructor(
    private readonly arrowsService: ArrowsService,
    private readonly usersService: UsersService,
    private readonly rolesService: RolesService,
    private readonly subsService: SubsService,
    private readonly votesService: VotesService,
    private readonly sheafsService: SheafsService,
    @Inject(PUB_SUB)
    private readonly pubSub: RedisPubSub,
  ) {}
  
  @ResolveField(() => User, {name: 'user'})
  async getArrowUser(
    @Parent() arrow: Arrow,
  ) {
    return this.usersService.getUserById(arrow.userId);
  }
  
  @ResolveField(() => Arrow, {name: 'source', nullable: true})
  async getArrowSource(
    @Parent() arrow: Arrow,
  ) {
    return this.arrowsService.getArrowById(arrow.sourceId);
  }

  @ResolveField(() => Arrow, {name: 'target', nullable: true})
  async getArrowTarget(
    @Parent() arrow: Arrow,
  ) {
    return this.arrowsService.getArrowById(arrow.targetId);
  }

  @ResolveField(() => Sheaf, {name: 'sheaf'})
  async getArrowSheaf(
    @Parent() arrow: Arrow,
  ) {
    return this.sheafsService.getSheafById(arrow.sheafId);
  }

  @ResolveField(() => Arrow, {name: 'abstract'})
  async getArrowAbstract(
    @Parent() arrow: Arrow,
  ) {
    return this.arrowsService.getArrowById(arrow.abstractId);
  }

  @ResolveField(() => [Role], {name: 'roles'})
  async getArrowRoles(
    @CurrentUser() user: UserEntity,
    @Parent() arrow: Arrow,
  ) {
    return this.rolesService.getRolesByArrowId(arrow.id);
  }

  @ResolveField(() => [Sub], {name: 'subs'})
  async getArrowSubs(
    @CurrentUser() user: UserEntity,
    @Parent() arrow: Arrow,
  ) {
    return this.subsService.getSubsByArrowId(arrow.id, false);
  }

  @ResolveField(() => [Vote], {name: 'votes'})
  async getArrowVotes(
    @CurrentUser() user: UserEntity,
    @Parent() arrow: Arrow,
  ) {
    return this.votesService.getVotesByArrowId(arrow.id);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Arrow, {name: 'getArrowByRouteName', nullable: true })
  async getArrowByRouteName(
    @Args('routeName') routeName: string,
  ) {
    return this.arrowsService.getArrowByRouteName(routeName);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Arrow, {name: 'setArrowColor'})
  async setArrowColor(
    @CurrentUser() user: UserEntity,
    @Args('arrowId') arrowId: string,
    @Args('color') color: string,
  ) {
    return this.arrowsService.setArrowColor(user, arrowId, color);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Arrow, {name: 'saveArrow'})
  async saveArrow(
    @CurrentUser() user: UserEntity,
    @Args('sessionId') sessionId: string,
    @Args('arrowId') arrowId: string,
    @Args('draft') draft: string,
  ) {
    const arrow = await this.arrowsService.saveArrow(user, arrowId, draft);

    this.pubSub.publish('saveArrow', {
      sessionId,
      saveArrow: arrow,
    });

    return arrow;
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => ReplyArrowResult, {name: 'replyArrow'})
  async replyArrow(
    @CurrentUser() user: UserEntity,
    @Args('sessionId') sessionId: string,
    @Args('abstractId') abstractId: string,
    @Args('sourceId') sourceId: string,
    @Args('linkId') linkId: string,
    @Args('targetId') targetId: string,
    @Args('linkDraft') linkDraft: string,
    @Args('targetDraft') targetDraft: string,
  ) {
    const { 
      source,
      link,
      target,
    } = await this.arrowsService.replyArrow(user, abstractId, sourceId, linkId, targetId, linkDraft, targetDraft);
    this.pubSub.publish('linkArrows', {
      sessionId,
      linkArrows: link,
    });
    return {
      source,
      link,
      target,
    };
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => [Arrow], {name: 'getIns'})
  async getIns(
    @Args('arrowId') arrowId: string,
    @Args('offset', {type: () => Int}) offset: number,
  ) {
    return this.arrowsService.getArrowsByTargetId(arrowId, offset)
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => [Arrow], {name: 'getOuts'})
  async getOuts(
    @Args('arrowId') arrowId: string,
    @Args('offset', {type: () => Int}) offset: number,
  ) {
    return this.arrowsService.getArrowsBySourceId(arrowId, offset)
  }

  @Subscription(() => Arrow, {name: 'saveArrow',
    filter: (payload, variables) => {
      if (payload.sessionId === variables.sessionId) return false;
      return variables.arrowIds.some(id => id === payload.saveArrow.id);
    },
    async resolve(this: ArrowsResolver, value, variables) {
      const arrow = await this.arrowsService.getArrowByIdWithPrivacy(variables.userId, value.saveArrow.id);
      return arrow
    },
  })
  saveArrowSub(
    @Context() context: any,
    @Args('sessionId') sessionId: string,
    @Args('userId') userId: string,
    @Args('arrowIds', {type: () => [String]}) arrowIds: string[]
  ) {
    console.log('saveArrowSub'); // TODO check userId === context.user.id
    return this.pubSub.asyncIterator('saveArrow');
  }

}
