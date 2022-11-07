import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { MoreThan, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { adjectives, animals, NumberDictionary, uniqueNamesGenerator } from 'unique-names-generator';
import { SearchService } from 'src/search/search.service';
import { ArrowsService } from 'src/arrows/arrows.service';
import { SheafsService } from 'src/sheafs/sheafs.service';
import { TabsService } from 'src/tabs/tabs.service';
import { PaletteMode } from 'src/enums';
import { getEmptyDraft } from 'src/utils';
import { Arrow } from 'src/arrows/arrow.entity';
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

  async initUser(palette: string): Promise<User> {
    let name = '';
    let existingUser = null;

    do {
      name = uniqueNamesGenerator({
        dictionaries: [adjectives, animals, numbers],
        length: 3,
        separator: '-'
      });
      existingUser = await this.getUserByName(name);
    } while (existingUser);

    const user0 = new User();
    user0.name = name;
    user0.lowercaseName = name.toLowerCase();
    user0.routeName = encodeURIComponent(user0.lowercaseName);
    user0.color = '#' + Math.round(Math.random() * Math.pow(16, 6)).toString(16).padStart(6, '0')
    user0.palette = palette === 'dark'
      ? PaletteMode.DARK
      : PaletteMode.LIGHT;
    const user1 = await this.usersRepository.save(user0);

    const startArrow1 = await this.arrowsService.getArrowById(START_ARROW_1_ID);
    if (startArrow1) {
      const tab1 = await this.tabsService.appendTab(user1, startArrow1, false, false);
    }

    const startArrow2 = await this.arrowsService.getArrowById(START_ARROW_2_ID);
    if (startArrow2) {
      const tab2 = await this.tabsService.appendTab(user1, startArrow2, false, false);
    }

    let startArrow = await this.arrowsService.getStartArrow();
    if (!startArrow) {
      startArrow = await this.arrowsService.createStartArrow(user1);
    }

    const tab = await this.tabsService.appendTab(user1, startArrow, false, false);

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
    user0.email = email;

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

  async incrementUserBalance(user: User, amount: number) {
    await this.usersRepository.increment({
      id: user.id,
    }, 'balance', amount);
  }
}
