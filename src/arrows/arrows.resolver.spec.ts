import { Test, TestingModule } from '@nestjs/testing';
import { ArrowsResolver } from './arrows.resolver';

describe('ArrowsResolver', () => {
  let resolver: ArrowsResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ArrowsResolver],
    }).compile();

    resolver = module.get<ArrowsResolver>(ArrowsResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
