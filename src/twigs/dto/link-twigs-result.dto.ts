import { ObjectType, Field } from "@nestjs/graphql";
import { Arrow } from "src/arrows/arrow.model";
import { Role } from "src/roles/role.model";
import { User } from "src/users/user.model";
import { Twig } from "../twig.model";

@ObjectType()
export class LinkTwigsResult {
  @Field(() => User)
  user: User;
  
  @Field(() => Arrow)
  abstract: Arrow;

  @Field(() => [Twig])
  twigs: Twig[];

  @Field(() => Arrow)
  source: Arrow;

  @Field(() => Arrow)
  target: Arrow;

  @Field(() => Role, {nullable: true})
  role: Role;
}
