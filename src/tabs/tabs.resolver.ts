import { Args, Int, Mutation, Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { Arrow } from 'src/arrows/arrow.model';
import { ArrowsService } from 'src/arrows/arrows.service';
import { Tab } from './tab.model';
import { TabsService } from './tabs.service';
import { BadRequestException, UseGuards } from '@nestjs/common';
import { RemoveTabResult } from './dto/remove-tab-result.dto';
import { SheafsService } from 'src/sheafs/sheafs.service';
import { CurrentUser, GqlAuthGuard } from 'src/auth/gql-auth.guard';
import { User as UserEntity } from 'src/users/user.entity';
import { TransfersService } from 'src/transfers/transfers.service';
import { CreateGraphTabResult } from './dto/create-graph-tab-result.dto';
import { UsersService } from 'src/users/users.service';

@Resolver(Tab)
export class TabsResolver {
  constructor(
    private readonly tabsService: TabsService,
    private readonly usersService: UsersService,
    private readonly arrowsService: ArrowsService,
    private readonly sheafsService: SheafsService,
    private readonly transfersService: TransfersService,
  ) {}

  @ResolveField(() => Arrow, { name: 'arrow' })
  async getTabArrow(
    @Parent() tab: Tab
  ) {
    return this.arrowsService.getArrowById(tab.arrowId);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => CreateGraphTabResult, {name: 'createGraphTab'})
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

      const tabs = await this.tabsService.appendTab(user, arrow, false, true);

      if (!user.openArrowDate) {
        user = await this.usersService.setOpenArrowDate(user);
      }
      return {
        user, 
        tabs,
      }
    }
    else {
      let arrow = await this.arrowsService.getArrowByRouteName(routeName);
      if (arrow) {
        const tabs = await this.tabsService.appendTab(user, arrow, false, true);
        return {
          user,
          tabs,
        }
      }

      const sheaf = await this.sheafsService.createSheaf(null, null, null);
      let vote;
      ({ arrow, vote } = await this.arrowsService.createArrow({
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
      }));
      ({ arrow } = await this.arrowsService.openArrow(user, arrow, name, routeName));
      
      let user1 = await this.transfersService.createGraphTransfer(user, vote, arrow);
      
      const tabs = await this.tabsService.appendTab(user1, arrow, false, true);

      if (!user1.createGraphDate) {
        user1 = await this.usersService.setCreateGraphDate(user1);
      }

      return {
        user: user1,
        tabs,
      }
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
  @Mutation(() => [Tab], { name: 'createTabByRouteName' })
  async createTabByRouteName(
    @CurrentUser() user: UserEntity,
    @Args('routeName') routeName: string,
    @Args('i', {type: () => Int, nullable: true}) i: number,
    @Args('isFrame') isFrame: boolean,
    @Args('isFocus') isFocus: boolean,
  ) {
    const arrow = await this.arrowsService.getArrowByRouteName(routeName);
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
    @Args('isFrame') isFrame: boolean,
    @Args('isFocus') isFocus: boolean,
  ) {
    return this.tabsService.updateTab(user, tabId, isFrame, isFocus);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => [Tab], { name: 'moveTab' })
  async moveTab(
    @CurrentUser() user: UserEntity,
    @Args('tabId') tabId: string,
    @Args('i', {type: () => Int}) i: number,
  ) {
    return this.tabsService.moveTab(user, tabId, i);
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
