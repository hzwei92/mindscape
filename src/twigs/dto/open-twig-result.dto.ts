import { Field, ObjectType } from "@nestjs/graphql";
import { Role } from "src/roles/role.model";
import { Twig } from "../twig.model";

@ObjectType() 
export class OpenTwigResult {
  @Field(() => Twig)
  twig: Twig;
  
  @Field(() => Role, { nullable: true })
  role: Role;
}