import { Test, TestingModule } from '@nestjs/testing';
import { SheafsService } from './sheafs.service';

describe('SheafsService', () => {
  let service: SheafsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SheafsService],
    }).compile();

    service = module.get<SheafsService>(SheafsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
