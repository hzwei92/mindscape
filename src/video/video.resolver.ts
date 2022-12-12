import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { CurrentUser, GqlAuthGuard } from 'src/auth/gql-auth.guard';
import { JoinRoomResult } from './dto/join-room-result.dto';
import { User as UserEntity } from 'src/users/user.entity';
import { VideoService } from './video.service';
@Resolver()
export class VideoResolver {
  constructor(
    private readonly videoService: VideoService,
  ) {}

  @UseGuards(GqlAuthGuard)
  @Mutation(() => JoinRoomResult, {name: 'joinRoom', nullable: true })
  async joinRoom(
    @CurrentUser() user: UserEntity,
    @Args('roomName') roomName: string,
  ) {
    await this.videoService.findOrCreateRoom(roomName);

    const token = this.videoService.getAccessToken(roomName);

    return {
      token,
    };
  }

}
