import { Field, ObjectType } from "@nestjs/graphql";
import { User } from "src/users/user.model";
import { Tab } from "../tab.model";

@ObjectType()
export class CreateGraphTabResult {
  @Field(() => User)
  user: User;

  @Field(() => [Tab])
  tabs: Tab[];
}