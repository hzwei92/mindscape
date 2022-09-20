import { Field, InputType, Int } from "@nestjs/graphql";

@InputType()
export class WindowEntry {
  @Field()
  arrowId: string;

  @Field()
  twigId: string;

  @Field()
  parentTwigId: string;
  
  @Field(() => Int)
  windowId: number;

  @Field(() => Int)
  rank: number;
}
