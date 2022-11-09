import { BadRequestException, Inject } from '@nestjs/common';
import { Args, Context, Int, Mutation, Parent, ResolveField, Resolver, Subscription } from '@nestjs/graphql';
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
import { Sheaf } from 'src/sheafs/sheaf.model';
import { SheafsService } from 'src/sheafs/sheafs.service';
import { ReplyArrowResult } from './dto/reply-arrow-result.dto';
import { LinkArrowsResult } from './dto/link-arrows-result.dto';
import { TransfersService } from 'src/transfers/transfers.service';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

@Resolver(() => Arrow)
export class ArrowsResolver {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly arrowsService: ArrowsService,
    private readonly usersService: UsersService,
    private readonly rolesService: RolesService,
    private readonly subsService: SubsService,
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

  @ResolveField(() => [Sub], {name: 'subs'})
  async getArrowSubs(
    @Parent() arrow: Arrow,
  ) {
    return this.subsService.getSubsByArrowId(arrow.id, false);
  }

  @ResolveField(() => [Vote], {name: 'votes'})
  async getArrowVotes(
    @Parent() arrow: Arrow,
  ) {
    return this.votesService.getVotesByArrowId(arrow.id);
  }

  @Mutation(() => [Arrow], {name: 'getArrows'})
  async getArrows(
    @Args('accessToken') accessToken: string,
    @Args('arrowIds', {type: () => [String]}) arrowIds: string[],
  ) {
    const payload = this.jwtService.verify(accessToken, {
      secret: this.configService.get('JWT_ACCESS_TOKEN_SECRET')
    });
    const user = await this.usersService.getUserById(payload.userId);
    if (!user) {
      throw new BadRequestException('Invalid accessToken');
    }
    return this.arrowsService.getArrowsByIdWithPrivacy(user, arrowIds);
  }

  @Mutation(() => Arrow, {name: 'getArrowByRouteName', nullable: true })
  async getArrowByRouteName(
    @Args('accessToken') accessToken: string,
    @Args('routeName') routeName: string,
  ) {
    const payload = this.jwtService.verify(accessToken, {
      secret: this.configService.get('JWT_ACCESS_TOKEN_SECRET')
    });
    const user = await this.usersService.getUserById(payload.userId);
    if (!user) {
      throw new BadRequestException('Invalid accessToken');
    }
    return this.arrowsService.getArrowByRouteName(routeName);
  }

  @Mutation(() => Arrow, {name: 'setArrowColor'})
  async setArrowColor(
    @Args('accessToken') accessToken: string,
    @Args('arrowId') arrowId: string,
    @Args('color') color: string,
  ) {
    const payload = this.jwtService.verify(accessToken, {
      secret: this.configService.get('JWT_ACCESS_TOKEN_SECRET')
    });
    const user = await this.usersService.getUserById(payload.userId);
    if (!user) {
      throw new BadRequestException('Invalid accessToken');
    }

    return this.arrowsService.setArrowColor(user, arrowId, color);
  }

  @Mutation(() => Arrow, {name: 'saveArrow'})
  async saveArrow(
    @Args('accessToken') accessToken: string,
    @Args('sessionId') sessionId: string,
    @Args('arrowId') arrowId: string,
    @Args('draft') draft: string,
  ) {
    const payload = this.jwtService.verify(accessToken, {
      secret: this.configService.get('JWT_ACCESS_TOKEN_SECRET')
    });
    const user = await this.usersService.getUserById(payload.userId);
    if (!user) {
      throw new BadRequestException('Invalid accessToken');
    }

    const arrow = await this.arrowsService.saveArrow(user, arrowId, draft);

    this.pubSub.publish('saveArrow', {
      sessionId,
      saveArrow: arrow,
    });

    return arrow;
  }

  @Mutation(() => ReplyArrowResult, {name: 'replyArrow'})
  async replyArrow(
    @Args('accessToken') accessToken: string,
    @Args('sessionId') sessionId: string,
    @Args('sourceId') sourceId: string,
    @Args('linkId') linkId: string,
    @Args('targetId') targetId: string,
    @Args('linkDraft') linkDraft: string,
    @Args('targetDraft') targetDraft: string,
  ) {
    const payload = this.jwtService.verify(accessToken, {
      secret: this.configService.get('JWT_ACCESS_TOKEN_SECRET')
    });
    const user = await this.usersService.getUserById(payload.userId);
    if (!user) {
      throw new BadRequestException('Invalid accessToken');
    }

    const {
      source,
      link,
      linkVote,
      target,
      targetVote,
    } = await this.arrowsService.replyArrow(user, sourceId, linkId, targetId, linkDraft, targetDraft);

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
    return {
      user: user1,
      source,
      link,
      target,
    };
  }

  @Mutation(() => ReplyArrowResult, {name: 'pasteArrow'})
  async pasteArrow(
    @Args('accessToken') accessToken: string,
    @Args('sessionId') sessionId: string,
    @Args('sourceId') sourceId: string,
    @Args('linkId') linkId: string,
    @Args('targetId') targetId: string,
    @Args('linkDraft') linkDraft: string,
  ) {
    const payload = this.jwtService.verify(accessToken, {
      secret: this.configService.get('JWT_ACCESS_TOKEN_SECRET')
    });
    const user = await this.usersService.getUserById(payload.userId);
    if (!user) {
      throw new BadRequestException('Invalid accessToken');
    }

    const { 
      source,
      link,
      linkVote,
      target,
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

    return {
      user: user1,
      source,
      link,
      target,
    };
  }

  @Mutation(() => LinkArrowsResult, {name: 'linkArrows'})
  async linkArrows(
    @Args('accessToken') accessToken: string,
    @Args('sessionId') sessionId: string,
    @Args('sourceId') sourceId: string,
    @Args('targetId') targetId: string,
  ) {
    const payload = this.jwtService.verify(accessToken, {
      secret: this.configService.get('JWT_ACCESS_TOKEN_SECRET')
    });
    const user = await this.usersService.getUserById(payload.userId);
    if (!user) {
      throw new BadRequestException('Invalid accessToken');
    }

    const { arrow, vote, source, target } = await this.arrowsService.linkArrows(user, null, sourceId, targetId);

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

    return {
      user: user1,
      source,
      target,
      link: arrow,
    };
  }

  @Mutation(() => [Arrow], {name: 'getIns'})
  async getIns(
    @Args('accessToken') accessToken: string,
    @Args('arrowId') arrowId: string,
    @Args('offset', {type: () => Int}) offset: number,
  ) {
    const payload = this.jwtService.verify(accessToken, {
      secret: this.configService.get('JWT_ACCESS_TOKEN_SECRET')
    });
    const user = await this.usersService.getUserById(payload.userId);
    if (!user) {
      throw new BadRequestException('Invalid accessToken');
    }
    return this.arrowsService.getArrowsByTargetId(arrowId, offset)
  }

  @Mutation(() => [Arrow], {name: 'getOuts'})
  async getOuts(
    @Args('accessToken') accessToken: string,
    @Args('arrowId') arrowId: string,
    @Args('offset', {type: () => Int}) offset: number,
  ) {
    const payload = this.jwtService.verify(accessToken, {
      secret: this.configService.get('JWT_ACCESS_TOKEN_SECRET')
    });
    const user = await this.usersService.getUserById(payload.userId);
    if (!user) {
      throw new BadRequestException('Invalid accessToken');
    }
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
