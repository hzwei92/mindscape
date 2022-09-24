import { BadRequestException, forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { uuidRegexExp } from 'src/constants';
import { ArrowsService } from 'src/arrows/arrows.service';
import { RolesService } from 'src/roles/roles.service';
import { In, Repository } from 'typeorm';
import { Twig } from './twig.entity';
import { RoleType } from '../enums';
import { Arrow } from 'src/arrows/arrow.entity';
import { User } from 'src/users/user.entity';
import { checkPermit, IdToType } from 'src/utils';
import { SheafsService } from 'src/sheafs/sheafs.service';
import { WindowEntry } from './dto/window-entry.dto';
import { GroupEntry } from './dto/group-entry.dto';
import { TabEntry } from './dto/tab-entry.dto';
import { BookmarkEntry } from './dto/bookmark-entry.dto';
import { v4 } from 'uuid';

@Injectable()
export class TwigsService {
  constructor (
    @InjectRepository(Twig) 
    private readonly twigsRepository: Repository<Twig>,
    @Inject(forwardRef(() => ArrowsService))
    private readonly arrowsService: ArrowsService,
    private readonly sheafsService: SheafsService,
    private readonly rolesService: RolesService,
  ) {}

  async getTwigById(id: string): Promise<Twig> {
    return this.twigsRepository.findOne({ 
      where: {
        id 
      }
    });
  }

  async getTwigsBySourceIdsAndTargetIds(sourceIds: string[], targetIds: string[]) {
    return this.twigsRepository.find({
      where: {
        sourceId: In(sourceIds),
        targetId: In(targetIds),
      },
    });
  }
  async getTwigWithSiblingsById(id: string): Promise<Twig> {
    return this.twigsRepository.findOne({ 
      where: {
        id 
      },
      relations: ['parent', 'parent.children'],
    });
  }

  async getTwigsByIds(ids: string[]) {
    return this.twigsRepository.find({
      where: {
        id: In(ids),
      },
    });
  }

  async getRootTwigByAbstractId(abstractId: string) {
    return this.twigsRepository.findOne({
      where: {
        abstractId,
        isRoot: true,
      }
    });
  }

  async getTwigsByAbstractId(abstractId: string): Promise<Twig[]> {
    const twigs = await this.twigsRepository.find({
      where: {
        abstractId,
      },
    });
    return twigs
  }

  async getTwigsByAbstractIdAndDetailId(abstractId: string, detailId: string) {
    return this.twigsRepository.find({
      where: {
        abstractId,
        detailId,
      },
      
    });
  }

  async getTwigByChildId(childId: string): Promise<Twig> {
    const child = await this.twigsRepository.findOne({
      where: {
        id: childId,
      },
      relations: ['parent'],
    });
    return child?.parent;
  }

  async createRootTwigs(user: User, arrows: Arrow[]) {
    const twigs0 = arrows.map(arrow => {
      const twig0 = new Twig();
      twig0.userId = user.id;
      twig0.abstractId = arrow.id;
      twig0.detailId = arrow.id;
      twig0.isRoot = true;
      return twig0;
    })
    return this.twigsRepository.save(twigs0);
  }

  async createTwig(params: {
    user: User,
    abstract: Arrow, 
    detail: Arrow | null,
    parentTwig: Twig | null, 
    twigId: string | null, 
    sourceId: string | null,
    targetId: string | null,
    i: number,
    x: number,
    y: number,
    z: number,
    isOpen: boolean,
  }) {
    const {
      user,
      abstract,
      detail,
      parentTwig, 
      twigId, 
      sourceId,
      targetId,
      i,
      x,
      y,
      z,
      isOpen,
    } = params;

    const twig0 = new Twig();
    twig0.id = twigId || undefined;
    twig0.sourceId = sourceId;
    twig0.targetId = targetId;
    twig0.userId = user.id;
    twig0.abstractId = abstract.id;
    twig0.detailId = detail?.id;
    twig0.parent = parentTwig;
    twig0.i = i;
    twig0.x = x
    twig0.y = y
    twig0.z = z;
    twig0.isOpen = isOpen;
    return this.twigsRepository.save(twig0);
  }

  async replyTwig(user: User, parentTwigId: string, twigId: string, postId: string, x: number, y: number, draft: string) {
    if (!uuidRegexExp.test(twigId)) {
      throw new BadRequestException('Twig ID must be valid uuid')
    }
    if (!uuidRegexExp.test(postId)) {
      throw new BadRequestException('Post ID must be valid uuid')
    }

    const parentTwig = await this.twigsRepository.findOne({
      where: {
        id: parentTwigId,
      },
      relations: ['abstract', 'children', 'detail']
    });
    if (!parentTwig) {
      throw new BadRequestException('This parent twig does not exist');
    }

    let role = await this.rolesService.getRoleByUserIdAndArrowId(user.id, parentTwig.abstractId);
    let role1 = null;
    if (checkPermit(parentTwig.abstract.canPost, role?.type)) {
      if (!role) {
        role = await this.rolesService.createRole(user, parentTwig.abstract, RoleType.OTHER);
        role1 = role;
      }
    }
    else {
      throw new BadRequestException('Insufficient privileges');
    }

    const existingTwig = await this.getTwigById(twigId);
    if (existingTwig) {
      throw new BadRequestException('This Twig ID is already in use')
    }
    const existingArrow = await this.arrowsService.getArrowById(postId);
    if (existingArrow) {
      throw new BadRequestException('This Post ID is already in use')
    }

    const postSheaf = await this.sheafsService.createSheaf(null, null, null);

    const { arrow: post } = await this.arrowsService.createArrow({
      user,
      id: postId,
      sourceId: null,
      targetId: null,
      abstract: parentTwig.abstract,
      sheaf: postSheaf,
      draft: null,
      title: null,
      url: null,
      faviconUrl: null,
      routeName: null,
    });

    const postTwig = await this.createTwig({
      user,
      abstract: parentTwig.abstract,
      detail: post,
      parentTwig,
      twigId,
      sourceId: null, 
      targetId: null,
      i: parentTwig.abstract.twigN + 1,
      x,
      y,
      z: parentTwig.abstract.twigZ + 1,
      isOpen: true,
    });

    const linkSheaf = await this.sheafsService.createSheaf(parentTwig.detail.sheafId, post.sheafId, null);

    const { arrow: link } = await this.arrowsService.createArrow({
      user,
      id: null,
      sourceId: parentTwig.detailId,
      targetId: post.id,
      abstract: parentTwig.abstract,
      sheaf: linkSheaf,
      draft: null,
      title: null,
      url: null,
      faviconUrl: null,
      routeName: null,
    });

    const linkTwig = await this.createTwig({
      user,
      abstract: parentTwig.abstract,
      detail: link,
      parentTwig: null,
      twigId: null,
      sourceId: parentTwig.id,
      targetId: postTwig.id,
      i: parentTwig.abstract.twigN + 2,
      x: Math.round((parentTwig.x + x) / 2),
      y: Math.round((parentTwig.y + y) / 2),
      z: parentTwig.abstract.twigZ + 2,
      isOpen: false,
    });

    await this.arrowsService.incrementTwigN(parentTwig.abstractId, 2);
    await this.arrowsService.incrementTwigZ(parentTwig.abstractId, 2);
    const abstract = await this.arrowsService.getArrowById(parentTwig.abstractId);

    const source = await this.arrowsService.getArrowById(parentTwig.detailId);

    return {
      abstract,
      source,
      link: linkTwig,
      target: postTwig,
      role: role1,
    };
  }


  async pasteTwig(user: User, parentTwigId: string, twigId: string, postId: string, x: number, y: number) {
    if (!uuidRegexExp.test(twigId)) {
      throw new BadRequestException('Twig ID must be valid uuid')
    }
    if (!uuidRegexExp.test(postId)) {
      throw new BadRequestException('Post ID must be valid uuid')
    }

    const parentTwig = await this.twigsRepository.findOne({
      where: {
        id: parentTwigId,
      },
      relations: ['abstract', 'children', 'detail']
    });
    if (!parentTwig) {
      throw new BadRequestException('This parent twig does not exist');
    }

    let role = await this.rolesService.getRoleByUserIdAndArrowId(user.id, parentTwig.abstractId);
    let role1 = null;
    if (checkPermit(parentTwig.abstract.canPost, role?.type)) {
      if (!role) {
        role = await this.rolesService.createRole(user, parentTwig.abstract, RoleType.OTHER);
        role1 = role;
      }
    }
    else {
      throw new BadRequestException('Insufficient privileges');
    }

    const existingTwig = await this.getTwigById(twigId);
    if (existingTwig) {
      throw new BadRequestException('This Twig ID is already in use')
    }
    const existingArrow = await this.arrowsService.getArrowById(postId);

    const postTwig = await this.createTwig({
      user,
      abstract: parentTwig.abstract,
      detail: existingArrow,
      parentTwig,
      twigId,
      sourceId: null, 
      targetId: null,
      i: parentTwig.abstract.twigN + 1,
      x,
      y,
      z: parentTwig.abstract.twigZ + 1,
      isOpen: true,
    });

    const linkSheaf = await this.sheafsService.createSheaf(parentTwig.detail.sheafId, existingArrow.sheafId, null);

    const { arrow: link } = await this.arrowsService.createArrow({
      user,
      id: null,
      sourceId: parentTwig.detailId,
      targetId: existingArrow.id,
      abstract: parentTwig.abstract,
      sheaf: linkSheaf,
      draft: null,
      title: null,
      url: null,
      faviconUrl: null,
      routeName: null,
    });

    const linkTwig = await this.createTwig({
      user,
      abstract: parentTwig.abstract,
      detail: link,
      parentTwig: null,
      twigId: null,
      sourceId: parentTwig.id,
      targetId: postTwig.id,
      i: parentTwig.abstract.twigN + 2,
      x: Math.round((parentTwig.x + x) / 2),
      y: Math.round((parentTwig.y + y) / 2),
      z: parentTwig.abstract.twigZ + 2,
      isOpen: false,
    });

    await this.arrowsService.incrementTwigN(parentTwig.abstractId, 2);
    await this.arrowsService.incrementTwigZ(parentTwig.abstractId, 2);
    const abstract = await this.arrowsService.getArrowById(parentTwig.abstractId);

    const source = await this.arrowsService.getArrowById(parentTwig.detailId);

    return {
      abstract,
      source,
      link: linkTwig,
      target: postTwig,
      role: role1,
    };
  }

  async removeTwig(user: User, twigId: string, shouldRemoveDescs: boolean) {
    const twig = await this.twigsRepository.findOne({
      where: {
        id: twigId
      },
      relations: ['parent', 'children']
    });

    if (!twig) {
      throw new BadRequestException('This twig does not exist');
    }
    const abstract = await this.arrowsService.getArrowById(twig.abstractId);

    let role = await this.rolesService.getRoleByUserIdAndArrowId(user.id, abstract.id);
    let role1 = null;
    if (checkPermit(abstract.canEdit, role?.type)) {
      if (!role) {
        role = await this.rolesService.createRole(user, abstract, RoleType.OTHER);
        role1 = role;
      }
    }
    else {
      throw new BadRequestException('Insufficient privileges');
    }

    const date = new Date();

    if (shouldRemoveDescs) {
      let twigs = await this.twigsRepository.manager.getTreeRepository(Twig)
        .findDescendants(twig);


      twigs = twigs.map(twig => {
        twig.deleteDate = date;
        return twig;
      });

      const links = await this.twigsRepository.find({
        where: [{
          sourceId: In(twigs.map(twig => twig.id)),
        }, {
          targetId: In(twigs.map(twig => twig.id)),
        }]
      });

      twigs.push(...links.map(link => {
        link.deleteDate = date;
        return link;
      }));

      twigs = await this.twigsRepository.save(twigs);

      return {
        //abstract: abstract1,
        parentTwig: twig.parent,
        twigs,
        role: role1,
      };
    }
    else {
      let children = (twig.children || []).map(child => {
        child.parent = twig.parent;
        return child;
      });

      twig.deleteDate = date;

      let links = await this.twigsRepository.find({
        where: [{
          sourceId: twig.id,
        }, {
          targetId: twig.id,
        }]
      });

      links = links.map(link => {
        link.deleteDate = date;
        return link;
      })

      const twigs = await this.twigsRepository.save([twig, ...children, ...links]);

      return {
        parentTwig: twig.parent,
        twigs,
        role: role1,
      }
    }


  }

  async selectTwig(user: User, twigId: string) {
    const twig = await this.getTwigById(twigId);
    if (!twig) {
      throw new BadRequestException('This twig does not exist');
    }
    const abstract = await this.arrowsService.getArrowById(twig.abstractId);
    if (!abstract) {
      throw new BadRequestException('This abstract does not exist');
    }

    let role = await this.rolesService.getRoleByUserIdAndArrowId(user.id, abstract.id);
    let role1 = null;
    if (checkPermit(abstract.canEdit, role?.type)) {
      if (!role) {
        role = await this.rolesService.createRole(user, abstract, RoleType.OTHER);
        role1 = role;
      }
    }
    else {
      throw new BadRequestException('Insufficient privileges');
    }

    const descendants = await this.twigsRepository.manager.getTreeRepository(Twig).findDescendants(twig);

    const baseZ = twig.detailId === abstract.id
      ? 0
      : abstract.twigZ;

    const twigs0 = descendants.map((twig, i) => {
      const twig0 = new Twig();
      twig0.id = twig.id;
      if (twig.id === twigId) {
        twig0.z = baseZ + descendants.length + 1;    
      }
      else {
        twig0.z = baseZ + i + 1;
      }
      return twig0;
    });

    const twigs1 = await this.twigsRepository.save(twigs0);

    const twigZ = baseZ + descendants.length + 1 - abstract.twigZ;

    await this.arrowsService.incrementTwigZ(abstract.id, twigZ);

    const abstract1 = await this.arrowsService.getArrowById(abstract.id);
    return {
      abstract: abstract1,
      twigs: twigs1,
      role: role1,
    }
  }

  async linkTwigs(user: User, abstractId: string, sourceId: string, targetId: string) {
    const abstract = await this.arrowsService.getArrowById(abstractId);
    if (!abstract) {
      throw new BadRequestException('This abstract does not exist');
    }

    let role = await this.rolesService.getRoleByUserIdAndArrowId(user.id, abstract.id);
    let role1 = null;
    if (checkPermit(abstract.canView, role?.type)) {
      if (!role) {
        role = await this.rolesService.createRole(user, abstract, RoleType.OTHER);
        role1 = role;
      }
    }
    else {
      throw new BadRequestException('Insufficient privileges');
    }

    const source = await this.arrowsService.getArrowById(sourceId);
    if (!source) {
      throw new BadRequestException('This source does not exist');
    }
    const target = await this.arrowsService.getArrowById(targetId);
    if (!target) {
      throw new BadRequestException('This target does not exist');
    }
    const sourceTwigs = await this.getTwigsByAbstractIdAndDetailId(abstract.id, source.id);
    if (!sourceTwigs.length) {
      throw new BadRequestException('This sourceTwig does not exist');
    }
    const targetTwigs = await this.getTwigsByAbstractIdAndDetailId(abstract.id, target.id);
    if (!targetTwigs.length) {
      throw new BadRequestException('This targetTwig does not exist');
    }

    let sheaf = await this.sheafsService.getSheafBySourceIdAndTargetId(source.sheafId, target.sheafId);
    if (sheaf) {
      sheaf = await this.sheafsService.incrementWeight(sheaf, 1, 0);
    }
    else {
      sheaf = await this.sheafsService.createSheaf(source.sheafId, target.sheafId, null);
    }
    const { arrow } = await this.arrowsService.createArrow({
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

    const source1 = await this.arrowsService.getArrowById(source.id);
    const target1 = await this.arrowsService.getArrowById(target.id);

    const existingTwigs = await this.getTwigsBySourceIdsAndTargetIds(
      sourceTwigs.map(twig => twig.id), 
      targetTwigs.map(twig => twig.id),
    );
    
    const sourceIdToTargetIdToTwig = existingTwigs.reduce((acc, twig) => {
      if (acc[twig.sourceId]) {
        acc[twig.sourceId][twig.targetId] = twig;
      }
      else {
        acc[twig.sourceId] = {
          [twig.targetId]: twig,
        }
      }
      return acc;
    }, {});

    let twigs = [];
    sourceTwigs.forEach(sourceTwig => {
      targetTwigs.forEach(targetTwig => {
        if (
          sourceIdToTargetIdToTwig[sourceTwig.id] && 
          sourceIdToTargetIdToTwig[sourceTwig.id][targetTwig.id]
        ) return;

        const x = Math.round((sourceTwig.x + targetTwig.x) / 2);
        const y = Math.round((sourceTwig.y + targetTwig.y) / 2);

        const twig = new Twig();
        twig.sourceId = sourceTwig.id;
        twig.targetId = targetTwig.id;
        twig.userId = user.id;
        twig.abstractId = abstract.id;
        twig.detailId = arrow.id;
        twig.i = abstract.twigN + twigs.length + 1;
        twig.x = x
        twig.y = y
        twig.z = abstract.twigZ + twigs.length + 1;
        twig.isOpen = false;
      
        twigs.push(twig);
      });
    });

    twigs = await this.twigsRepository.save(twigs);

    if (sourceTwigs.length) {
      twigs.push(sourceTwigs[0]);
    }
    if (targetTwigs.length) {
      twigs.push(targetTwigs[0]);
    }

    await this.arrowsService.incrementTwigN(abstract.id, twigs.length + 1);
    await this.arrowsService.incrementTwigZ(abstract.id, twigs.length + 1);

    const abstract1 = await this.arrowsService.getArrowById(abstract.id);

    return {
      abstract: abstract1,
      twigs,
      source: source1,
      target: target1,
      role: role1,
    }
  }

  async moveTwig(user: User, twigId: string, x: number, y: number) {
    const twig = await this.getTwigById(twigId);
    if (!twig) {
      throw new BadRequestException('This twig does not exist');
    }
    const abstract = await this.arrowsService.getArrowById(twig.abstractId);

    let role = await this.rolesService.getRoleByUserIdAndArrowId(user.id, abstract.id);
    let role1 = null;
    if (checkPermit(abstract.canEdit, role?.type)) {
      if (!role) {
        role = await this.rolesService.createRole(user, abstract, RoleType.OTHER);
        role1 = role;
      }
    }
    else {
      throw new BadRequestException('Insufficient privileges');
    }

    let twigs1 = [];

    const dx = x - twig.x;
    const dy = y - twig.y;

    let descs = await this.twigsRepository.manager.getTreeRepository(Twig).findDescendants(twig);

    descs = descs.map(desc => {
      if (desc.id === twigId) {
        desc.x = x;
        desc.y = y;
      }
      else {
        desc.x += dx;
        desc.y += dy;
      }
      return desc
    })
    twigs1 = await this.twigsRepository.save(descs);

    return {
      twigs: twigs1,
      role: role1,
    }
  }

  async graftTwig(user: User, twigId: string, parentTwigId: string) {
    let twig = await this.twigsRepository.findOne({
      where: {
        id: twigId
      },
      relations: ['parent', 'parent.children']
    });
    if (!twig) {
      throw new BadRequestException('This twig does not exist');
    }

    const parentTwig = await this.twigsRepository.findOne({
      where: {
        id: parentTwigId
      },
      relations: ['children'],
    });
    if (!parentTwig) {
      throw new BadRequestException('This parent twig does not exist');
    }

    if (twig.abstractId !== parentTwig.abstractId) {
      throw new BadRequestException('Cannot graft twig into new abstract')
    }

    const abstract = await this.arrowsService.getArrowById(twig.abstractId);
    if (!abstract) {
      throw new BadRequestException('This abstract does not exist');
    }

    let role = await this.rolesService.getRoleByUserIdAndArrowId(user.id, abstract.id);
    let role1 = null;
    if (checkPermit(abstract.canEdit, role?.type)) {
      if (!role) {
        role = await this.rolesService.createRole(user, abstract, RoleType.OTHER);
        role1 = role;
      }
    }
    else {
      throw new BadRequestException('Insufficient privileges');
    }

    twig.id = twigId;
    twig.parent = parentTwig;

    if (twig.tabId && parentTwig.groupId) {
      twig.groupId = parentTwig.groupId;
    }
    
    twig = await this.twigsRepository.save(twig);

    return {
      twig,
      role: role1,
    }
  }

  async copyTwig(user: User, twigId: string, parentTwigId: string) {
    let twig = await this.twigsRepository.findOne({
      where: {
        id: twigId
      },
      relations: ['parent', 'parent.children']
    });
    if (!twig) {
      throw new BadRequestException('This twig does not exist');
    }

    const parentTwig = await this.twigsRepository.findOne({
      where: {
        id: parentTwigId
      },
      relations: ['children'],
    });
    if (!parentTwig) {
      throw new BadRequestException('This parent twig does not exist');
    }

    if (twig.abstractId !== parentTwig.abstractId) {
      throw new BadRequestException('Cannot copy twig into new abstract')
    }

    const abstract = await this.arrowsService.getArrowById(twig.abstractId);
    if (!abstract) {
      throw new BadRequestException('This abstract does not exist');
    }

    let role = await this.rolesService.getRoleByUserIdAndArrowId(user.id, abstract.id);
    let role1 = null;
    if (checkPermit(abstract.canEdit, role?.type)) {
      if (!role) {
        role = await this.rolesService.createRole(user, abstract, RoleType.OTHER);
        role1 = role;
      }
    }
    else {
      throw new BadRequestException('Insufficient privileges');
    }

    const descsTree = await this.twigsRepository.manager.getTreeRepository(Twig)
      .findDescendantsTree(twig);

    const twigs0 = [];

    const queue = [{
      newParent: parentTwig,
      subTree: descsTree,
    }];

    while (queue.length > 0) {
      const {
        newParent,
        subTree,
      } = queue.shift();

      const twig0 = new Twig();
      twig0.id = v4();
      twig0.userId = user.id;
      twig0.abstractId = abstract.id;
      twig0.detailId = subTree.detailId;
      twig0.parent = newParent;
      twig0.i = subTree.i;
      twig0.x = subTree.x
      twig0.y = subTree.y
      twig0.z = subTree.z;
      twig0.isOpen = subTree.isOpen;
      twigs0.push(twig0);

      subTree.children.forEach(child => {
        queue.push({
          newParent: twig0,
          subTree: child,
        });
      });
    }

    const twigs1 = await this.twigsRepository.save(twigs0);

    return {
      twigs: twigs1,
      role: role1,
    }
  }

  async openTwig(user: User, twigId: string, shouldOpen: boolean) {
    let twig = await this.getTwigById(twigId);
    if (!twig) {
      throw new BadRequestException('This twig does not exist');
    }
    const abstract = await this.arrowsService.getArrowById(twig.abstractId);
    if (!abstract) {
      throw new BadRequestException('This abstract does not exist')
    }

    let role = await this.rolesService.getRoleByUserIdAndArrowId(user.id, abstract.id);
    let role1 = null;
    if (checkPermit(abstract.canEdit, role?.type)) {
      if (!role) {
        role = await this.rolesService.createRole(user, abstract, RoleType.OTHER);
        role1 = role;
      }
    }
    else {
      throw new BadRequestException('Insufficient privileges');
    }

    twig.isOpen = shouldOpen;
    const twig1 = await this.twigsRepository.save(twig);

    return {
      twig: twig1,
      role: role1,
    }
  }

  async syncTabState(user: User, twigId: string, windowEntries: WindowEntry[], groupEntries: GroupEntry[], tabEntries: TabEntry[]) {
    const rootTwig = await this.getTwigById(twigId);

    const descs = await this.twigsRepository.manager.getTreeRepository(Twig)
      .createDescendantsQueryBuilder('twig', 'twigClosure', rootTwig)
      .getMany();
    
    const windowTwigs = await this.loadWindows(user, windowEntries);
    const groupTwigs = await this.loadGroups(user, groupEntries);
    const tabTwigs = await this.loadTabs(user, tabEntries);

    const idToTwig: IdToType<Twig> = [...windowTwigs, ...groupTwigs, ...tabTwigs].reduce((acc, twig) => {
      acc[twig.id] = twig;
      return acc;
    }, {})

    const date = new Date();
    let deleted: Twig[] = descs.reduce((acc, desc) => {
      if (desc.windowId && !idToTwig[desc.id]) {
        desc.deleteDate = date;
        acc.push(desc);
      }
      return acc;
    }, [])
    deleted = await this.twigsRepository.save(descs);

    return {
      windows: windowTwigs,
      groups: groupTwigs,
      tabs: tabTwigs,
      deleted,
    }
  }

  async loadWindows(user: User, windowEntries: WindowEntry[]) {
    const abstract = null /// await this.arrowsService.getArrowById(user.frameId);

    const parentTwigIdToTrue = windowEntries.reduce((acc, entry) => {
      acc[entry.parentTwigId] = true;
      return acc
    }, {});

    const twigs = await this.getTwigsByIds([
      ...Object.keys(parentTwigIdToTrue),
      ...windowEntries.map(entry => entry.twigId),
    ]);

    const idToTwig: IdToType<Twig> = twigs.reduce((acc, twig) => {
      acc[twig.id] = twig;
      return acc;
    }, {});

    await this.arrowsService.loadWindowArrows(user, abstract, windowEntries);

    let i = 0;
    let windowTwigs = windowEntries.map((entry, j) => {
      const parent = idToTwig[entry.parentTwigId];

      let twigI;
      if (idToTwig[entry.twigId]) {
        twigI = idToTwig[entry.twigId].i
      }
      else {
        twigI = abstract.twigN + i + 1;
        i++;
      }
      const twig = new Twig();
      twig.id = entry.twigId
      twig.userId = user.id;
      twig.abstractId = abstract.id;
      twig.detailId = entry.arrowId;
      twig.parent = parent;
      twig.i = twigI;
      twig.x = parent.x;
      twig.y = parent.y;
      twig.z = abstract.twigZ + j + 1;
      twig.windowId = entry.windowId;
      return twig;
    });

    windowTwigs = await this.twigsRepository.save(windowTwigs);

    await this.arrowsService.incrementTwigN(abstract.id, i + 1);
    await this.arrowsService.incrementTwigZ(abstract.id, windowTwigs.length);

    return windowTwigs;
  }
  
  async loadGroups(user: User, groupEntries: GroupEntry[]) {
    const abstract = null //await this.arrowsService.getArrowById(user.frameId);

    const parentTwigIdToTrue = groupEntries.reduce((acc, entry) => {
      acc[entry.parentTwigId] = true;
      return acc
    }, {});

    const twigs = await this.getTwigsByIds([
      ...Object.keys(parentTwigIdToTrue),
      ...groupEntries.map(entry => entry.twigId),
    ]);

    const idToTwig: IdToType<Twig> = twigs.reduce((acc, twig) => {
      acc[twig.id] = twig;
      return acc;
    }, {});

    await this.arrowsService.loadGroupArrows(user, abstract, groupEntries);

    let i = 0;
    let groupTwigs = groupEntries.map((entry, i) => {
      const parent = idToTwig[entry.parentTwigId];

      let twigI;
      if (idToTwig[entry.twigId]) {
        twigI = idToTwig[entry.twigId].i;
      }
      else {
        twigI = abstract.twigN + i + 1;
        i++;
      }

      const twig = new Twig();
      twig.id = entry.twigId;
      twig.userId = user.id;
      twig.abstractId = abstract.id;
      twig.detailId = entry.arrowId;
      twig.parent = parent;
      twig.i = twigI;
      twig.x = parent.x;
      twig.y = parent.y;
      twig.z = abstract.twigZ + i + 1;
      twig.windowId = entry.windowId;
      twig.groupId = entry.groupId;
      return twig;
    });

    groupTwigs = await this.twigsRepository.save(groupTwigs);

    await this.arrowsService.incrementTwigN(abstract.id, i + 1);
    await this.arrowsService.incrementTwigZ(abstract.id, groupTwigs.length);

    return groupTwigs;
  }

  async loadTabs(user: User, tabEntries: TabEntry[]) {
    const abstract = null// await this.arrowsService.getArrowById(user.frameId);

    const parentTwigIdToTrue = tabEntries.reduce((acc, entry) => {
      acc[entry.parentTwigId] = true;
      return acc
    }, {});

    const twigs = await this.getTwigsByIds([
      ...Object.keys(parentTwigIdToTrue),
      ...tabEntries.map(entry => entry.twigId)
    ]);

    const idToTwig: IdToType<Twig> = twigs.reduce((acc, twig) => {
      acc[twig.id] = twig;
      return acc;
    }, {});

    const tabTwigs = [];

    let tabEntries1 = await this.arrowsService.loadTabArrows(user, abstract, tabEntries) as TabEntry[];
    tabEntries1.sort((a, b) => a.degree < b.degree ? -1 : 1);

    let degree = tabEntries1[0]?.degree;
    let i = 0;
    let j = 0;
    while (tabEntries1.length) {
      const nextEntries = [];
      let twigs = [];
      tabEntries1.forEach(entry => {
        if (entry.degree === degree) {
          const parent = idToTwig[entry.parentTwigId];

          if (!parent) {
            console.error('Missing parent for entry', entry, idToTwig);
          }
          
          let twigI;
          if (idToTwig[entry.twigId]) {
            twigI = idToTwig[entry.twigId].i;
          }
          else {
            twigI = abstract.twigN + i + 1;
            i++;
          }
          const twig = new Twig();
          twig.id = entry.twigId;
          twig.userId = user.id;
          twig.abstractId = abstract.id;
          twig.detailId = entry.arrowId;
          twig.parent = parent;
          twig.i = twigI;
          twig.x = parent.x;
          twig.y = parent.y;
          twig.z = abstract.twigZ + j+ 1;
          twig.windowId = entry.windowId;
          twig.groupId = entry.groupId;
          twig.tabId = entry.tabId;
          twigs.push(twig);
          j++;
        }
        else {
          nextEntries.push(entry);
        }
      });

      twigs = await this.twigsRepository.save(twigs);
      twigs.forEach(twig => {
        tabTwigs.push(twig);
        idToTwig[twig.id] = twig;
      });
      tabEntries1 = nextEntries;
      degree++;
    }

    await this.arrowsService.incrementTwigN(abstract.id, i + 1);
    await this.arrowsService.incrementTwigZ(abstract.id, tabTwigs.length);

    return tabTwigs;
  }

  async createWindow(user, windowEntry: WindowEntry) {
    const parent = await this.twigsRepository.findOne({
      where: {
        id: windowEntry.parentTwigId,
      },
      relations: ['children'],
    });

    const [twig] = await this.loadWindows(user, [windowEntry]);

    return {
      twig,
    };
  }

  async createGroup(user, groupEntry: GroupEntry) {
    const parent = await this.twigsRepository.findOne({
      where: {
        id: groupEntry.parentTwigId,
      },
      relations: ['children'],
    });

    const [twig] = await this.loadGroups(user, [groupEntry]);

    return {
      twig,
    };
  }

  async createTab(user, tabEntry: TabEntry) {
    const parent = await this.twigsRepository.findOne({
      where: {
        id: tabEntry.parentTwigId,
      },
      relations: ['children', 'detail'],
    });

    console.log('parent', parent);

    const [twig] = await this.loadTabs(user, [tabEntry]);

    const twigs = [twig];

    if (parent.tabId) {
      const abstract = await this.arrowsService.getArrowById(user.frameId);
      if (!abstract) {
        throw new BadRequestException('Missing abstract');
      }
      
      if (parent.detailId !== twig.detailId) {
        const { arrow } = await this.arrowsService.linkArrows(user, abstract, parent.detailId, twig.detailId);

        const sourceTwigs = await this.getTwigsByAbstractIdAndDetailId(abstract.id, parent.detailId);
        const targetTwigs = await this.getTwigsByAbstractIdAndDetailId(abstract.id, twig.detailId);

        const existingTwigs = await this.getTwigsBySourceIdsAndTargetIds(
          sourceTwigs.map(twig => twig.id), 
          targetTwigs.map(twig => twig.id),
        );
        
        const sourceIdToTargetIdToTwig = existingTwigs.reduce((acc, twig) => {
          if (acc[twig.sourceId]) {
            acc[twig.sourceId][twig.targetId] = twig;
          }
          else {
            acc[twig.sourceId] = {
              [twig.targetId]: twig,
            }
          }
          return acc;
        }, {});

        let linkTwigs = [];
        sourceTwigs.forEach(sourceTwig => {
          targetTwigs.forEach(targetTwig => {
            if (
              sourceIdToTargetIdToTwig[sourceTwig.id] && 
              sourceIdToTargetIdToTwig[sourceTwig.id][targetTwig.id]
            ) return;
    
            const x = Math.round((sourceTwig.x + targetTwig.x) / 2);
            const y = Math.round((sourceTwig.y + targetTwig.y) / 2);
    
            const twig = new Twig();
            twig.sourceId = sourceTwig.id;
            twig.targetId = targetTwig.id;
            twig.userId = user.id;
            twig.abstractId = abstract.id;
            twig.detailId = arrow.id;
            twig.i = abstract.twigN + linkTwigs.length + 1;
            twig.x = x
            twig.y = y
            twig.z = abstract.twigZ + linkTwigs.length + 1;
            twig.isOpen = false;
          
            linkTwigs.push(twig);
          })
        })

        await this.arrowsService.incrementTwigN(abstract.id, linkTwigs.length + 1);
        await this.arrowsService.incrementTwigZ(abstract.id, linkTwigs.length + 1);

        linkTwigs = await this.twigsRepository.save(linkTwigs);

        twigs.push(...linkTwigs);

        if (sourceTwigs.length) {
          twigs.push(sourceTwigs[0]);
        }
        if (targetTwigs.length) {
          twigs.push(targetTwigs[0]);
        }
      }
    }

    return {
      twigs,
    };
  }

  async updateTab(user: User, twigId: string, title: string, url: string, faviconUrl: string | null) {
    let twig = await this.twigsRepository.findOne({
      where: {
        id: twigId,
      },
      relations: ['ins', 'outs']
    })
    if (!twig) {
      throw new BadRequestException('This twig does not exist');
    }
    const abstract = null //await this.arrowsService.getArrowById(user.frameId);
    const entries = await this.arrowsService.loadTabArrows(user, abstract, [{
      arrowId: v4(),
      url,
      title,
      faviconUrl,
    }]);

    if (twig.detailId === entries[0].arrowId) {
      return {
        twigs: [twig],
        deleted: [],
      };
    }
    else {
      const { arrow, } = await this.arrowsService.linkArrows(user, abstract, twig.detailId, entries[0].arrowId);

      twig.detailId = entries[0].arrowId;

      await this.twigsRepository.update({id: twigId}, {
        detailId: entries[0].arrowId,
      });

      const sourceTwigs = await this.getTwigsByAbstractIdAndDetailId(abstract.id, arrow.sourceId);
      const targetTwigs = await this.getTwigsByAbstractIdAndDetailId(abstract.id, arrow.targetId);

      const existingTwigs = await this.getTwigsBySourceIdsAndTargetIds(
        sourceTwigs.map(twig => twig.id), 
        targetTwigs.map(twig => twig.id),
      );
      
      const sourceIdToTargetIdToTwig = existingTwigs.reduce((acc, twig) => {
        if (acc[twig.sourceId]) {
          acc[twig.sourceId][twig.targetId] = twig;
        }
        else {
          acc[twig.sourceId] = {
            [twig.targetId]: twig,
          }
        }
        return acc;
      }, {});

      let twigs = [];
      sourceTwigs.forEach(sourceTwig => {
        targetTwigs.forEach(targetTwig => {
          if (
            sourceIdToTargetIdToTwig[sourceTwig.id] && 
            sourceIdToTargetIdToTwig[sourceTwig.id][targetTwig.id]
          ) return;
  
          const x = Math.round((sourceTwig.x + targetTwig.x) / 2);
          const y = Math.round((sourceTwig.y + targetTwig.y) / 2);
  
          const twig = new Twig();
          twig.sourceId = sourceTwig.id;
          twig.targetId = targetTwig.id;
          twig.userId = user.id;
          twig.abstractId = abstract.id;
          twig.detailId = arrow.id;
          twig.i = abstract.twigN + twigs.length + 1;
          twig.x = x
          twig.y = y
          twig.z = abstract.twigZ + twigs.length + 1;
          twig.isOpen = false;
        
          twigs.push(twig);
        });
      });

      twigs = await this.twigsRepository.save(twigs);

      if (sourceTwigs.length) {
        twigs.push(sourceTwigs[0]);
      }
      if (targetTwigs.length) {
        twigs.push(targetTwigs[0]);
      }

      const date = new Date();

      let deleted = [...twig.ins, ...twig.outs].map(linkTwig => {
        linkTwig.deleteDate = date;
        return linkTwig;
      });

      deleted = await this.twigsRepository.save(deleted);

      return {
        twigs: [twig, ...twigs],
        deleted,
      }
    }
  }

  async moveTab(user: User, twigId: string, groupTwigId: string, parentTwigId: string | null) {
    let tabTwig = await this.twigsRepository.findOne({
      where: {
        id: twigId
      },
      relations: ['parent', 'parent.children']
    });
    if (!tabTwig) {
      throw new BadRequestException('This tab twig does not exist');
    }

    const groupTwig = await this.twigsRepository.findOne({
      where: {
        id: groupTwigId,
      },
      relations: ['children'],
    });

    if (!groupTwig) {
      throw new BadRequestException('This group twig does not exist');
    }

    let parentTwig;
    if (parentTwigId) {
      parentTwig = await this.twigsRepository.findOne({
        where: {
          id: parentTwigId,
        },
        relations: ['children']
      });
      
      if (!parentTwig) {
        throw new BadRequestException('This parent tab twig does not exist');
      }
    }
    else {
      parentTwig = groupTwig;
    }

    // move tab
    tabTwig.parent = parentTwig;
    tabTwig.windowId = groupTwig.windowId;
    tabTwig.groupId = groupTwig.groupId;
    tabTwig = await this.twigsRepository.save(tabTwig);

    return {
      twig: tabTwig,
    }
  }

  async copyToTab(user: User, tabEntries: TabEntry[], groupEntry: GroupEntry | null) {
    let groupTwig;
    if (groupEntry) {
      [groupTwig] = await this.loadGroups(user, [groupEntry]);
    }

    const tabTwigs = await this.loadTabs(user, tabEntries);
    if (groupTwig) {
      tabTwigs.push(groupTwig);
    }

    return tabTwigs;
  }


  async removeTab(user: User, twigId: string) {
    let twig = await this.twigsRepository.findOne({
      where: {
        id: twigId,
      },
      relations: ['parent', 'parent.children', 'children', 'ins', 'outs'],
    });

    if (!twig) {
      throw new BadRequestException('This tab twig does not exist')
    }

    const date = new Date();
    twig.deleteDate = date;
    twig = await this.twigsRepository.save(twig);

    let children = twig.children
      .map((child, i) => {
        child.parent = twig.parent;
        return child;
      });

    children = await this.twigsRepository.save(children);

    let links = [];
    await [...twig.ins, ...twig.outs].reduce(async (acc, sheaf) => {
      await acc;

      const descs = await this.twigsRepository.manager.getTreeRepository(Twig)
        .findDescendants(sheaf);

      descs.forEach(desc => {
        desc.deleteDate = date;
        links.push(desc);
      })
    }, Promise.resolve());

    links = await this.twigsRepository.save(links);
    
    return {
      twig,
      children,
      links,
    }
  }

  async removeGroup(user: User, twigId: string) {
    const twig = await this.twigsRepository.findOne({
      where: {
        id: twigId,
      },
      relations: ['parent', 'parent.children']
    });
    if (!twig) {
      throw new BadRequestException('This group twig does not exist')
    }
    twig.deleteDate = new Date();
    const twig1 = await this.twigsRepository.save(twig);

    return {
      twig: twig1,
    };
  }

  async removeWindow(user: User, twigId: string) {
    const twig = await this.twigsRepository.findOne({
      where: {
        id: twigId,
      },
      relations: ['parent', 'parent.children'],
    });
    if (!twig) {
      throw new BadRequestException('This window twig does not exist')
    }
    twig.deleteDate = new Date();
    const twig1 = await  this.twigsRepository.save(twig);

    return {
      twig: twig1,
    };
  }

  async syncBookmarks(user: User, twigId: string, bookmarkEntries: BookmarkEntry[]) {
    const rootTwig = await this.getTwigById(twigId);

    const descs = await this.twigsRepository.manager.getTreeRepository(Twig)
      .createDescendantsQueryBuilder('twig', 'twigClosure', rootTwig)
      .getMany();
    
    const bookmarkTwigs = await this.loadBookmarks(user, bookmarkEntries);

    const idToTwig: IdToType<Twig> = bookmarkTwigs.reduce((acc, twig) => {
      acc[twig.id] = twig;
      return acc;
    }, {})

    const date = new Date();
    let deleted: Twig[] = descs.reduce((acc, desc) => {
      if (desc.bookmarkId && !idToTwig[desc.id]) {
        desc.deleteDate = date;
        acc.push(desc);
      }
      return acc;
    }, [])
    deleted = await this.twigsRepository.save(deleted);

    return {
      bookmarks: bookmarkTwigs,
      deleted,
    }
  }

  async loadBookmarks(user, entries: BookmarkEntry[]) {
    const abstract = await this.arrowsService.getArrowById(user.frameId);

    const parentTwigIdToTrue = entries.reduce((acc, entry) => {
      acc[entry.parentTwigId] = true;
      return acc
    }, {});

    const twigs = await this.getTwigsByIds([
      ...Object.keys(parentTwigIdToTrue),
      ...entries.map(entry => entry.twigId)
    ]);

    const idToTwig: IdToType<Twig> = twigs.reduce((acc, twig) => {
      acc[twig.id] = twig;
      return acc;
    }, {});

    const bookmarkTwigs = [];

    let entries1 = await this.arrowsService.loadBookmarkArrows(user, abstract, entries);
    entries1.sort((a, b) => a.degree < b.degree ? -1 : 1);

    let degree = entries1[0]?.degree;
    let i = 0;
    let j = 0;
    while (entries1.length) {
      const nextEntries = [];
      let twigs = [];
      entries1.forEach(entry => {
        if (entry.degree === degree) {
          const parent = idToTwig[entry.parentTwigId];
          
          let twigI;
          if (idToTwig[entry.twigId]) {
            twigI = idToTwig[entry.twigId].i;
          }
          else {
            twigI = abstract.twigN + i + 1;
            i++;
          }
          const twig = new Twig();
          twig.id = entry.twigId;
          twig.userId = user.id;
          twig.abstractId = abstract.id;
          twig.detailId = entry.arrowId;
          twig.parent = parent;
          twig.i = twigI;
          twig.x = parent.x;
          twig.y = parent.y;
          twig.z = abstract.twigZ + j + 1;
          twig.windowId = null;
          twig.groupId = null;
          twig.tabId = null;
          twig.bookmarkId = entry.bookmarkId;

          twigs.push(twig);
          j++;
        }
        else {
          nextEntries.push(entry);
        }
      });
  
      twigs = await this.twigsRepository.save(twigs);
      twigs.forEach(twig => {
        bookmarkTwigs.push(twig);
        idToTwig[twig.id] = twig;
      });
      entries1 = nextEntries;
      degree++;
    }

    await this.arrowsService.incrementTwigN(abstract.id, i + 1);
    await this.arrowsService.incrementTwigZ(abstract.id, bookmarkTwigs.length);

    return bookmarkTwigs;
  }

  async createBookmark(user: User, entry: BookmarkEntry) {
    const abstract =  null //await this.arrowsService.getArrowById(user.frameId);
    if (!abstract) {
      throw new BadRequestException('Missing abstract');
    }
    const parentTwig = await this.twigsRepository.findOne({
      where: {
        id: entry.parentTwigId,
      },
      relations: ['children'],
    });
    if (!parentTwig) {
      throw new BadRequestException('Missing parent twig');
    }
    let sheaf;
    if (entry.url) {
      sheaf = await this.sheafsService.getSheafByUrl(entry.url);
    } 
    if (!sheaf) {
      sheaf = await this.sheafsService.createSheaf(null, null, entry.url)
    }

    let arrow = await this.arrowsService.getArrowByUserIdAndUrl(user.id, entry.url);
    if (!arrow) {
      ({ arrow } = await this.arrowsService.createArrow({
        user, 
        id: entry.arrowId, 
        sourceId: null, 
        targetId: null, 
        abstract, 
        sheaf, 
        draft: null,
        title: entry.title, 
        url: entry.url,
        faviconUrl: null,
        routeName: null,
      }));
    }

    let twig = new Twig();
    twig.id = entry.twigId;
    twig.userId = user.id;
    twig.abstractId = abstract.id;
    twig.detailId = arrow.id;
    twig.parent = parentTwig;
    twig.bookmarkId = entry.bookmarkId;
    twig.i = abstract.twigN + 1;
    twig.x = parentTwig.x;
    twig.y = parentTwig.y;
    twig.z = abstract.twigZ + 1;

    twig = await this.twigsRepository.save(twig);

    await this.arrowsService.incrementTwigN(abstract.id, 1);
    await this.arrowsService.incrementTwigZ(abstract.id, 1);

    return {
      twig,
    };
  }

  async changeBookmark(user: User, bookmarkId: string, title: string, url: string | null) {
    const abstract =  null //await this.arrowsService.getArrowById(user.frameId);
    if (!abstract) {
      throw new BadRequestException('Missing abstract');
    }
    const twig = await this.twigsRepository.findOne({
      where: {
        userId: user.id,
        bookmarkId,
      },
      relations: ['detail'],
    });
    if (!twig) {
      throw new BadRequestException('Missing twig');
    }

    if (url && url !== twig.detail.url) {
      let arrow = await this.arrowsService.getArrowByUserIdAndUrl(user.id, url);
      if (!arrow) {
        let sheaf = await this.sheafsService.getSheafByUrl(url);
        if (!sheaf) {
          sheaf = await this.sheafsService.createSheaf(null, null, url);
        }
        ({ arrow } = await this.arrowsService.createArrow({
          user, 
          id: null, 
          sourceId: null,
          targetId: null, 
          abstract, 
          sheaf, 
          draft: null, 
          title, 
          url,
          faviconUrl: null,
          routeName: null,
        }));
      }
      twig.detailId = arrow.id;
    }
    else if (title !== twig.detail.title) {
      twig.detail.title = title;
      await this.arrowsService.saveArrows([twig.detail])
    }

    return this.twigsRepository.save(twig);
  }
  
  async moveBookmark(user: User, bookmarkId: string, parentBookmarkId: string) {
    let twig = await this.twigsRepository.findOne({
      where: {
        userId: user.id,
        bookmarkId,
      },
      relations: ['parent', 'parent.children'],
    });

    if (!twig) {
      throw new BadRequestException('This twig does not exist');
    }

    const parentTwig = await this.twigsRepository.findOne({
      where: {
        userId: user.id,
        bookmarkId: parentBookmarkId,
      },
      relations: ['children'],
    });

    if (!parentTwig) {
      throw new BadRequestException('This parent twig does not exist');
    }


    let prevSibs = [];
    let sibs = [];
    let dDegree = 0;
    if (parentTwig.id === twig.parent.id) {
      return {
        twig,
        prevSibs,
        sibs,
        descs: [],
      };
    }
    
    twig.parent = parentTwig;

    twig = await this.twigsRepository.save(twig);

    return {
      twig, 
      prevSibs,
      sibs,
    }
  }

  async copyToBookmark(user: User, bookmarkEntries: BookmarkEntry[]) {
    return this.loadBookmarks(user, bookmarkEntries);
  }

  async removeBookmark(user: User, bookmarkId: string) {
    const twig = await this.twigsRepository.findOne({
      where: {
        userId: user.id,
        bookmarkId,
      },
      relations: ['parent', 'parent.children'],
    });

    let twigs = await this.twigsRepository.manager.getTreeRepository(Twig)
      .findDescendants(twig);

    const date = new Date();
    twigs = twigs.map(twig => {
      twig.deleteDate = date;
      return twig;
    });

    twigs = await this.twigsRepository.save(twigs);

    return {
      twigs,
    }
  }
}
