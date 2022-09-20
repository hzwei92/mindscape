import { Field, ObjectType } from "@nestjs/graphql";
import { Twig } from "../twig.model";

@ObjectType()
export class SyncBookmarksResult {
  @Field(() => [Twig])
  bookmarks: Twig[];

  @Field(() => [Twig])
  deleted: Twig[];
}
