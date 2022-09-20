import { Field, ObjectType } from "@nestjs/graphql";
import { Role } from "src/roles/role.model";
import { Twig } from "../twig.model";

@ObjectType() 
export class MoveTwigResult {
  @Field(() => [Twig])
  twigs: Twig[];
  
  @Field(() => Role, { nullable: true })
  role: Role;
}
