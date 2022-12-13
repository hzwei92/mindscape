import { Inject, UseGuards } from '@nestjs/common';
import { Args, Context, Int, Mutation, Parent, ResolveField, Resolver, Subscription } from '@nestjs/graphql';
import { PUB_SUB } from 'src/pub-sub/pub-sub.module';
import { User } from 'src/users/user.model';
import { UsersService } from 'src/users/users.service';
import { Arrow } from './arrow.model';
import { ArrowsService } from './arrows.service';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import { Role } from 'src/roles/role.model';
import { RolesService } from 'src/roles/roles.service';
import { VotesService } from 'src/votes/votes.service';
import { Vote } from 'src/votes/vote.model';
import { Sheaf } from 'src/sheafs/sheaf.model';
import { SheafsService } from 'src/sheafs/sheafs.service';
import { ReplyArrowResult } from './dto/reply-arrow-result.dto';
import { LinkArrowsResult } from './dto/link-arrows-result.dto';
import { TransfersService } from 'src/transfers/transfers.service';
import { CurrentUser, GqlAuthGuard } from 'src/auth/gql-auth.guard';
import { User as UserEntity } from 'src/users/user.entity';
import { SaveArrowResult } from './dto/save-arrow-result.dto';
import { GetLinksResult } from './dto/get-links-result.dto';

@Resolver(() => Arrow)
export class ArrowsResolver {
  constructor(
    private readonly arrowsService: ArrowsService,
    private readonly usersService: UsersService,
    private readonly rolesService: RolesService,
    private readonly votesService: VotesService,
    private readonly sheafsService: SheafsService,
    private readonly transfersService: TransfersService,
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
    @Parent() arrow: Arrow,
  ) {
    return this.rolesService.getRolesByArrowId(arrow.id);
  }

  @ResolveField(() => [Vote], {name: 'votes'})
  async getArrowVotes(
    @Parent() arrow: Arrow,
  ) {
    return this.votesService.getVotesByArrowId(arrow.id);
  }

