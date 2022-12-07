import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Arrow } from 'src/arrows/arrow.entity';
import { User } from 'src/users/user.entity';
import { Between, Equal, Not, Repository } from 'typeorm';
import { Tab } from './tab.entity';

@Injectable()
export class TabsService {
  constructor(
    @InjectRepository(Tab)
    private readonly tabRepository: Repository<Tab>,
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

    let sibs = await this.tabRepository.find({
      where: {
        id: Not(Equal(tab.id)),
        userId: user.id,
      },
      order: {
        i: 'ASC',
      }
    });

    sibs = sibs.sort((a, b) => a.i - b.i).map((sib, i) => {
      return {
        ...sib,
        i,
      };
    });

    if (tab.isFocus && sibs.length > 0) {
      tab.isFocus = false;
      sibs[sibs.length - 1].isFocus = true;
    }

    tab = await this.tabRepository.save(tab);
    sibs = await this.tabRepository.save(sibs);

    return {
      tab, 
      sibs,
    }
  }


  async updateTab(user: User, tabId: string | null, isFrame: boolean, isFocus: boolean): Promise<Tab[]> {
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


    let tabs = []
    if (isFrame && !tab.isFrame) {
      tabs = await this.tabRepository.find({
        where: {
          id: Not(Equal(tab.id)),
          userId: user.id,
          isFrame: true,
        }
      });
      tabs = tabs.map(t => {
        t.isFrame = false;
        return t;
      });
    }
    else if (isFocus && !tab.isFocus) {
      tabs = await this.tabRepository.find({
        where: {
          id: Not(Equal(tab.id)),
          userId: user.id,
          isFocus: true,
        }
      });
      tabs = tabs.map(t => {
        t.isFocus = false;
        return t;
      });
    }

    tab.isFrame = isFrame;
    tab.isFocus = isFocus;

    tabs.push(tab)
    
    return this.tabRepository.save(tabs);
  }

  async moveTab(user: User, tabId: string, i: number): Promise<Tab[]> {
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

    if (tab.i === i) return[];


    let sibs = [];

    if (i < tab.i) {
      sibs = await this.tabRepository.find({
        where: {
          userId: user.id,
          i: Between(i, tab.i - 1),
        }
      });

      sibs = sibs.map(s => {
        return {
          ...s,
          i: s.i + 1,
        };
      });
    }
    else {
      sibs = await this.tabRepository.find({
        where: {
          userId: user.id,
          i: Between(tab.i + 1, i),
        }
      });

      sibs = sibs.map(s => {
        return {
          ...s,
          i: s.i - 1,
        };
      });
    }
    
    tab.i = i;
    console.log('sibs', i, sibs);

    return this.tabRepository.save([tab, ...sibs]);
  }

}
