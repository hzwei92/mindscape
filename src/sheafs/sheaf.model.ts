import { Field, Float, Int, ObjectType } from '@nestjs/graphql';
import { Arrow } from 'src/arrows/arrow.model';

@ObjectType()
export class Sheaf {
  @Field()
  id: string;

  @Field()
  routeName: string;

  @Field({nullable: true})
  url: string;
  

  @Field({nullable: true})
  sourceId: string;

  @Field(() => Sheaf, {nullable: true})
  source: Sheaf;

  @Field({nullable: true})
  targetId: string;
  
  @Field(() => Sheaf, {nullable: true})
  target: Sheaf;


  @Field(() => [Sheaf])
  ins: Sheaf[];

  @Field(() => [Sheaf])
  outs: Sheaf[];
  
  @Field()
  inCount: number;

  @Field()
  outCount: number;

  
  @Field(() => [Arrow])
  arrows: Arrow[];


  @Field(() => Int)
  weight: number;


  @Field()
  createDate: Date;
  
  @Field() 
  updateDate: Date;

  @Field({ nullable: true })
  deleteDate: Date;
}
