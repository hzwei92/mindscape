import { Test, TestingModule } from '@nestjs/testing';
import { VideoResolver } from './video.resolver';

describe('VideoResolver', () => {
  let resolver: VideoResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VideoResolver],
    }).compile();

    resolver = module.get<VideoResolver>(VideoResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
