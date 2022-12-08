import { User } from '../user/user';

export type Lead = {
  id: string;
  leaderId: string;
  leader: User;
  followerId: string;
  follower: User;
  createDate: string;
  deleteDate: string | null;
  __typename: string;
}