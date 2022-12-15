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
import { checkPermit } from 'src/utils';
import { SheafsService } from 'src/sheafs/sheafs.service';
import { v4 } from 'uuid';
import { UsersService } from 'src/users/users.service';
import { TwigPosAdjustment } from './dto/twig-pos-adjustment';
import { AlertsService } from 'src/alerts/alerts.service';

@Injectable()
export class TwigsService {
  constructor (
    @InjectRepository(Twig) 
    private readonly twigsRepository: Repository<Twig>,
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
    @Inject(forwardRef(() => ArrowsService))
    private readonly arrowsService: ArrowsService,
    private readonly sheafsService: SheafsService,
    private readonly rolesService: RolesService,
    private readonly alertsService: AlertsService,
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
    if (parentTwig.abstract.userId === user.id || checkPermit(parentTwig.abstract.canPost, role?.type)) {
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

    const { 
      arrow: post, 
      vote: postVote,
    } = await this.arrowsService.createArrow({
      user,
      id: postId,
      sourceId: null,
      targetId: null,
      abstract: parentTwig.abstract,
      sheaf: postSheaf,
      draft,
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

    parentTwig.abstract.twigN += 1;
    parentTwig.abstract.twigZ += 1;

    const linkSheaf = await this.sheafsService.createSheaf(parentTwig.detail.sheafId, post.sheafId, null);

    const { 
      arrow: link,
      vote: linkVote,
    } = await this.arrowsService.createArrow({
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
      i: parentTwig.abstract.twigN + 1,
      x: Math.round((parentTwig.x + x) / 2),
      y: Math.round((parentTwig.y + y) / 2),
      z: parentTwig.abstract.twigZ + 1,
      isOpen: false,
    });

    await this.arrowsService.incrementTwigN(parentTwig.abstractId, 2);
    await this.arrowsService.incrementTwigZ(parentTwig.abstractId, 2);
    const abstract = await this.arrowsService.getArrowById(parentTwig.abstractId);

    const source = await this.arrowsService.getArrowById(parentTwig.detailId);

    const alerts = await this.alertsService.linkAlert(user, parentTwig.detail, link, post, abstract);
    
    return {
      abstract,
      source,
      link: linkTwig,
      linkVote,
      target: postTwig,
      targetArrow: post,
      targetVote: postVote,
      role: role1,
      alerts,
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

    let abstract = await this.arrowsService.getArrowById(parentTwig.abstractId);

    let role = await this.rolesService.getRoleByUserIdAndArrowId(user.id, parentTwig.abstractId);
    let role1 = null;
    if (abstract.userId === user.id || checkPermit(parentTwig.abstract.canPost, role?.type)) {
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

    const { 
      arrow: link,
      vote: linkVote,
    } = await this.arrowsService.createArrow({
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
    abstract = await this.arrowsService.getArrowById(parentTwig.abstractId);

    const source = await this.arrowsService.getArrowById(parentTwig.detailId);

    const alerts = await this.alertsService.linkAlert(user, parentTwig.detail, link, existingArrow, abstract);

    return {
      abstract,
      source,
      link: linkTwig,
      linkArrow: link,
      linkVote,
      target: postTwig,
      role: role1,
      alerts,
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
    if (twig.userId === user.id || checkPermit(abstract.canEditLayout, role?.type)) {
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
        abstract,
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
    if (checkPermit(abstract.canEditLayout, role?.type)) {
      if (!role) {
        role = await this.rolesService.createRole(user, abstract, RoleType.OTHER);
        role1 = role;
      }
    }
    else {
      throw new BadRequestException('Insufficient privileges');
    }
    
    let descs = [];
    let baseZ = 0;
    if (twig.id === abstract.rootTwigId) {
      descs = await this.getTwigsByAbstractId(abstract.id);
    }
    else {
      descs = await this.twigsRepository.manager.getTreeRepository(Twig).findDescendants(twig);
      baseZ = abstract.twigZ;
    }

    const twigs0 = descs
      .sort((a, b) => b.z - a.z)
      .map((t, i) => {
        if (t.id === twigId) {
          t.z = baseZ + descs.length + 1;
        }
        else {
          t.z = baseZ + i + 1;
        }
        return t;
      });
    const twigs1 = await this.twigsRepository.save(twigs0);

    const twigZ = baseZ + descs.length + 1;

    await this.arrowsService.incrementTwigZ(abstract.id, twigZ - abstract.twigZ);

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
      sheaf = await this.sheafsService.incrementWeight(sheaf, 1);
    }
    else {
      sheaf = await this.sheafsService.createSheaf(source.sheafId, target.sheafId, null);
    }
    const { arrow, vote } = await this.arrowsService.createArrow({
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

    await this.arrowsService.incrementTwigN(abstract.id, twigs.length + 1);
    await this.arrowsService.incrementTwigZ(abstract.id, twigs.length + 1);

    const abstract1 = await this.arrowsService.getArrowById(abstract.id);

    const alerts = await this.alertsService.linkAlert(user, source1, arrow, target1, abstract1);

    return {
      abstract: abstract1,
      twigs,
      arrow, 
      vote,
      source: source1,
      target: target1,
      role: role1,
      alerts,
    }
  }

  async moveTwig(user: User, twigId: string, x: number, y: number, adjustment: TwigPosAdjustment[]) {
    const twig = await this.getTwigById(twigId);
    if (!twig) {
      throw new BadRequestException('This twig does not exist');
    }
    const abstract = await this.arrowsService.getArrowById(twig.abstractId);

    let role = await this.rolesService.getRoleByUserIdAndArrowId(user.id, abstract.id);
    let role1 = null;
    if (twig.userId === user.id || checkPermit(abstract.canEditLayout, role?.type)) {
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
    
    const adjMap = adjustment.reduce((acc, adj) => {
      acc[adj.twigId] = adj;
      return acc;
    }, {});

    let adjs = await this.twigsRepository.find({
      where: {
        id: In(adjustment.map(adj => adj.twigId)),
      },
    });

    adjs = adjs.map(adj => {
      adj.x = adjMap[adj.id].x;
      adj.y = adjMap[adj.id].y;
      return adj;
    });

    twigs1 = await this.twigsRepository.save([...descs, ...adjs]);

    return {
      twigs: twigs1,
      role: role1,
    }
  }

  async graftTwig(user: User, twigId: string, parentTwigId: string, x: number, y: number) {
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
    if (twig.userId === user.id || checkPermit(abstract.canEditLayout, role?.type)) {
      if (!role) {
        role = await this.rolesService.createRole(user, abstract, RoleType.OTHER);
        role1 = role;
      }
    }
    else {
      throw new BadRequestException('Insufficient privileges');
    }

    twig.parent = parentTwig;
    twig = await this.twigsRepository.save(twig);


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
    descs = await this.twigsRepository.save(descs);

    return {
      twig,
      descs,
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
    if (checkPermit(abstract.canEditLayout, role?.type)) {
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
    if (twig.userId === user?.id || checkPermit(abstract.canEditLayout, role?.type)) {
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
}