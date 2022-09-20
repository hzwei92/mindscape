import { Test, TestingModule } from '@nestjs/testing';
import { SheafsResolver } from './sheafs.resolver';

describe('SheafsResolver', () => {
  let resolver: SheafsResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SheafsResolver],
    }).compile();

    resolver = module.get<SheafsResolver>(SheafsResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
