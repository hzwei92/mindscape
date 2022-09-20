import { User } from '../user/user';

export type Lead = {
  id: string;
  leaderId: string;
  leader: User;
  followerId: string;
  follower: User;
  createDate: Date;
  deleteDate: Date | null;
  __typename: string;
}