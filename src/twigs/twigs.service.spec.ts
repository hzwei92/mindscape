import { Test, TestingModule } from '@nestjs/testing';
import { TwigsService } from './twigs.service';

describe('TwigsService', () => {
  let service: TwigsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TwigsService],
    }).compile();

    service = module.get<TwigsService>(TwigsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
