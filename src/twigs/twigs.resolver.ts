import { Inject, UseGuards } from '@nestjs/common';
import { Args, Int, Mutation, Parent, ResolveField, Resolver, Subscription } from '@nestjs/graphql';
import { Arrow } from 'src/arrows/arrow.model';
import { ArrowsService } from 'src/arrows/arrows.service';
import { PUB_SUB } from 'src/pub-sub/pub-sub.module';
import { UsersService } from 'src/users/users.service';
import { Twig } from './twig.model';
import { TwigsService } from './twigs.service';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import { User } from 'src/users/user.model';
import { ReplyTwigResult } from './dto/reply-twig-result.dto';
import { LinkTwigsResult } from './dto/link-twigs-result.dto';
import { SelectTwigResult } from './dto/select-twig-result.dto';
import { MoveTwigResult } from './dto/move-twig-result.dto';
import { OpenTwigResult } from './dto/open-twig-result.dto';
import { RemoveTwigResult } from './dto/remove-twig-result.dto';
import { DragTwigResult } from './dto/drag-twig-result.dto';
import { GraftTwigResult } from './dto/graft-twig-result.dto';
import { CopyTwigResult } from './dto/copy-twig-result.dto';
import { TransfersService } from 'src/transfers/transfers.service';
import { CurrentUser, GqlAuthGuard } from 'src/auth/gql-auth.guard';
import { User as UserEntity } from 'src/users/user.entity';

@Resolver(() => Twig)
export class TwigsResolver {
  constructor(
    private readonly twigsService: TwigsService,
    private readonly usersService: UsersService,
    private readonly arrowsService: ArrowsService,
    private readonly transfersService: TransfersService,
    @Inject(PUB_SUB)
    private readonly pubSub: RedisPubSub
  ) {}

  @ResolveField(() => Twig, {name: 'parent', nullable: true})
  async getTwigParent(
    @Parent() twig: Twig,
  ) {
    return this.twigsService.getTwigByChildId(twig.id);
  }

  @ResolveField(() => [Twig], {name: 'children'})
  async getTwigChildren() {
    return [];
  }

  @ResolveField(() => User, {name: 'user'})
  async getTwigUser(
    @Parent() twig: Twig,
  ) {
    return this.usersService.getUserById(twig.userId);
  }

  @ResolveField(() => Arrow, {name: 'detail', nullable: true})
  async getTwigDetail(
    @Parent() twig: Twig,
  ) {
    if (!twig.detailId) return null;
    return this.arrowsService.getArrowById(twig.detailId);
  }

