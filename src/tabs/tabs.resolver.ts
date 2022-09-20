import { Args, Int, Mutation, Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { Arrow } from 'src/arrows/arrow.model';
import { ArrowsService } from 'src/arrows/arrows.service';
import { CurrentUser, GqlAuthGuard } from 'src/auth/gql-auth.guard';
import { Tab } from './tab.model';
import { TabsService } from './tabs.service';
import { User as UserEntity } from '../users/user.entity';
import { BadRequestException, UseGuards } from '@nestjs/common';
import { RemoveTabResult } from './dto/remove-tab-result.dto';
import { SheafsService } from 'src/sheafs/sheafs.service';

@Resolver(Tab)
export class TabsResolver {
  constructor(
    private readonly tabsService: TabsService,
    private readonly arrowsService: ArrowsService,
    private readonly sheafsService: SheafsService,
  ) {}

  @ResolveField(() => Arrow, { name: 'arrow' })
  async getTabArrow(
    @Parent() tab: Tab
  ) {
    return this.arrowsService.getArrowById(tab.arrowId);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => [Tab], {name: 'createGraphTab'})
  async createGraphTab(
    @CurrentUser() user: UserEntity,
    @Args('name') name: string,
    @Args('routeName') routeName: string,
    @Args('arrowId', {nullable: true}) arrowId: string,
  ) {
    if (arrowId) {
      let arrow = await this.arrowsService.getArrowById(arrowId);
      if (!arrow) {
        throw new BadRequestException('Arrow not found');
      }
      ({arrow} = await this.arrowsService.openArrow(user, arrow, name, routeName));
      return this.tabsService.appendTab(user, arrow, false, true);
    }
    else {
      const sheaf = await this.sheafsService.createSheaf(null, null, null);
      let { arrow } = await this.arrowsService.createArrow({
        user,
        title: name,
        routeName,
        id: null,
        sourceId: null,
        targetId: null,
        sheaf,
        abstract: null,
        draft: null,
        url: null,
        faviconUrl: null,
      });
      ({ arrow } = await this.arrowsService.openArrow(user, arrow, name, routeName));
      return this.tabsService.appendTab(user, arrow, false, true);
    }

  }
  @UseGuards(GqlAuthGuard)
  @Mutation(() => [Tab], { name: 'createTab' })
  async createTab(
    @CurrentUser() user: UserEntity,
    @Args('arrowId') arrowId: string,
    @Args('i', {type: () => Int, nullable: true}) i: number,
    @Args('isFrame') isFrame: boolean,
    @Args('isFocus') isFocus: boolean,
  ) {
    const arrow = await this.arrowsService.getArrowById(arrowId);
    if (!arrow) {
      throw new BadRequestException('Arrow not found');
    }
    if (i) {
      return this.tabsService.createTab(user, arrow, i, isFrame, isFocus);
    }
    return this.tabsService.appendTab(user, arrow, isFrame, isFocus);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => [Tab], { name: 'createTabByRoutename' })
  async createTabByRoutename(
    @CurrentUser() user: UserEntity,
    @Args('routename') routename: string,
    @Args('i', {type: () => Int, nullable: true}) i: number,
    @Args('isFrame') isFrame: boolean,
    @Args('isFocus') isFocus: boolean,
  ) {
    const arrow = await this.arrowsService.getArrowByRouteName(routename);
    if (!arrow) {
      throw new BadRequestException('Arrow not found');
    }
    if (i) {
      return this.tabsService.createTab(user, arrow, i, isFrame, isFocus);
    }
    return this.tabsService.appendTab(user, arrow, isFrame, isFocus);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => [Tab], { name: 'updateTab' })
  async updateTab(
    @CurrentUser() user: UserEntity,
    @Args('tabId') tabId: string,
    @Args('i', {type: () => Int}) i: number,
    @Args('isFrame') isFrame: boolean,
    @Args('isFocus') isFocus: boolean,
  ) {
    return this.tabsService.updateTab(user, tabId, i, isFrame, isFocus);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => RemoveTabResult, { name: 'removeTab' })
  async removeTab(
    @CurrentUser() user: UserEntity,
    @Args('tabId') tabId: string,
  ) {
    return this.tabsService.removeTab(user, tabId);
  }
}
