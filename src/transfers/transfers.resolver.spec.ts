import { Test, TestingModule } from '@nestjs/testing';
import { TransfersResolver } from './transfers.resolver';

describe('TransfersResolver', () => {
  let resolver: TransfersResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TransfersResolver],
    }).compile();

    resolver = module.get<TransfersResolver>(TransfersResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