  @ResolveField(() => Arrow, {name: 'abstract'})
  async getTwigAbstract(
    @Parent() twig: Twig,
  ) {
    return this.arrowsService.getArrowById(twig.abstractId);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => [Twig], {name: 'getTwigs'})
  async getTwigs(
    @CurrentUser() user: UserEntity,
    @Args('abstractId') abstractId: string,
  ) {
    return this.twigsService.getTwigsByAbstractId(abstractId);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => ReplyTwigResult, {name: 'replyTwig'})
  async replyTwig(
    @CurrentUser() user: UserEntity,
    @Args('sessionId') sessionId: string,
    @Args('parentTwigId') parentTwigId: string,
    @Args('twigId') twigId: string,
    @Args('postId') postId: string,
    @Args('x', {type: () => Int}) x: number,
    @Args('y', {type: () => Int}) y: number,
    @Args('draft') draft: string,
  ) {
    const result = await this.twigsService.replyTwig(user, parentTwigId, twigId, postId, x, y, draft);
  
    const user1 = await this.transfersService.replyTransfer(user, result.targetVote, result.linkVote, result.source, result.targetArrow);
    
    this.pubSub.publish('replyTwig', {
      sessionId,
      abstractId: result.abstract.id,
      replyTwig: result,
    });

    return {
      ...result,
      user: user1,
    };
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => ReplyTwigResult, {name: 'pasteTwig'})
  async pasteTwig(
    @CurrentUser() user: UserEntity,
    @Args('sessionId') sessionId: string,
    @Args('parentTwigId') parentTwigId: string,
    @Args('twigId') twigId: string,
    @Args('postId') postId: string,
    @Args('x', {type: () => Int}) x: number,
    @Args('y', {type: () => Int}) y: number,
  ) {
    const result = await this.twigsService.pasteTwig(user, parentTwigId, twigId, postId, x, y);

    const user1 = await this.transfersService.linkTransfer(user, result.linkVote, result.linkArrow, result.source);
  
    this.pubSub.publish('pasteTwig', {
      sessionId,
      abstractId: result.abstract.id,
      pasteTwig: result,
    });

    return {
      ...result,
      user: user1,
    };
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => LinkTwigsResult, {name: 'linkTwigs'})
  async linkTwigs(
    @CurrentUser() user: UserEntity,
    @Args('sessionId') sessionId: string,
    @Args('abstractId') abstractId: string,
    @Args('sourceId') sourceId: string,
    @Args('targetId') targetId: string,
  ) {
    const result = await this.twigsService.linkTwigs(user, abstractId, sourceId, targetId);

    const user1 = await this.transfersService.linkTransfer(user, result.vote, result.arrow, result.source);
    
    this.pubSub.publish('linkTwigs', {
      sessionId,
      abstractId,
      linkTwigs: {
        ...result,
        user: user1,
      },
    });

    return {
      ...result,
      user: user1
    };
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => RemoveTwigResult, {name: 'removeTwig'})
  async removeTwig(
    @CurrentUser() user: UserEntity,
    @Args('sessionId') sessionId: string,
    @Args('twigId') twigId: string,
    @Args('shouldRemoveDescs') shouldRemoveDescs: boolean,
  ) {
    const result = await this.twigsService.removeTwig(user, twigId, shouldRemoveDescs);
    
    this.pubSub.publish('removeTwig', {
      sessionId,
      abstractId: result.abstract.id,
      removeTwig: result,
    });

    return result;
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => SelectTwigResult, {name: 'selectTwig'})
  async selectTwig(
    @CurrentUser() user: UserEntity,
    @Args('sessionId') sessionId: string,
    @Args('twigId') twigId: string,
  ) {
    const {
      abstract,
      twigs,
      role
    } = await this.twigsService.selectTwig(user, twigId);

    return { 
      abstract,
      twigs,  
      role
    }
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Twig, {name: 'dragTwig'})
  async dragTwig(
    @CurrentUser() user: UserEntity,
    @Args('sessionId') sessionId: string,
    @Args('abstractId') abstractId: string,
    @Args('twigId') twigId: string,
    @Args('dx', {type: () => Int}) dx: number,
    @Args('dy', {type: () => Int}) dy: number,
  ) {
    this.pubSub.publish('dragTwig', {
      sessionId,
      abstractId,
      dragTwig: {
        twigId,
        dx,
        dy,
      }
    });
    return {
      id: twigId,
    };
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => MoveTwigResult, {name: 'moveTwig'})
  async moveTwig(
    @CurrentUser() user: UserEntity,
    @Args('sessionId') sessionId: string,
    @Args('twigId') twigId: string,
    @Args('x', {type: () => Int}) x: number,
    @Args('y', {type: () => Int}) y: number,
  ) {
    const {
      twigs, 
      role,
    } = await this.twigsService.moveTwig(user, twigId, x, y);

    this.pubSub.publish('moveTwig', {
      sessionId,
      abstractId: twigs[0].abstractId,
      moveTwig: twigs,
    })

    return {
      twigs, 
      role,
    };
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => GraftTwigResult, {name: 'graftTwig'})
  async graftTwig(
    @CurrentUser() user: UserEntity,
    @Args('sessionId') sessionId: string,
    @Args('parentTwigId') parentTwigId: string,
    @Args('twigId') twigId: string,
    @Args('x', {type: () => Int}) x: number,
    @Args('y', {type: () => Int}) y: number,
  ) {
    const result = await this.twigsService.graftTwig(user, twigId, parentTwigId, x, y);

    this.pubSub.publish('graftTwig', {
      sessionId,
      abstractId: result.twig.abstractId,
      graftTwig: result,
    });

    return result;
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => CopyTwigResult, {name: 'copyTwig'})
  async copyTwig(
    @CurrentUser() user: UserEntity,
    @Args('parentTwigId') parentTwigId: string,
    @Args('twigId') twigId: string,
  ) {
    return this.twigsService.copyTwig(user, twigId, parentTwigId);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => OpenTwigResult, {name: 'openTwig'})
  async openTwig(
    @CurrentUser() user: UserEntity,
    @Args('sessionId') sessionId: string,
    @Args('twigId') twigId: string,
    @Args('shouldOpen') shouldOpen: boolean,
  ) {
    const { 
      twig,
      role
    } = await this.twigsService.openTwig(user, twigId, shouldOpen);

    this.pubSub.publish('openTwig', {
      sessionId,
      abstractId: twig.abstractId,
      openTwig: twig,
    });

    return {
      twig,
      role,
    };
  }

  
  @Subscription(() => ReplyTwigResult, {name: 'replyTwig',
    filter: (payload, variables) => {
      if (payload.sessionId === variables.sessionId) {
        return false;
      }
      return payload.abstractId === variables.abstractId;
    },
  })
  replyTwigSub(
    @Args('sessionId') sessionId: string,
    @Args('abstractId') abstractId: string,
  ) {
    console.log('replyTwigSub');
    return this.pubSub.asyncIterator('replyTwig')
  }

    
  @Subscription(() => ReplyTwigResult, {name: 'pasteTwig',
    filter: (payload, variables) => {
      if (payload.sessionId === variables.sessionId) {
        return false;
      }
      return payload.abstractId === variables.abstractId;
    },
  })
  pasteTwigSub(
    @Args('sessionId') sessionId: string,
    @Args('abstractId') abstractId: string,
  ) {
    console.log('pasteTwigSub');
    return this.pubSub.asyncIterator('pasteTwig')
  }


