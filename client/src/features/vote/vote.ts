import { Arrow } from '../arrow/arrow';
import { User } from '../user/user';

export type Vote = {
  id: string;
  userId: string;
  user: User;
  arrowId: string;
  arrow: Arrow;
  clicks: number;
  tokens: number;
  weight: number;
  createDate: Date;
  deleteDate: Date | null;
  __typename: string;
}