  @ResolveField(() => Role, { name: 'currentUserRole', nullable: true })
  async getArrowCurrentUserRole(
    @CurrentUser() user: UserEntity,
    @Parent() arrow: Arrow,
  ) {
    if (user?.id) {
      return this.rolesService.getRoleByUserIdAndArrowId(user.id, arrow.id);
    }
    return null;
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => [Arrow], {name: 'getArrows'})
  async getArrows(
    @CurrentUser() user: UserEntity,
    @Args('arrowIds', {type: () => [String]}) arrowIds: string[],
  ) {
    return this.arrowsService.getArrowsByIdWithPrivacy(user, arrowIds);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Arrow, {name: 'getArrowByRouteName', nullable: true })
  async getArrowByRouteName(
    @CurrentUser() user: UserEntity,
    @Args('routeName') routeName: string,
  ) {
    return this.arrowsService.getArrowByRouteName(routeName);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Arrow, {name: 'setArrowTitle'})
  async setArrowTitle(
    @CurrentUser() user: UserEntity,
    @Args('arrowId') arrowId: string,
    @Args('title') title: string,
  ) {
    return this.arrowsService.setArrowTitle(user, arrowId, title);
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
  @Mutation(() => Arrow, {name: 'setArrowPermissions'})
  async setArrowPermissions(
    @CurrentUser() user: UserEntity,
    @Args('arrowId') arrowId: string,
    @Args('canAssignMemberRole', { nullable: true }) canAssignMemberRole: string,
    @Args('canEditLayout', { nullable: true }) canEditLayout: string,
    @Args('canPost', { nullable: true }) canPost: string,
  ) {
    return this.arrowsService.setArrowPermissions(user, arrowId, canAssignMemberRole, canEditLayout, canPost);
  }

  

  @UseGuards(GqlAuthGuard)
  @Mutation(() => SaveArrowResult, {name: 'saveArrow'})
  async saveArrow(
    @CurrentUser() user: UserEntity,
    @Args('sessionId') sessionId: string,
    @Args('arrowId') arrowId: string,
    @Args('draft') draft: string,
  ) {
    const arrow = await this.arrowsService.saveArrow(user, arrowId, draft);

    await this.usersService.incrementUserSaveN(user);

    if (!user.saveArrowDate) {
      await this.usersService.setSaveArrowDate(user);
    }

    const user1 = await this.usersService.getUserById(user.id);
    
    this.pubSub.publish('saveArrow', {
      sessionId,
      saveArrow: arrow,
    });

    return {
      user: user1,
      arrow,
    };
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => ReplyArrowResult, {name: 'replyArrow'})
  async replyArrow(
    @CurrentUser() user: UserEntity,
    @Args('sessionId') sessionId: string,
    @Args('sourceId') sourceId: string,
    @Args('linkId') linkId: string,
    @Args('targetId') targetId: string,
    @Args('linkDraft') linkDraft: string,
    @Args('targetDraft') targetDraft: string,
  ) {
    const {
      source,
      link,
      linkVote,
      target,
      targetVote,
      alerts,
    } = await this.arrowsService.replyArrow(user, sourceId, linkId, targetId, linkDraft, targetDraft);

    await this.usersService.incrementUserReplyN(user);

    if (!user.firstReplyDate) {
      await this.usersService.setFirstReplyDate(user);
    }
    
    const user1 = await this.transfersService.replyTransfer(user, targetVote, linkVote, source, target);

    this.pubSub.publish('linkArrows', {
      sessionId,
      linkArrows: {
        source,
        link,
        target,
        votes: [linkVote, targetVote],
      },
    });

    alerts.forEach(alert => {
      this.pubSub.publish('alert', {
        userId: alert.userId,
        alert,
      });
    });
  
    return {
      user: user1,
      source,
      link,
      target,
    };
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => ReplyArrowResult, {name: 'pasteArrow'})
  async pasteArrow(
    @CurrentUser() user: UserEntity,
    @Args('sessionId') sessionId: string,
    @Args('sourceId') sourceId: string,
    @Args('linkId') linkId: string,
    @Args('targetId') targetId: string,
    @Args('linkDraft') linkDraft: string,
  ) {
    const { 
      source,
      link,
      linkVote,
      target,
      alerts,
    } = await this.arrowsService.pasteArrow(user, sourceId, linkId, targetId, linkDraft);

    const user1 = await this.transfersService.linkTransfer(user, linkVote, link, source);

    this.pubSub.publish('linkArrows', {
      sessionId,
      linkArrows: {
        source,
        link,
        target,
        votes: [linkVote],
      },
    });

    alerts.forEach(alert => {
      this.pubSub.publish('alert', {
        userId: alert.userId,
        alert,
      });
    })

    return {
      user: user1,
      source,
      link,
      target,
    };
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => LinkArrowsResult, {name: 'linkArrows'})
  async linkArrows(
    @CurrentUser() user: UserEntity,
    @Args('sessionId') sessionId: string,
    @Args('sourceId') sourceId: string,
    @Args('targetId') targetId: string,
  ) {
    const { 
      arrow, 
      vote, 
      source, 
      target,
      alerts,
    } = await this.arrowsService.linkArrows(user, null, sourceId, targetId);

    const user1 = await this.transfersService.linkTransfer(user, vote, arrow, source);

    this.pubSub.publish('linkArrows', {
      sessionId,
      linkArrows: {
        source,
        target,
        link: arrow,
        votes: [vote],
      },
    });

    alerts.forEach(alert => {
      this.pubSub.publish('alert', {
        userId: alert.userId,
        alert,
      });
    });
    
    return {
      user: user1,
      source,
      target,
      link: arrow,
    };
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => GetLinksResult, {name: 'getIns'})
  async getIns(
    @CurrentUser() user: UserEntity,
    @Args('arrowId') arrowId: string,
    @Args('offset', {type: () => Int}) offset: number,
  ) {
    user = await this.usersService.setLoadInsDate(user);
    const arrows = await this.arrowsService.getArrowsByTargetId(arrowId, offset)

    return {
      user, 
      arrows,
    }
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => GetLinksResult, {name: 'getOuts'})
  async getOuts(
    @CurrentUser() user: UserEntity,
    @Args('arrowId') arrowId: string,
    @Args('offset', {type: () => Int}) offset: number,
  ) {
    user = await this.usersService.setLoadOutsDate(user);
    const arrows = await this.arrowsService.getArrowsBySourceId(arrowId, offset);

    return {
      user, 
      arrows,
    }
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

  @Subscription(() => LinkArrowsResult, {name: 'linkArrows',
    filter: (payload, variables) => {
      return variables.arrowIds.some(id => {
        return (
          id === payload.linkArrows.source.id ||
          id === payload.linkArrows.target.id
        )
      });
    }
  })
  linkArrowsSub(
    @Args('sessionId') sessionId: string,
    @Args('arrowIds', {type: () => [String]}) arrowIds: string[]
  ) {
    console.log('linkArrowsSub');
    return this.pubSub.asyncIterator('linkArrows')
  }
}
