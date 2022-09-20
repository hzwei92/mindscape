import { Field, ObjectType } from "@nestjs/graphql";
import { Role } from "src/roles/role.model";
import { Twig } from "../twig.model";

@ObjectType()
export class CopyTwigResult {
  @Field(() => [Twig])
  twigs: Twig[];

  @Field(() => [Twig])
  sibs: Twig[];

  @Field(() => Role, {nullable: true})
  role: Role;
}
