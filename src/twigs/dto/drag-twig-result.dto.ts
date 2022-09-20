import { Field, Int, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class DragTwigResult {
  @Field()
  twigId: string;

  @Field(() => Int)
  dx: number;

  @Field(() => Int)
  dy: number;
}
