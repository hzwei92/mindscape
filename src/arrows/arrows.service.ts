import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/user.entity';
import { In, IsNull, Not, Repository } from 'typeorm';
import { Arrow } from './arrow.entity';
import { v4 } from 'uuid'; 
import { getEmptyDraft } from 'src/utils';
import { SearchService } from 'src/search/search.service';
import { RoleType } from 'src/enums';
import { LOAD_LIMIT, PRIVATE_ARROW_DRAFT, PRIVATE_ARROW_TEXT, START_ARROW_ID } from 'src/constants';
import { RolesService } from 'src/roles/roles.service';
import { TwigsService } from 'src/twigs/twigs.service';
import { VotesService } from 'src/votes/votes.service';
import { SheafsService } from 'src/sheafs/sheafs.service';
import { Sheaf } from 'src/sheafs/sheaf.entity';
import { convertFromRaw } from 'draft-js';
import { AlertsService } from 'src/alerts/alerts.service';

@Injectable()
export class ArrowsService {
  constructor(
    @InjectRepository(Arrow)
    private readonly arrowsRepository: Repository<Arrow>,
    private readonly sheafsService: SheafsService,
    private readonly votesService: VotesService,
    private readonly twigsService: TwigsService,
    private readonly rolesService: RolesService,
    private readonly searchService: SearchService,
    private readonly alertsService: AlertsService,
  ) {}

  async indexArrows() {
    const arrows = await this.arrowsRepository.find();
    this.searchService.saveArrows(arrows);
    return arrows;
  }

  async getArrowById(id: string) {
    return this.arrowsRepository.findOne({
      where: {
        id,
      },
    });
  }

  async getArrowsByIds(ids: string[]) {
    return this.arrowsRepository.find({
      where: {
        id: In(ids),
      },
    });
  }


  async getArrowByUserIdAndUrl(userId: string, url: string) {
    return this.arrowsRepository.findOne({
      where: {
        userId,
        url,
      },
    });
  }
  async getArrowsBySheafId(sheafId: string) {
    return this.arrowsRepository.find({
      where: {
        sheafId,
      },
    });
  }

  async getArrowByIdWithPrivacy(user: User, id: string) {
    const arrow = await this.arrowsRepository.findOne({
      where: {
        id,
      },
      relations: ['abstract']
    });
    if (!arrow) {
      throw new BadRequestException('This arrow does not exist');
    }
    if (arrow.abstract.canView !== RoleType.OTHER) {
      const role = await this.rolesService.getRoleByUserIdAndArrowId(user.id, arrow.abstractId);
      if (
        !role ||
        (arrow.abstract.canView === RoleType.SUBSCRIBER && role.type !== RoleType.ADMIN && role.type !== RoleType.MEMBER && role.type !== RoleType.SUBSCRIBER) ||
        (arrow.abstract.canView === RoleType.MEMBER && role.type !== RoleType.ADMIN && role.type !== RoleType.MEMBER) ||
        (arrow.abstract.canView === RoleType.ADMIN && role.type !== RoleType.ADMIN)
      ) {
        arrow.text = PRIVATE_ARROW_TEXT;
        arrow.draft = PRIVATE_ARROW_DRAFT;
        arrow.isOpaque = true;
      }
    }
    return arrow;
  }

  async getArrowsByIdWithPrivacy(user: User, ids: string[]) {
    const roles = await this.rolesService.getRolesByUserId(user.id);

    const arrows = await this.arrowsRepository.find({
      where: {
        id: In(ids),
      },
      relations: ['abstract']
    });

    return arrows.map(arrow => {
      if (arrow.abstract.canView !== RoleType.OTHER) {
        let role;
        roles.some(role_i=> {
          if (role_i.arrowId === arrow.abstractId) {
            role = role_i;
            return true;
          }
          return false;
        });
        if (
          !role ||
          (arrow.abstract.canView === RoleType.SUBSCRIBER && role.type !== RoleType.ADMIN && role.type !== RoleType.MEMBER && role.type !== RoleType.SUBSCRIBER) ||
          (arrow.abstract.canView === RoleType.MEMBER && role.type !== RoleType.ADMIN && role.type !== RoleType.MEMBER) ||
          (arrow.abstract.canView === RoleType.ADMIN && role.type !== RoleType.ADMIN)
        ) {
          arrow.title = '';
          arrow.text = '';
          arrow.draft = PRIVATE_ARROW_DRAFT;
          arrow.isOpaque = true;
        }
      }
      return arrow;
    });
  }

