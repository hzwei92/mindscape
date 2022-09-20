import { Test, TestingModule } from '@nestjs/testing';
import { LeadsResolver } from './leads.resolver';

describe('LeadsResolver', () => {
  let resolver: LeadsResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LeadsResolver],
    }).compile();

    resolver = module.get<LeadsResolver>(LeadsResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
