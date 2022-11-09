import { Args, Int, Mutation, Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { Arrow } from 'src/arrows/arrow.model';
import { ArrowsService } from 'src/arrows/arrows.service';
import { Tab } from './tab.model';
import { TabsService } from './tabs.service';
import { BadRequestException } from '@nestjs/common';
import { RemoveTabResult } from './dto/remove-tab-result.dto';
import { SheafsService } from 'src/sheafs/sheafs.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from 'src/users/users.service';

@Resolver(Tab)
export class TabsResolver {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
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

  @Mutation(() => [Tab], {name: 'createGraphTab'})
  async createGraphTab(
    @Args('accessToken') accessToken: string,
    @Args('name') name: string,
    @Args('routeName') routeName: string,
    @Args('arrowId', {nullable: true}) arrowId: string,
  ) {
    const payload = this.jwtService.verify(accessToken, {
      secret: this.configService.get('JWT_ACCESS_TOKEN_SECRET')
    });
    const user = await this.usersService.getUserById(payload.userId);
    if (!user) {
      throw new BadRequestException('Invalid accessToken');
    }

    if (arrowId) {
      let arrow = await this.arrowsService.getArrowById(arrowId);
      if (!arrow) {
        throw new BadRequestException('Arrow not found');
      }
      ({arrow} = await this.arrowsService.openArrow(user, arrow, name, routeName));
      return this.tabsService.appendTab(user, arrow, false, true);
    }
    else {
      let arrow = await this.arrowsService.getArrowByRouteName(routeName);
      if (!arrow) {
        const sheaf = await this.sheafsService.createSheaf(null, null, null);
        ({ arrow } = await this.arrowsService.createArrow({
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
      }
      return this.tabsService.appendTab(user, arrow, false, true);
    }

  }

  @Mutation(() => [Tab], { name: 'createTab' })
  async createTab(
    @Args('accessToken') accessToken: string,
    @Args('arrowId') arrowId: string,
    @Args('i', {type: () => Int, nullable: true}) i: number,
    @Args('isFrame') isFrame: boolean,
    @Args('isFocus') isFocus: boolean,
  ) {
    const payload = this.jwtService.verify(accessToken, {
      secret: this.configService.get('JWT_ACCESS_TOKEN_SECRET')
    });
    const user = await this.usersService.getUserById(payload.userId);
    if (!user) {
      throw new BadRequestException('Invalid accessToken');
    }

    const arrow = await this.arrowsService.getArrowById(arrowId);
    if (!arrow) {
      throw new BadRequestException('Arrow not found');
    }
    if (i) {
      return this.tabsService.createTab(user, arrow, i, isFrame, isFocus);
    }
    return this.tabsService.appendTab(user, arrow, isFrame, isFocus);
  }

  @Mutation(() => [Tab], { name: 'createTabByRouteName' })
  async createTabByRouteName(
    @Args('accessToken') accessToken: string,
    @Args('routeName') routeName: string,
    @Args('i', {type: () => Int, nullable: true}) i: number,
    @Args('isFrame') isFrame: boolean,
    @Args('isFocus') isFocus: boolean,
  ) {
    const payload = this.jwtService.verify(accessToken, {
      secret: this.configService.get('JWT_ACCESS_TOKEN_SECRET')
    });
    const user = await this.usersService.getUserById(payload.userId);
    if (!user) {
      throw new BadRequestException('Invalid accessToken');
    }

    const arrow = await this.arrowsService.getArrowByRouteName(routeName);
    if (!arrow) {
      throw new BadRequestException('Arrow not found');
    }
    if (i) {
      return this.tabsService.createTab(user, arrow, i, isFrame, isFocus);
    }
    return this.tabsService.appendTab(user, arrow, isFrame, isFocus);
  }

  @Mutation(() => [Tab], { name: 'updateTab' })
  async updateTab(
    @Args('accessToken') accessToken: string,
    @Args('tabId') tabId: string,
    @Args('i', {type: () => Int}) i: number,
    @Args('isFrame') isFrame: boolean,
    @Args('isFocus') isFocus: boolean,
  ) {
    const payload = this.jwtService.verify(accessToken, {
      secret: this.configService.get('JWT_ACCESS_TOKEN_SECRET')
    });
    const user = await this.usersService.getUserById(payload.userId);
    if (!user) {
      throw new BadRequestException('Invalid accessToken');
    }
    return this.tabsService.updateTab(user, tabId, i, isFrame, isFocus);
  }

  @Mutation(() => RemoveTabResult, { name: 'removeTab' })
  async removeTab(
    @Args('accessToken') accessToken: string,
    @Args('tabId') tabId: string,
  ) {
    const payload = this.jwtService.verify(accessToken, {
      secret: this.configService.get('JWT_ACCESS_TOKEN_SECRET')
    });
    const user = await this.usersService.getUserById(payload.userId);
    if (!user) {
      throw new BadRequestException('Invalid accessToken');
    }
    return this.tabsService.removeTab(user, tabId);
  }
}
