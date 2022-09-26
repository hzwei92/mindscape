import { Field, ObjectType } from "@nestjs/graphql";
import { Arrow } from "src/arrows/arrow.model";
import { Role } from "src/roles/role.model";
import { Twig } from "../twig.model";

@ObjectType()
export class RemoveTwigResult {
  @Field(() => [Twig])
  twigs: Twig[];

  @Field(() => Role, { nullable: true })
  role: Role;
}
