import { Inject, UseGuards } from '@nestjs/common';
import { Args, Int, Mutation, Parent, ResolveField, Resolver, Subscription } from '@nestjs/graphql';
import { CurrentUser, GqlAuthGuard } from 'src/auth/gql-auth.guard';
import { Arrow } from 'src/arrows/arrow.model';
import { ArrowsService } from 'src/arrows/arrows.service';
import { PUB_SUB } from 'src/pub-sub/pub-sub.module';
import { UsersService } from 'src/users/users.service';
import { Twig } from './twig.model';
import { TwigsService } from './twigs.service';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import { User } from 'src/users/user.model';
import { User as UserEntity } from 'src/users/user.entity';
import { SheafsService } from 'src/sheafs/sheafs.service';
import { ReplyTwigResult } from './dto/reply-twig-result.dto';
import { LinkTwigsResult } from './dto/link-twigs-result.dto';
import { AddTwigResult } from './dto/add-twig-result.dto';
import { SelectTwigResult } from './dto/select-twig-result.dto';
import { MoveTwigResult } from './dto/move-twig-result.dto';
import { OpenTwigResult } from './dto/open-twig-result.dto';
import { SyncTabStateResult } from './dto/sync-tab-state-result.dto';
import { WindowEntry } from './dto/window-entry.dto';
import { GroupEntry } from './dto/group-entry.dto';
import { TabEntry } from './dto/tab-entry.dto';
import { TabResult } from './dto/tab-result.dto';
import { UpdateTabResult } from './dto/udpate-tab-result.dto';
import { MoveTabResult } from './dto/move-tab-result.dto';
import { RemoveTwigResult } from './dto/remove-twig-result.dto';
import { RemoveTabResult1 } from './dto/remove-tab-result.dto';
import { BookmarkEntry } from './dto/bookmark-entry.dto';
import { DragTwigResult } from './dto/drag-twig-result.dto';
import { SyncBookmarksResult } from './dto/sync-bookmarks-result.dto';
import { RemoveBookmarkResult } from './dto/remove-bookmark-result.dto';
import { CreateTabResult } from './dto/create-tab-result.dto';
import { GraftTwigResult } from './dto/graft-twig-result.dto';
import { CopyTwigResult } from './dto/copy-twig-result.dto';

@Resolver(() => Twig)
export class TwigsResolver {
  constructor(
    private readonly twigsService: TwigsService,
    private readonly usersService: UsersService,
    private readonly arrowsService: ArrowsService,
    private readonly sheafsService: SheafsService,
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
    @CurrentUser() user: UserEntity,
    @Parent() twig: Twig,
  ) {
    if (!twig.detailId) return null;
    return this.arrowsService.getArrowByIdWithPrivacy(user, twig.detailId);
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
  
    this.pubSub.publish('replyTwig', {
      sessionId,
      abstractId: result.abstract.id,
      replyTwig: result,
    });

    return result;
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
    return this.twigsService.linkTwigs(user, abstractId, sourceId, targetId);
  }
  @UseGuards(GqlAuthGuard)
  @Mutation(() => AddTwigResult, {name: 'addTwig'})
  async addTwig(
    @CurrentUser() user: UserEntity,
    @Args('sessionId') sessionId: string,
    @Args('parentTwigId') parentTwigId: string,
    @Args('arrowId') arrowId: string,
  ) {
    throw new Error('Not yet implemented')
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => RemoveTwigResult, {name: 'removeTwig'})
  async removeTwig(
    @CurrentUser() user: UserEntity,
    @Args('sessionId') sessionId: string,
    @Args('twigId') twigId: string,
    @Args('shouldRemoveDescs') shouldRemoveDescs: boolean,
  ) {
    return this.twigsService.removeTwig(user, twigId, shouldRemoveDescs);
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
  ) {
    return this.twigsService.graftTwig(user, twigId, parentTwigId);
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

    return {
      twig,
      role,
    };
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => SyncTabStateResult, {name: 'syncTabState'})
  async syncTabState(
    @CurrentUser() user: UserEntity,
    @Args('twigId') twigId: string,
    @Args('windows', {type: () => [WindowEntry]}) windows: WindowEntry[],
    @Args('groups', {type: () => [GroupEntry]}) groups: GroupEntry[],
    @Args('tabs', {type: () => [TabEntry]}) tabs: TabEntry[],
  ) {
    return this.twigsService.syncTabState(user, twigId, windows, groups, tabs);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => TabResult, {name: 'createWindow'})
  async createWindow(
    @CurrentUser() user: UserEntity,
    @Args('windowEntry', {type: () => WindowEntry}) windowEntry: WindowEntry,
  ) {
    return this.twigsService.createWindow(user, windowEntry);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => TabResult, {name: 'createGroup'})
  async createGroup(
    @CurrentUser() user: UserEntity,
    @Args('groupEntry', {type: () => GroupEntry}) groupEntry: GroupEntry,
  ) {
    return this.twigsService.createGroup(user, groupEntry);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => CreateTabResult, {name: 'createTab'})
  async createTab(
    @CurrentUser() user: UserEntity,
    @Args('tabEntry', {type: () => TabEntry}) tabEntry: TabEntry,
  ) {
    return this.twigsService.createTab(user, tabEntry);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => [Twig], {name: 'copyToTab'})
  async copyToTab(
    @CurrentUser() user: UserEntity,
    @Args('entries', {type: () => [TabEntry]}) entries: TabEntry[],
    @Args('groupEntry', {type: () => GroupEntry, nullable: true}) groupEntry: GroupEntry,
  ) {
    return this.twigsService.copyToTab(user, entries, groupEntry);
  }
  
