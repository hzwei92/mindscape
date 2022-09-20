import { Test, TestingModule } from '@nestjs/testing';
import { SubsResolver } from './subs.resolver';

describe('SubsResolver', () => {
  let resolver: SubsResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SubsResolver],
    }).compile();

    resolver = module.get<SubsResolver>(SubsResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
