import { Test, TestingModule } from '@nestjs/testing';
import { TwigsResolver } from './twigs.resolver';

describe('TwigsResolver', () => {
  let resolver: TwigsResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TwigsResolver],
    }).compile();

    resolver = module.get<TwigsResolver>(TwigsResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
