import { Field, ObjectType } from "@nestjs/graphql";
import { Tab } from "../tab.model";

@ObjectType()
export class RemoveTabResult {
  @Field(() => Tab)
  tab: Tab;

  @Field(() => [Tab])
  sibs: Tab[];
}