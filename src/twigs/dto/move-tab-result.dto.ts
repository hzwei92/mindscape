import { Field, ObjectType } from "@nestjs/graphql";
import { Twig } from "../twig.model";

@ObjectType()
export class MoveTabResult {
  @Field(() => Twig)
  twig: Twig;

  @Field(() => [Twig])
  prevSibs: Twig[];

  @Field(() => [Twig])
  sibs: Twig[];

  @Field(() => [Twig])
  descs: Twig[];
}
