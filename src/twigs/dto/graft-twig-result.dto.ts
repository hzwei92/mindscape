import { Field, ObjectType } from "@nestjs/graphql";
import { Role } from "src/roles/role.model";
import { Twig } from "../twig.model";

@ObjectType()
export class GraftTwigResult {
  @Field(() => Twig)
  twig: Twig;
  
  @Field(() => [Twig])
  descs: Twig[];

  @Field(() => Role, {nullable: true})
  role: Role;
}
