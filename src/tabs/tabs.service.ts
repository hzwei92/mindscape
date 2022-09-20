import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Arrow } from 'src/arrows/arrow.entity';
import { ArrowsService } from 'src/arrows/arrows.service';
import { User } from 'src/users/user.entity';
import { In, MoreThan, Not, Repository } from 'typeorm';
import { Tab } from './tab.entity';

@Injectable()
export class TabsService {
  constructor(
    @InjectRepository(Tab)
    private readonly tabRepository: Repository<Tab>,
    private readonly arrowsService: ArrowsService,
  ) {}

  async getTabsByUserId(userId: string): Promise<Tab[]> {
    return await this.tabRepository.find({
      where: { userId },
    });
  }
  
  async appendTab(user:User, arrow: Arrow, isFrame: boolean, isFocus: boolean) {
    const tabs = await this.getTabsByUserId(user.id);
    const i = tabs.length;
    return await this.createTab(user, arrow, i, isFrame, isFocus);
  }

  async createTab(user: User, arrow: Arrow, i: number, isFrame: boolean, isFocus: boolean): Promise<Tab[]> {
    const tab = new Tab();
    tab.userId = user.id;
    tab.arrowId = arrow.id;
    tab.arrow = arrow;
    tab.i = i;
    tab.isFrame = isFrame;
    tab.isFocus = isFocus;
    let tabs = [];
    if (isFrame) {
      tabs = await this.tabRepository.find({
        where: {
          userId: user.id,
          isFrame: true,
        }
      });
      tabs = tabs.map(t => {
        t.isFrame = false;
        return t;
      });
    }
    else if (isFocus) {
      tabs = await this.tabRepository.find({
        where: {
          userId: user.id,
          isFocus: true,
        }
      });
      tabs = tabs.map(t => {
        t.isFocus = false;
        return t;
      });
    }
    return await this.tabRepository.save([tab, ...tabs]);
  }

  async removeTab(user: User, tabId: string) {
    let tab = await this.tabRepository.findOne({
      where: {
        id: tabId
      }
    });
    if (!tab) {
      throw new BadRequestException('Tab not found');
    }
    if (tab.userId !== user.id) {
      throw new BadRequestException('Insufficient permissions');
    }
    tab.deleteDate = new Date();
    tab = await this.tabRepository.save(tab);

    let sibs = await this.tabRepository.find({
      where: {
        userId: user.id,
        i: MoreThan(tab.i),
      }
    });
    sibs = sibs.map(sib => {
      sib.i--;
      return sib;
    });
    sibs = await this.tabRepository.save(sibs);

    return {
      tab, 
      sibs,
    }
  }


  async updateTab(user: User, tabId: string | null, i: number, isFrame: boolean, isFocus: boolean): Promise<Tab[]> {
    const tab = await this.tabRepository.findOne({
      where: {
        id: tabId,
      },
    });

    if (!tab) {
      throw new BadRequestException('Tab not found');
    }
    if (tab.userId !== user.id) {
      throw new BadRequestException('Insufficient permissions');
    }

    tab.i = i;
    tab.isFrame = isFrame;
    tab.isFocus = isFocus;

    let tabs = []
    if (tab.isFrame) {
      tabs = await this.tabRepository.find({
        where: {
          id: Not(In([tab.id])),
          userId: user.id,
          isFrame: true,
        }
      });
      tabs = tabs.map(t => {
        t.isFrame = false;
        return t;
      });
    }
    else if (tab.isFocus) {
      tabs = await this.tabRepository.find({
        where: {
          id: Not(In([tab.id])),
          userId: user.id,
          isFocus: true,
        }
      });
      tabs = tabs.map(t => {
        t.isFocus = false;
        return t;
      });
    }

    tabs.push(tab)

    return this.tabRepository.save(tabs);
  }
}