  async getArrowByRouteName(routeName: string) {
    return this.arrowsRepository.findOne({
      where: {
        routeName,
      },
    });
  }

  async getArrowsByUserIdAndUrls(userId: string, urls: string[]) {
    return this.arrowsRepository.find({
      where: {
        userId,
        url: In(urls),
      },
    });
  }

  async getArrowsBySourceId(sourceId: string, offset: number): Promise<Arrow[]> {
    return this.arrowsRepository.createQueryBuilder('arrow')
      .select('arrow')
      .where('arrow.sourceId = :sourceId', { sourceId })
      .orderBy('arrow.weight', 'DESC')
      .addOrderBy('arrow.updateDate', 'DESC')
      .limit(LOAD_LIMIT)
      .offset(offset)
      .getMany()
  }

  async getArrowsByTargetId(targetId: string, offset: number): Promise<Arrow[]> {
    return this.arrowsRepository.createQueryBuilder('arrow')
      .select('arrow')
      .where('arrow.targetId = :targetId', { targetId })
      .orderBy('arrow.weight', 'DESC')
      .addOrderBy('arrow.updateDate', 'DESC')
      .limit(LOAD_LIMIT)
      .offset(offset)
      .getMany()
  }

  async getFeedArrows(offset: number) {
    return this.arrowsRepository.find({
      where: {
        sourceId: Not(IsNull()),
        targetId: Not(IsNull()),
      },
      order: {
        saveDate: 'DESC',
      },
      take: LOAD_LIMIT,
      skip: offset,
    });
  }

  async getStartArrow() {
    return this.arrowsRepository.findOne({
      where: {
        id: START_ARROW_ID,
      }
    });
  }

  async createStartArrow(user: User) {
    const sheaf = await this.sheafsService.createSheaf(null, null, null);

    let { arrow } = await this.createArrow({
      user,
      id: START_ARROW_ID,
      sourceId: null,
      targetId: null,
      abstract: null,
      sheaf,
      draft: getEmptyDraft(),
      title: 'MINDSCAPE.PUB',
      url: null,
      faviconUrl: null,
      routeName:'mindscape'
    });

    ({arrow} = await this.openArrow(user, arrow, arrow.title, arrow.routeName));

    return arrow;
  }

  async openArrow(user: User, arrow: Arrow, title: string, routeName: string) {
    const [rootTwig] = await this.twigsService.createRootTwigs(user, [arrow]);
    arrow.rootTwigId = rootTwig.id;
    arrow.title = title;
    arrow.routeName = routeName;
    arrow = await this.arrowsRepository.save(arrow);

    const role = await this.rolesService.createRole(user, arrow, RoleType.ADMIN);

    return {
      arrow,
      role,
    }
  }

  async createArrow(params: {
    user: User, 
    id: string | null, 
    sourceId: string | null, 
    targetId: string | null, 
    abstract: Arrow | null, 
    sheaf: Sheaf,
    draft: string | null,
    title: string | null,
    url: string | null,
    faviconUrl: string | null,
    routeName: string | null,
  }) {
    const {
      user,
      id,
      sourceId,
      targetId,
      abstract,
      sheaf,
      draft,
      title,
      url,
      faviconUrl,
      routeName,
    } = params;
    const arrow0 = new Arrow();
    arrow0.id = id || v4();
    arrow0.sourceId = sourceId;
    arrow0.targetId = targetId;
    arrow0.userId = user.id;
    arrow0.abstractId = abstract?.id || arrow0.id;
    arrow0.abstractI = abstract ? (abstract.twigN + 1) : 0;
    arrow0.sheafId = sheaf.id;
    arrow0.draft = draft || getEmptyDraft();
    arrow0.title = title;
    arrow0.url = url;
    arrow0.color = user.color;
    arrow0.faviconUrl = faviconUrl;
    arrow0.routeName = routeName || arrow0.id;
    arrow0.saveDate = new Date();
    const arrow1 = await this.arrowsRepository.save(arrow0);

    if (sourceId && targetId) {
      await this.incrementOutCount(sourceId, 1);
      await this.incrementInCount(targetId, 1);
    }

    this.searchService.partialUpdateArrows([arrow1]);

    const [vote] = await this.votesService.createInitialVotes(user, [arrow1]);
    
    return {
      arrow: arrow1,
      vote,
    };
  }

