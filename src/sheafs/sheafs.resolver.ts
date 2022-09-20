import { Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { Arrow } from 'src/arrows/arrow.model';
import { ArrowsService } from 'src/arrows/arrows.service';
import { CurrentUser } from 'src/auth/gql-auth.guard';
import { User as UserEntity } from 'src/users/user.entity';
import { Sheaf } from './sheaf.model';

@Resolver(Sheaf)
export class SheafsResolver {
  constructor(
    private readonly arrowsService: ArrowsService,
  ) {}

  @ResolveField(() => [Arrow], {name: 'links'})
  async getTwigDetail(
    @CurrentUser() user: UserEntity,
    @Parent() sheaf: Sheaf,
  ) {
    return this.arrowsService.getArrowsBySheafId(sheaf.id);
  }
}
