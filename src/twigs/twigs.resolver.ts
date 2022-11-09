import { BadRequestException, Inject } from '@nestjs/common';
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
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

@Resolver(() => Twig)
export class TwigsResolver {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
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

  @Mutation(() => [Twig], {name: 'getTwigs'})
  async getTwigs(
    @Args('accessToken') accessToken: string,
    @Args('abstractId') abstractId: string,
  ) {
    const payload = this.jwtService.verify(accessToken, {
      secret: this.configService.get('JWT_ACCESS_TOKEN_SECRET')
    });
    const user = await this.usersService.getUserById(payload.userId);
    if (!user) {
      throw new BadRequestException('Invalid accessToken');
    }
    return this.twigsService.getTwigsByAbstractId(abstractId);
  }

  @Mutation(() => ReplyTwigResult, {name: 'replyTwig'})
  async replyTwig(
    @Args('accessToken') accessToken: string,
    @Args('sessionId') sessionId: string,
    @Args('parentTwigId') parentTwigId: string,
    @Args('twigId') twigId: string,
    @Args('postId') postId: string,
    @Args('x', {type: () => Int}) x: number,
    @Args('y', {type: () => Int}) y: number,
    @Args('draft') draft: string,
  ) {
    const payload = this.jwtService.verify(accessToken, {
      secret: this.configService.get('JWT_ACCESS_TOKEN_SECRET')
    });
    const user = await this.usersService.getUserById(payload.userId);
    if (!user) {
      throw new BadRequestException('Invalid accessToken');
    }

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

  @Mutation(() => ReplyTwigResult, {name: 'pasteTwig'})
  async pasteTwig(
    @Args('accessToken') accessToken: string,
    @Args('sessionId') sessionId: string,
    @Args('parentTwigId') parentTwigId: string,
    @Args('twigId') twigId: string,
    @Args('postId') postId: string,
    @Args('x', {type: () => Int}) x: number,
    @Args('y', {type: () => Int}) y: number,
  ) {
    const payload = this.jwtService.verify(accessToken, {
      secret: this.configService.get('JWT_ACCESS_TOKEN_SECRET')
    });
    const user = await this.usersService.getUserById(payload.userId);
    if (!user) {
      throw new BadRequestException('Invalid accessToken');
    }

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

  @Mutation(() => LinkTwigsResult, {name: 'linkTwigs'})
  async linkTwigs(
    @Args('accessToken') accessToken: string,
    @Args('sessionId') sessionId: string,
    @Args('abstractId') abstractId: string,
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

  @Mutation(() => RemoveTwigResult, {name: 'removeTwig'})
  async removeTwig(
    @Args('accessToken') accessToken: string,
    @Args('sessionId') sessionId: string,
    @Args('twigId') twigId: string,
    @Args('shouldRemoveDescs') shouldRemoveDescs: boolean,
  ) {
    const payload = this.jwtService.verify(accessToken, {
      secret: this.configService.get('JWT_ACCESS_TOKEN_SECRET')
    });
    const user = await this.usersService.getUserById(payload.userId);
    if (!user) {
      throw new BadRequestException('Invalid accessToken');
    }

    const result = await this.twigsService.removeTwig(user, twigId, shouldRemoveDescs);
    
    this.pubSub.publish('removeTwig', {
      sessionId,
      abstractId: result.abstract.id,
      removeTwig: result,
    });

    return result;
  }

  @Mutation(() => SelectTwigResult, {name: 'selectTwig'})
  async selectTwig(
    @Args('accessToken') accessToken: string,
    @Args('sessionId') sessionId: string,
    @Args('twigId') twigId: string,
  ) {
    const payload = this.jwtService.verify(accessToken, {
      secret: this.configService.get('JWT_ACCESS_TOKEN_SECRET')
    });
    const user = await this.usersService.getUserById(payload.userId);
    if (!user) {
      throw new BadRequestException('Invalid accessToken');
    }

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
  @Mutation(() => Twig, {name: 'dragTwig'})
  async dragTwig(
    @Args('accessToken') accessToken: string,
    @Args('sessionId') sessionId: string,
    @Args('abstractId') abstractId: string,
    @Args('twigId') twigId: string,
    @Args('dx', {type: () => Int}) dx: number,
    @Args('dy', {type: () => Int}) dy: number,
  ) {
    const payload = this.jwtService.verify(accessToken, {
      secret: this.configService.get('JWT_ACCESS_TOKEN_SECRET')
    });
    const user = await this.usersService.getUserById(payload.userId);
    if (!user) {
      throw new BadRequestException('Invalid accessToken');
    }

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

  @Mutation(() => MoveTwigResult, {name: 'moveTwig'})
  async moveTwig(
    @Args('accessToken') accessToken: string,
    @Args('sessionId') sessionId: string,
    @Args('twigId') twigId: string,
    @Args('x', {type: () => Int}) x: number,
    @Args('y', {type: () => Int}) y: number,
  ) {
    const payload = this.jwtService.verify(accessToken, {
      secret: this.configService.get('JWT_ACCESS_TOKEN_SECRET')
    });
    const user = await this.usersService.getUserById(payload.userId);
    if (!user) {
      throw new BadRequestException('Invalid accessToken');
    }

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

  @Mutation(() => GraftTwigResult, {name: 'graftTwig'})
  async graftTwig(
    @Args('accessToken') accessToken: string,
    @Args('sessionId') sessionId: string,
    @Args('parentTwigId') parentTwigId: string,
    @Args('twigId') twigId: string,
    @Args('x', {type: () => Int}) x: number,
    @Args('y', {type: () => Int}) y: number,
  ) {
    const payload = this.jwtService.verify(accessToken, {
      secret: this.configService.get('JWT_ACCESS_TOKEN_SECRET')
    });
    const user = await this.usersService.getUserById(payload.userId);
    if (!user) {
      throw new BadRequestException('Invalid accessToken');
    }

    const result = await this.twigsService.graftTwig(user, twigId, parentTwigId, x, y);

    this.pubSub.publish('graftTwig', {
      sessionId,
      abstractId: result.twig.abstractId,
      graftTwig: result,
    });

    return result;
  }

  @Mutation(() => CopyTwigResult, {name: 'copyTwig'})
  async copyTwig(
    @Args('accessToken') accessToken: string,
    @Args('parentTwigId') parentTwigId: string,
    @Args('twigId') twigId: string,
  ) {
    const payload = this.jwtService.verify(accessToken, {
      secret: this.configService.get('JWT_ACCESS_TOKEN_SECRET')
    });
    const user = await this.usersService.getUserById(payload.userId);
    if (!user) {
      throw new BadRequestException('Invalid accessToken');
    }
    return this.twigsService.copyTwig(user, twigId, parentTwigId);
  }

  @Mutation(() => OpenTwigResult, {name: 'openTwig'})
  async openTwig(
    @Args('accessToken') accessToken: string,
    @Args('sessionId') sessionId: string,
    @Args('twigId') twigId: string,
    @Args('shouldOpen') shouldOpen: boolean,
  ) {
    const payload = this.jwtService.verify(accessToken, {
      secret: this.configService.get('JWT_ACCESS_TOKEN_SECRET')
    });
    const user = await this.usersService.getUserById(payload.userId);
    if (!user) {
      throw new BadRequestException('Invalid accessToken');
    }

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
