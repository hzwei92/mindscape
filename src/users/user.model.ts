import { ObjectType, Field, Int, Float } from '@nestjs/graphql';

@ObjectType()
export class User {
  @Field()
  id: string;
  
  @Field()
  name: string;

  @Field()
  lowercaseName: string;

  @Field()
  routeName: string;

  @Field({ nullable: true })
  email: string;

  @Field()
  description: string;

  @Field()
  color: string;

  @Field()
  palette: string;

  @Field(() => Float)
  balance: number;

  @Field(() => Int)
  saveN: number;

  @Field(() => Int)
  moveN: number;

  @Field(() => Int)
  replyN: number;

  @Field(() => Int)
  linkN: number;

  @Field(() => Float, { nullable: true })
  mapLng: number;

  @Field(() => Float, { nullable: true })
  mapLat: number;

  @Field(() => Float, { nullable: true })
  mapZoom: number;

  @Field()
  isRegisteredWithGoogle: boolean;
  
  @Field({ nullable: true })
  verifyEmailDate: Date;

  @Field()
  isAdmin: boolean;
  
  @Field()
  isReserve: boolean;
  
  @Field()
  activeDate: Date;

  @Field({ nullable: true })
  checkAlertsDate: Date;

  @Field({ nullable: true })
  loadFeedDate: Date;

  @Field({ nullable: true })
  loadInsDate: Date;

  @Field({ nullable: true })
  loadOutsDate: Date;
  
  @Field({ nullable: true })
  viewInfoDate: Date;

  @Field({ nullable: true })
  togglePaletteDate: Date;

  @Field({nullable: true})
  createGraphDate: Date;

  @Field({ nullable: true })
  saveArrowDate: Date;

  @Field({ nullable: true })
  firstReplyDate: Date;

  @Field({ nullable: true })
  openPostDate: Date;

  @Field({ nullable: true })
  openLinkDate: Date;

  @Field({ nullable: true })
  openArrowDate: Date;
  
  @Field({ nullable: true })
  moveTwigDate: Date;

  @Field({ nullable: true })
  graftTwigDate: Date;

  @Field({nullable: true})
  navigateGraphDate: Date;

  @Field()
  createDate: Date;

  @Field()
  updateDate: Date;

  @Field({nullable: true})
  deleteDate: Date;
}

@ObjectType()
export class UserAvatar {
  @Field()
  id: string;

  @Field()
  abstractId: string;
  
  @Field()
  name: string;

  @Field()
  color: string;

  @Field(() => Int, { nullable: true })
  x: number;

  @Field(() => Int, { nullable: true })
  y: number;

  @Field()
  activeDate: Date;
}