  async deleteArrow(arrow: Arrow) {
    arrow.deleteDate = new Date();
    return this.arrowsRepository.save(arrow);
  }

  async saveArrows(arrows: Arrow[]) {
    return this.arrowsRepository.save(arrows);
  }

  async setArrowTitle(user: User, arrowId: string, title: string) {
    const arrow = await this.arrowsRepository.findOne({ 
      where: {
        id: arrowId 
      }
    });

    if (!arrow) {
      throw new BadRequestException('This arrow does not exist');
    }
    if (arrow.userId !== user.id) {
      throw new BadRequestException('You do not have permission to edit this arrow');
    }

    arrow.title = title.trim();
    return this.arrowsRepository.save(arrow);
  }

  async setArrowColor(user: User, arrowId: string, color: string) {
    const arrow = await this.arrowsRepository.findOne({ 
      where: {
        id: arrowId 
      }
    });

    if (!arrow) {
      throw new BadRequestException('This arrow does not exist');
    }
    if (arrow.userId !== user.id) {
      throw new BadRequestException('You do not have permission to edit this arrow');
    }

    arrow.color = color;
    return this.arrowsRepository.save(arrow);
  }

  async setArrowPermissions(user: User, arrowId: string, canAssignMemberRole: string | null, canEditLayout: string | null, canPost: string | null) {
    const arrow = await this.arrowsRepository.findOne({ 
      where: {
        id: arrowId 
      }
    });

    if (!arrow) {
      throw new BadRequestException('This arrow does not exist');
    }
    if (arrow.userId !== user.id) {
      throw new BadRequestException('You do not have permission to edit this arrow');
    }

    if (canAssignMemberRole) {
      arrow.canAssignMemberRole = RoleType[canAssignMemberRole];
    }
    if (canEditLayout) {
      arrow.canEditLayout = RoleType[canEditLayout];
    }
    if (canPost) {
      arrow.canPost = RoleType[canPost];
    }

    return this.arrowsRepository.save(arrow);
  }

  async saveArrow(user: User, arrowId: string, draft: string) {
    const arrow = await this.arrowsRepository.findOne({ 
      where: {
        id: arrowId 
      }
    });

    if (!arrow) {
      throw new BadRequestException('This arrow does not exist');
    }
    if (arrow.userId !== user.id) {
      throw new BadRequestException('You do not have permission to edit this arrow');
    }

    const contentState = convertFromRaw(JSON.parse(draft));
    const text = contentState.getPlainText('\n');

    arrow.draft = draft;
    arrow.text = text;
    arrow.saveDate = new Date();

    const arrow1 = await this.arrowsRepository.save(arrow);

    this.searchService.saveArrows([arrow1]);

    return arrow1;
  }

