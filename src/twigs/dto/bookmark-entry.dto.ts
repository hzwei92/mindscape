import { Field, InputType, Int } from "@nestjs/graphql";

@InputType()
export class BookmarkEntry {
  @Field()
  arrowId: string;

  @Field()
  twigId: string;

  @Field()
  parentTwigId: string;

  @Field()
  bookmarkId: string;

  @Field(() => Int)
  degree: number;

  @Field(() => Int)
  rank: number;

  @Field()
  title: string;

  @Field({ nullable: true })
  url: string;

  @Field({ nullable: true })
  faviconUrl: string;
}
