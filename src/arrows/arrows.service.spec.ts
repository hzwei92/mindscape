import { Test, TestingModule } from '@nestjs/testing';
import { ArrowsService } from './arrows.service';

describe('ArrowsService', () => {
  let service: ArrowsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ArrowsService],
    }).compile();

    service = module.get<ArrowsService>(ArrowsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
