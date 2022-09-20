import { Field, ObjectType } from "@nestjs/graphql";
import { Twig } from "../twig.model";

@ObjectType()
export class CreateTabResult {
  @Field(() => [Twig])
  twigs: Twig[];

  @Field(() => [Twig])
  sibs: Twig[];
}
