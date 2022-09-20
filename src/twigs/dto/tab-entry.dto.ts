import { Field, InputType, Int } from "@nestjs/graphql";


@InputType()
export class TabEntry {
  @Field()
  arrowId: string;

  @Field()
  twigId: string;

  @Field()
  parentTwigId: string;
  
  @Field(() => Int)
  windowId: number;

  @Field(() => Int)
  groupId: number;

  @Field(() => Int)
  tabId: number;

  @Field(() => Int)
  degree: number;

  @Field(() => Int)
  rank: number;

  @Field()
  title: string;

  @Field()
  url: string;

  @Field({ nullable: true })
  faviconUrl: string;

  @Field()
  color: string;
}


export type Entry = {
  arrowId: string;
  title: string;
  url: string;
  faviconUrl: string | null;
}