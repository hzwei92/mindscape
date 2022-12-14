import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { NumberDictionary } from 'unique-names-generator';
import { SearchService } from 'src/search/search.service';
import { ArrowsService } from 'src/arrows/arrows.service';
import { SheafsService } from 'src/sheafs/sheafs.service';
import { TabsService } from 'src/tabs/tabs.service';
import { PaletteMode } from 'src/enums';
import { START_ARROW_1_ID, START_ARROW_2_ID } from 'src/constants';

const numbers = NumberDictionary.generate({ min: 100, max: 999 });

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly sheafsService: SheafsService,
    private readonly arrowsService: ArrowsService,
    private readonly searchService: SearchService,
    private readonly tabsService: TabsService,
  ) {}

  async indexUsers() {
    const users = await this.usersRepository.find();
    this.searchService.saveUsers(users);
    return users;
  }

  async getReserveUser(): Promise<User> {
    return this.usersRepository.findOne({
      where: {
        isReserve: true,
      },
    });
  }

  async getUserById(id: string): Promise<User> {
    return this.usersRepository.findOne({
      where: {
        id,
      }
    });
  }

  async getUserByEmail(email: string): Promise<User> {
    return this.usersRepository.findOne({
      where: {
        email: email.trim().toLowerCase(),
      },
    });
  }

  async getUserByName(name: string): Promise<User> {
    const lowercaseName = name.trim().toLowerCase();
    return this.usersRepository.findOne({
      where: {
        lowercaseName,
      },
    });
  }

  async getUserIfRefreshTokenMatches(userId: string, refreshToken: string): Promise<User> {
    const user = await this.getUserById(userId);
    if (!user || !user.hashedRefreshToken || !refreshToken) return null;
    const isMatching = await bcrypt.compare(refreshToken, user.hashedRefreshToken);
    if (!isMatching) return null;
    return user;
  }

  async initUser(name: string, color: string, palette: string): Promise<User> {
    const user0 = new User();
    user0.name = name;
    user0.lowercaseName = name.toLowerCase();
    user0.routeName = encodeURIComponent(user0.lowercaseName);
    user0.color = color;
    user0.palette = palette === 'dark'
      ? PaletteMode.DARK
      : PaletteMode.LIGHT;
    const user1 = await this.usersRepository.save(user0);

    const startArrow1 = await this.arrowsService.getArrowById(START_ARROW_1_ID);
    const startArrow2 = await this.arrowsService.getArrowById(START_ARROW_2_ID);

    let startArrow = await this.arrowsService.getStartArrow();
    if (!startArrow) {
      startArrow = await this.arrowsService.createStartArrow(user1);
    }
    const tab = await this.tabsService.appendTab(user1, startArrow, false, !startArrow1 && !startArrow2);
    
    if (startArrow1) {
      const tab1 = await this.tabsService.appendTab(user1, startArrow1, false, !startArrow2);
    }

    if (startArrow2) {
      const tab2 = await this.tabsService.appendTab(user1, startArrow2, false, true);
    }
    


    let reserveUser = await this.getReserveUser();
    if (!reserveUser) {
      user1.isReserve = true;
      await this.usersRepository.save(user1);
    }


    const user2 = await this.getUserById(user1.id);

    this.searchService.saveUsers([user2]);
    return user2;
  }

  async registerUser(userId: string, email: string, pass: string | null, isGoogle: boolean): Promise<User> {
    const user = await this.getUserById(userId);
    if (!user) {
      throw new BadRequestException('This user does not exist');
    }
    const emailUser = await this.getUserByEmail(email);
    if (emailUser) {
      console.log(emailUser);
      throw new BadRequestException('This email is already in use');
    }
    const user0 = new User();
    user0.id = userId;
    user0.email = email.trim().toLowerCase();

    if (pass) {
      user0.hashedPassword = await bcrypt.hash(pass, 10);
    }
    else if (isGoogle) {
      user0.isRegisteredWithGoogle = true;
      user0.verifyEmailDate = new Date();
    }
    else {
      throw new BadRequestException('Password or Google auth required');
    }

    await this.usersRepository.save(user0);
    return this.getUserById(userId)
  }

  async verifyUser(userId: string): Promise<User> {
    const user0 = new User();
    user0.id = userId;
    user0.verifyEmailDate = new Date();
    user0.hashedEmailVerificationCode = null;
    return this.usersRepository.save(user0);
  }

  async setEmailVerificationCode(userId: string, code: string): Promise<User> {
    const hashedEmailVerificationCode = await bcrypt.hash(code, 10);
    const user0 = new User();
    user0.id = userId;
    user0.hashedEmailVerificationCode = hashedEmailVerificationCode;
    return this.usersRepository.save(user0);
  }

  async setRefreshToken(userId: string, refreshToken: string): Promise<User> {
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    const user0 = new User();
    user0.id = userId;
    user0.hashedRefreshToken = hashedRefreshToken;
    return this.usersRepository.save(user0);
  }

  async removeRefreshToken(userId: string): Promise<User> {
    const user0 = new User();
    user0.id = userId;
    user0.hashedRefreshToken = null;
    return this.usersRepository.save(user0);
  }

  async setUserMap(user: User, lng: number, lat: number, zoom: number) {
    const user0 = new User();
    user0.id = user.id;
    user0.mapLng = lng;
    user0.mapLat = lat;
    user0.mapZoom = zoom;
    return this.usersRepository.save(user0);
  }

  async setUserColor(user: User, color: string) {
    const user0 = new User();
    user0.id = user.id;
    user0.color = color;
    await this.usersRepository.save(user0);

    const user1 = await this.getUserById(user.id);
    
    this.searchService.partialUpdateUsers([user1]);

    return user1;
  }

  async setUserPalette(user: User, palette: string) {
    user.palette = palette === 'dark'
      ? PaletteMode.DARK
      : PaletteMode.LIGHT;

    user.togglePaletteDate = user.togglePaletteDate ?? new Date();
    const user1 = await this.usersRepository.save(user);

    this.searchService.partialUpdateUsers([user1]);

    return user1;
  }

  async setUserName(user: User, name: string) {
    const nameUser = await this.getUserByName(name);
    if (nameUser && nameUser.id !== user.id) {
      throw new BadRequestException('This name is already in use')
    }
    const user0 = new User();
    user0.id = user.id;
    user0.name = name.trim();
    user0.lowercaseName = user0.name.toLowerCase();
    user0.routeName = encodeURIComponent(user0.lowercaseName);
    await this.usersRepository.save(user0);

    const user1 = await this.getUserById(user.id);

    this.searchService.partialUpdateUsers([user1]);

    return user1;
  }


  async setUserActiveDate(user: User, date: Date) {
    const user0 = new User();
    user0.id = user.id;
    user0.activeDate = date;
    await this.usersRepository.save(user0);
    return this.getUserById(user.id);
  }

  async setCheckAlertsDate(user: User) {
    user.checkAlertsDate = new Date();
    return this.usersRepository.save(user);
  }

  async setLoadFeedDate(user: User) {
    user.loadFeedDate = new Date();
    return this.usersRepository.save(user);
  }

  async setLoadInsDate(user: User) {
    user.loadInsDate = new Date();
    return this.usersRepository.save(user);
  }

  async setLoadOutsDate(user: User) {
    user.loadOutsDate = new Date();
    return this.usersRepository.save(user);
  }


  async incrementUserBalance(user: User, amount: number) {
    await this.usersRepository.increment({
      id: user.id,
    }, 'balance', amount);
  }

  async setViewInfoDate(user: User) {
    user.viewInfoDate = new Date();
    return this.usersRepository.save(user);
  }
  
  async setCreateGraphDate(user: User) {
    user.createGraphDate = new Date();
    return this.usersRepository.save(user);
  }

  async setSaveArrowDate(user: User) {
    user.saveArrowDate = new Date();
    return this.usersRepository.save(user);
  }

  async setOpenPostDate(user: User) {
    user.openPostDate = new Date();
    return this.usersRepository.save(user);
  }

  async setOpenLinkDate(user: User) {
    user.openLinkDate = new Date();
    return this.usersRepository.save(user);
  }

  async setOpenArrowDate(user: User) {
    user.openArrowDate = new Date();
    return this.usersRepository.save(user);
  }

  async setMoveTwigDate(user: User) {
    user.moveTwigDate = new Date();
    return this.usersRepository.save(user);
  }

  async setGraftTwigDate(user: User) {
    user.graftTwigDate = new Date();
    return this.usersRepository.save(user);
  }
  
  async setNavDate(user: User) {
    user.navigateGraphDate = new Date();
    return this.usersRepository.save(user);
  }

  async setFirstReplyDate(user: User) {
    user.firstReplyDate = new Date();
    return this.usersRepository.save(user);
  }

  async incrementUserSaveN(user: User) {
    await this.usersRepository.increment({
      id: user.id,
    }, 'saveN', 1);
  }

  async incrementUserMoveN(user: User) {
    await this.usersRepository.increment({
      id: user.id,
    }, 'moveN', 1);
  }

  async incrementUserReplyN(user: User) {
    await this.usersRepository.increment({
      id: user.id,
    }, 'replyN', 1);
  }

  async incrementUserLinkN(user: User) {
    await this.usersRepository.increment({
      id: user.id,
    }, 'N', 1);
  }
  
}