  @Subscription(() => LinkTwigsResult, {name: 'linkTwigs',
    filter: (payload, variables) => {
      if (payload.sessionId === variables.sessionId) {
        return false;
      }
      return payload.abstractId === variables.abstractId;
    },
  })
  linkTwigsSub(
    @Args('sessionId') sessionId: string,
    @Args('abstractId') abstractId: string,
  ) {
    console.log('linkTwigsSub');
    return this.pubSub.asyncIterator('linkTwigs')
  }

  @Subscription(() => SelectTwigResult, {name: 'selectTwig',
    filter: (payload, variables) => {
      if (payload.sessionId === variables.sessionId) {
        return false;
      }
      return payload.abstractId === variables.abstractId;
    },
  })
  selectTwigSub(
    @Args('sessionId') sessionId: string,
    @Args('abstractId') abstractId: string,
  ) {
    console.log('selectTwigSub');
    return this.pubSub.asyncIterator('selectTwig')
  }

  @Subscription(() => RemoveTwigResult, {name: 'removeTwig',
    filter: (payload, variables) => {
      if (payload.sessionId === variables.sessionId) {
        return false;
      }
      return payload.abstractId === variables.abstractId;
    },
  })
  removeTwigSub(
    @Args('sessionId') sessionId: string,
    @Args('abstractId') abstractId: string,
  ) {
    console.log('removeTwigSub');
    return this.pubSub.asyncIterator('removeTwig')
  }

  @Subscription(() => DragTwigResult, {name: 'dragTwig',
    filter: (payload, variables) => {
      if (payload.sessionId === variables.sessionId) {
        return false;
      }
      return payload.abstractId === variables.abstractId;
    },
  })
  dragTwigSub(
    @Args('sessionId') sessionId: string,
    @Args('abstractId') abstractId: string,
  ) {
    console.log('dragTwigSub');
    return this.pubSub.asyncIterator('dragTwig')
  }

  @Subscription(() => [Twig], {name: 'moveTwig',
    filter: (payload, variables) => {
      if (payload.sessionId === variables.sessionId) {
        return false;
      }
      return payload.abstractId === variables.abstractId;
    },
  })
  moveTwigSub(
    @Args('sessionId') sessionId: string,
    @Args('abstractId') abstractId: string,
  ) {
    console.log('moveTwigSub');
    return this.pubSub.asyncIterator('moveTwig')
  }

  @Subscription(() => GraftTwigResult, {name: 'graftTwig',
    filter: (payload, variables) => {
      if (payload.sessionId === variables.sessionId) {
        return false;
      }
      return payload.abstractId === variables.abstractId;
    },
  })
  graftTwigSub(
    @Args('sessionId') sessionId: string,
    @Args('abstractId') abstractId: string,
  ) {
    console.log('graftTwigSub');
    return this.pubSub.asyncIterator('graftTwig')
  }

  @Subscription(() => Twig, {name: 'openTwig',
    filter: (payload, variables) => {
      if (payload.sessionId === variables.sessionId) {
        return false;
      }
      return payload.abstractId === variables.abstractId;
    },
  })
  openTwigSub(
    @Args('sessionId') sessionId: string,
    @Args('abstractId') abstractId: string,
  ) {
    console.log('openTwigSub');
    return this.pubSub.asyncIterator('openTwig')
  }
}