  @UseGuards(GqlAuthGuard)
  @Mutation(() => UpdateTabResult, {name: 'updateTab'})
  async updateTab(
    @CurrentUser() user: UserEntity,
    @Args('twigId') twigId: string,
    @Args('title') title: string,
    @Args('url') url: string,
    @Args('faviconUrl', {nullable: true}) faviconUrl: string,
  ) {
    return this.twigsService.updateTab(user, twigId, title, url, faviconUrl);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => MoveTabResult, {name: 'moveTab'})
  async moveTab(
    @CurrentUser() user: UserEntity,
    @Args('twigId') twigId: string,
    @Args('groupTwigId') groupTwigId: string,
    @Args('parentTwigId', {nullable: true}) parentTwigId: string,
  ) {
    console.log('moveTwig', twigId, groupTwigId, parentTwigId);
    return this.twigsService.moveTab(user, twigId, groupTwigId, parentTwigId);
  }


  @UseGuards(GqlAuthGuard)
  @Mutation(() => RemoveTabResult1, {name: 'removeTab'})
  async removeTab(
    @CurrentUser() user: UserEntity,
    @Args('twigId') twigId: string,
  ) {
    return this.twigsService.removeTab(user, twigId);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => TabResult, {name: 'removeGroup'})
  async removeGroup(
    @CurrentUser() user: UserEntity,
    @Args('twigId') twigId: string,
  ) {
    return this.twigsService.removeGroup(user, twigId);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => TabResult, {name: 'removeWindow'})
  async removeWindow(
    @CurrentUser() user: UserEntity,
    @Args('twigId') twigId: string,
  ) {
    return this.twigsService.removeWindow(user, twigId);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => SyncBookmarksResult, {name: 'syncBookmarks'})
  async syncBookmarks(
    @CurrentUser() user: UserEntity,
    @Args('twigId') twigId: string,
    @Args('bookmarks', {type: () => [BookmarkEntry]}) bookmarks: BookmarkEntry[],
  ) {
    return this.twigsService.syncBookmarks(user, twigId, bookmarks);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => TabResult, {name: 'createBookmark'})
  async createBookmark(
    @CurrentUser() user: UserEntity,
    @Args('bookmark', {type: () => BookmarkEntry, nullable: true}) bookmark: BookmarkEntry,
  ) {
    return this.twigsService.createBookmark(user, bookmark);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Twig, {name: 'changeBookmark'})
  async changeBookmark(
    @CurrentUser() user: UserEntity,
    @Args('bookmarkId') bookmarkId: string,
    @Args('title') title: string,
    @Args('url', {nullable: true}) url: string,
  ) {
    return this.twigsService.changeBookmark(user, bookmarkId, title, url);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => MoveTabResult, {name: 'moveBookmark'})
  async moveBookmark(
    @CurrentUser() user: UserEntity,
    @Args('bookmarkId') bookmarkId: string,
    @Args('parentBookmarkId') parentBookmarkId: string,
  ) {
    return this.twigsService.moveBookmark(user, bookmarkId, parentBookmarkId);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => [Twig], {name: 'copyToBookmark'})
  async copyToBookmark(
    @CurrentUser() user: UserEntity,
    @Args('entries', {type: () => [BookmarkEntry]}) entries: BookmarkEntry[],
  ) {
    return this.twigsService.copyToBookmark(user, entries);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => RemoveBookmarkResult, {name: 'removeBookmark'})
  async removeBookmark(
    @CurrentUser() user: UserEntity,
    @Args('bookmarkId') bookmarkId: string,
  ) {
    return this.twigsService.removeBookmark(user, bookmarkId);
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

  @Subscription(() => AddTwigResult, {name: 'addTwig',
    filter: (payload, variables) => {
      if (payload.sessionId === variables.sessionId) {
        return false;
      }
      return payload.abstractId === variables.abstractId;
    },
  })
  addTwigSub(
    @Args('sessionId') sessionId: string,
    @Args('abstractId') abstractId: string,
  ) {
    console.log('addTwigSub');
    return this.pubSub.asyncIterator('addTwig')
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

  @Subscription(() => Twig, {name: 'moveTwig',
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

  @Subscription(() => Twig, {name: 'graftTwig',
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
}
