import { Field, ObjectType } from "@nestjs/graphql";
import { Twig } from "../twig.model";

@ObjectType()
export class RemoveBookmarkResult {
  @Field(() => [Twig])
  twigs: Twig[];

  @Field(() => [Twig])
  sibs: Twig[];
}