  async replyArrow(user: User, sourceId: string, linkId: string, targetId: string, linkDraft: string, targetDraft: string) {
    const source = await this.arrowsRepository.findOne({
      where: {
        id: sourceId,
      },
    });
    if (!source) {
      throw new BadRequestException('This source arrow does not exist');
    }

    const targetSheaf = await this.sheafsService.createSheaf(null, null, null);

    const linkSheaf = await this.sheafsService.createSheaf(source.sheafId, targetSheaf.id, null);

    const { 
      arrow: target,
      vote: targetVote,
    } = await this.createArrow({
      user, 
      id: targetId,
      sourceId: null,
      targetId: null,
      abstract: null,
      sheaf: targetSheaf,
      draft: targetDraft,
      title: null,
      url: null,
      faviconUrl: null,
      routeName: null,
    });

    const { 
      arrow: link,
      vote: linkVote,
    } = await this.createArrow({
      user,
      id: linkId,
      sourceId,
      targetId,
      abstract: null,
      sheaf: linkSheaf,
      draft: linkDraft,
      title: null,
      url: null,
      faviconUrl: null,
      routeName: null,
    });

    const source1 = await this.arrowsRepository.findOne({
      where:{
        id: sourceId,
      }
    });

    const alerts = await this.alertsService.linkAlert(user, source1, link, target, null);
    
    return {
      source: source1,
      target,
      targetVote,
      link,
      linkVote,
      alerts,
    }
  }


  async pasteArrow(user: User, sourceId: string, linkId: string, targetId: string, linkDraft: string) {
    const source = await this.arrowsRepository.findOne({
      where: {
        id: sourceId,
      },
    });
    if (!source) {
      throw new BadRequestException('This source arrow does not exist');
    }

    const target = await this.arrowsRepository.findOne({
      where: {
        id: targetId,
      },
    });
    if (!target) {
      throw new BadRequestException('This target arrow does not exist');
    }

    const linkSheaf = await this.sheafsService.createSheaf(source.sheafId, target.sheafId, null);

    const { 
      arrow: link,
      vote: linkVote,
    } = await this.createArrow({
      user,
      id: linkId,
      sourceId,
      targetId,
      abstract: null,
      sheaf: linkSheaf,
      draft: linkDraft,
      title: null,
      url: null,
      faviconUrl: null,
      routeName: null,
    });

    const source1 = await this.arrowsRepository.findOne({
      where:{
        id: sourceId,
      }
    });

    const alerts = await this.alertsService.linkAlert(user, source1, link, target, null);

    return {
      source: source1,
      target,
      link,
      linkVote,
      alerts,
    }
  }

  async linkArrows(user: User, abstract: Arrow | null, sourceId: string, targetId: string) {
    const source = await this.arrowsRepository.findOne({
      where: {
        id: sourceId,
      },
    });
    if (!source) {
      throw new BadRequestException('This source arrow does not exist');
    }

    const target = await this.arrowsRepository.findOne({
      where: {
        id: targetId,
      },
    });
    if (!target) {
      throw new BadRequestException('This target arrow does not exist');
    }

    let sheaf = await this.sheafsService.getSheafBySourceIdAndTargetId(source.sheafId, target.sheafId)

    if (sheaf) {
      sheaf = await this.sheafsService.incrementWeight(sheaf, 1);
    }
    else {
      sheaf = await this.sheafsService.createSheaf(source.sheafId, target.sheafId, null);
    }

    const { arrow, vote } = await this.createArrow({
      user, 
      id: null, 
      sourceId, 
      targetId, 
      abstract, 
      sheaf, 
      draft: null, 
      title: null, 
      url: null,
      faviconUrl: null,
      routeName: null,
    });

    source.outCount++;
    target.inCount++;

    const alerts = await this.alertsService.linkAlert(user, source, arrow, target, null);

    return {
      source, 
      target,
      sheaf,
      arrow,
      vote,
      alerts,
    }
  }

  async incrementInCount(id: string, value: number) {
    await this.arrowsRepository.increment({ id }, 'inCount', value);
  }

  async incrementOutCount(id: string, value: number) {
    await this.arrowsRepository.increment({ id }, 'outCount', value);
  }

  async incrementTwigN(id: string, value: number) {
    await this.arrowsRepository.increment({ id }, 'twigN', value);
  }

  async incrementTwigZ(id: string, value: number) {
    await this.arrowsRepository.increment({ id }, 'twigZ', value);
  }

  async incrementWeight(id: string, weight: number) {
    if (weight !== 0) {
      await this.arrowsRepository.increment({ id }, 'weight', weight)
    }
    const arrow = await this.getArrowById(id);
    return arrow;
  }
}
