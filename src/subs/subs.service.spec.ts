import { Test, TestingModule } from '@nestjs/testing';
import { SubsService } from './subs.service';

describe('SubsService', () => {
  let service: SubsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SubsService],
    }).compile();

    service = module.get<SubsService>(SubsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
