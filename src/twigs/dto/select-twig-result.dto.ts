import { Field, ObjectType } from "@nestjs/graphql";
import { Arrow } from "src/arrows/arrow.model";
import { Role } from "src/roles/role.model";
import { Twig } from "../twig.model";

@ObjectType()
export class SelectTwigResult {
  @Field(() => Arrow)
  abstract: Arrow;

  @Field(() => [Twig])
  twigs: Twig[];

  @Field(() => Role, { nullable: true })
  role: Role;
}
