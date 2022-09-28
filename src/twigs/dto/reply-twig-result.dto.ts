import { Field, ObjectType } from "@nestjs/graphql";
import { Arrow } from "src/arrows/arrow.model";
import { Role } from "src/roles/role.model";
import { User } from "src/users/user.model";
import { Twig } from "../twig.model";

@ObjectType()
export class ReplyTwigResult {
  @Field(() => User) 
  user: User;
  
  @Field(() => Arrow)
  abstract: Arrow;

  @Field(() => Arrow)
  source: Arrow;
  
  @Field(() => Twig)
  link: Twig;

  @Field(() => Twig)
  target: Twig;

  @Field(() => Role, { nullable: true })
  role: Role;
}
