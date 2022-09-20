import { Field, ObjectType } from "@nestjs/graphql";
import { Twig } from "../twig.model";

@ObjectType()
export class TabResult {
  @Field(() => Twig)
  twig: Twig;

  @Field(() => [Twig])
  sibs: Twig[];
}
