import { Field, ObjectType } from "@nestjs/graphql";
import { Twig } from "../twig.model";

@ObjectType()
export class RemoveTabResult1 {
  @Field(() => Twig)
  twig: Twig;

  @Field(() => [Twig])
  children: Twig[];

  @Field(() => [Twig])
  descs: Twig[];

  @Field(() => [Twig])
  sibs: Twig[];

  @Field(() => [Twig])
  links: Twig[];
}