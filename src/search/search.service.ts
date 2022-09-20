import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import algoliasearch, {SearchClient, SearchIndex} from 'algoliasearch';
import { Arrow } from 'src/arrows/arrow.entity';
import { User } from 'src/users/user.entity';

@Injectable()
export class SearchService {
  constructor(
    private readonly configService: ConfigService,
  ) {
    this.client = algoliasearch(
      configService.get('ALGOLIA_APP_ID'),
      configService.get('ALGOLIA_API_KEY'),
    )
    this.index = this.client.initIndex(configService.get('ALGOLIA_INDEX_NAME'))
  }

  client: SearchClient
  index: SearchIndex

  mapArrowsToRecords(arrows: Arrow[]) {
    return arrows.map(arrow => {
      const record = {
        ...arrow,
        __typename: 'Arrow',
        objectID: arrow.id,
      };
      return record;
    });
  }

  async saveArrows(arrows: Arrow[]) {
    const records = this.mapArrowsToRecords(arrows);
    try {
      const result = await this.index.saveObjects(records);
      console.log(result);
    } catch (e) {
      console.error(e);
    }
  }

  async partialUpdateArrows(arrows: Arrow[]) {
    const records = this.mapArrowsToRecords(arrows);
    try {
      const result = await this.index.partialUpdateObjects(records);
      console.log(result)
    } catch (e) {
      console.error(e);
    }
  }

  mapUsersToRecords(users: User[]) {
    return users.map(user => {
      const record = {
        ...user,
        __typename: 'User',
        objectID: user.id,
      }
      return record;
    })
  }

  async saveUsers(users: User[]) {
    const records = this.mapUsersToRecords(users);
    try {
      const result = await this.index.saveObjects(records);
      console.log(result);
    } catch (e) {
      console.error(e);
    }
  }

  async partialUpdateUsers(users: User[]) {
    const records = this.mapUsersToRecords(users);
    try {
      const result = await this.index.partialUpdateObjects(records);
      console.log(result)
    } catch (e) {
      console.error(e);
    }
  }
  
}
