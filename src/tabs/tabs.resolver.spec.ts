import { Test, TestingModule } from '@nestjs/testing';
import { TabsResolver } from './tabs.resolver';

describe('TabsResolver', () => {
  let resolver: TabsResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TabsResolver],
    }).compile();

    resolver = module.get<TabsResolver>(TabsResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
