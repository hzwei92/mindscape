import { ObjectType, Field, Int } from '@nestjs/graphql';
import { User } from 'src/users/user.model';
import { Arrow } from 'src/arrows/arrow.model';

@ObjectType()
export class Twig {
  @Field()
  id: string;

  @Field({ nullable: true })
  sourceId: string;

  @Field(() => Twig, { nullable: true })
  source: Twig;

  @Field({ nullable: true })
  targetId: string;

  @Field(() => Twig, { nullable: true })
  target: Twig;

  @Field()
  userId: string;

  @Field(() => User)
  user: User;
  
  @Field()
  abstractId: string;

  @Field(() => Arrow)
  abstract: Arrow;

  @Field()
  detailId: string;
  
  @Field(() => Arrow)
  detail: Arrow;

  @Field()
  isRoot: boolean;

  @Field(() => Int)
  i: number;

  @Field(() => Int)
  x: number;

  @Field(() => Int)
  y: number;

  @Field(() => Int)
  z: number;

  @Field()
  isOpen: boolean;

  @Field(() => Arrow, {nullable: true})
  parent: Twig;

  @Field(() => [Twig])
  children: Twig[];

  @Field(() => Int, { nullable: true })
  windowId: number;

  @Field(() => Int, { nullable: true })
  groupId: number;

  @Field(() => Int, { nullable: true })
  tabId: number;

  @Field({ nullable: true })
  bookmarkId: string;

  @Field()
  createDate: Date;

  @Field()
  updateDate: Date;

  @Field({ nullable: true })
  deleteDate: Date;
}






