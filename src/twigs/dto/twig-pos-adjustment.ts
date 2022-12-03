import { Field, InputType, Int } from "@nestjs/graphql";

@InputType()
export class TwigPosAdjustment {
  @Field()
  twigId: string;

  @Field(() => Int)
  x: number;

  @Field(() => Int)
  y: number;
}
