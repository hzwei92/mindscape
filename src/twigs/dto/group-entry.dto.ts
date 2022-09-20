import { Field, InputType, Int } from "@nestjs/graphql";

@InputType()
export class GroupEntry {
  @Field()
  arrowId: string;

  @Field()
  twigId: string;

  @Field()
  parentTwigId: string;

  @Field(() => Int)
  windowId: number;

  @Field(() => Int)
  groupId: number;

  @Field(() => Int)
  rank: number;

  @Field()
  color: string;
}
