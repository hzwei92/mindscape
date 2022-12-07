export type Entry = {
  id: string;
  userId: string;
  parentId: string | null;
  arrowId: string;
  showIns: boolean;
  showOuts: boolean;
  inIds: string[];
  outIds: string[];
  sourceId: string | null;
  targetId: string | null;
  shouldGetLinks: boolean;
  isDeleted: boolean;
  bonusText?: string[];
}
