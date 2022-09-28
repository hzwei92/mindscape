import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ArrowsService } from 'src/arrows/arrows.service';
import { findDefaultWeight } from 'src/utils';
import { In, Repository } from 'typeorm';
import { Sheaf } from './sheaf.entity';
import { v4 } from 'uuid';

@Injectable()
export class SheafsService {
  constructor(
    @InjectRepository(Sheaf)
    private readonly sheafsRepository: Repository<Sheaf>,
    @Inject(forwardRef(() => ArrowsService))
    private readonly arrowsService: ArrowsService,
  ) {}

  async getSheafById(id: string) {
    return this.sheafsRepository.findOne({
      where: {
        id,
      },
    });
  }

  async getSheafByUrl(url: string) {
    return this.sheafsRepository.findOne({
      where: {
        url,
      }
    });
  }

  async getSheafsByUrls(urls: string[]) {
    return this.sheafsRepository.find({
      where: {
        url: In(urls),
      },
    });
  }

  async getSheafBySourceIdAndTargetId(sourceId: string, targetId: string) {
    return this.sheafsRepository.findOne({
      where: {
        sourceId,
        targetId,
      }
    });
  }

  async createSheaf(sourceId: string | null, targetId: string | null, url: string | null) {
    await this.incrementOutCount(sourceId, 1);
    await this.incrementInCount(targetId, 1);

    const sheaf = new Sheaf();
    sheaf.id = v4();
    sheaf.sourceId = sourceId;
    sheaf.targetId = targetId;
    sheaf.routeName = sheaf.id;
    sheaf.url = url
    return this.sheafsRepository.save(sheaf);
  }

  async saveSheafs(sheafs: Sheaf[]) {
    return this.sheafsRepository.save(sheafs);
  }

  async incrementWeight(sheaf: Sheaf, weight: number) {
    sheaf.weight = sheaf.weight + weight;

    return this.sheafsRepository.save(sheaf);
  }

  async incrementInCount(id: string, value: number) {
    await this.sheafsRepository.increment({ id }, 'inCount', value);
  }

  async incrementOutCount(id: string, value: number) {
    await this.sheafsRepository.increment({ id }, 'outCount', value);
  }
}
