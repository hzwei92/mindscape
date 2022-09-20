import { Arrow } from "../arrow/arrow";
import { SpaceType } from "../space/space";
import { User } from "../user/user";

export type Twig = {
  id: string;
  sourceId: string | null;
  source: Twig | null;
  targetId: string | null;
  target: Twig | null;
  userId: string;
  user: User
  abstractId: string;
  abstract: Arrow;
  detailId: string;
  detail: Arrow;
  parent: Twig;
  children: Twig[];
  i: number;
  x: number;
  y: number;
  z: number;
  isRoot: boolean;
  bookmarkId: string | null,
  windowId: number | null;
  groupId: number | null;
  tabId: number | null;
  isOpen: boolean;
  createDate: string | null;
  updateDate: string | null;
  deleteDate: string | null;
  __typename: string;
}


export const createTwig = (params: {
  id: string,
  source: Twig | null,
  target: Twig | null,
  user: User, 
  abstract: Arrow, 
  detail: Arrow, 
  parent: Twig, 
  x: number,
  y: number,
  isOpen: boolean,
  bookmarkId: string | null,
  windowId: number | null,
  groupId: number | null,
  tabId: number | null,
}) => {
  const {
    id,
    source,
    target,
    user,
    abstract,
    detail,
    parent,
    x,
    y,
    isOpen,
    bookmarkId,
    windowId,
    groupId,
    tabId,
  } = params;
  const twig: Twig = {
    id: id,
    sourceId: source?.id || null,
    source: source,
    targetId: target?.id || null,
    target: target,
    userId: user.id,
    user: user,
    abstractId: abstract.id,
    abstract: abstract,
    detailId: detail.id,
    detail: detail,
    parent: parent,
    children: [],
    isRoot: false,
    i: abstract.twigN + 1,
    x: x,
    y: y,
    z: abstract.twigZ + 1,
    tabId: tabId,
    groupId: groupId,
    windowId: windowId,
    bookmarkId: bookmarkId,
    isOpen: isOpen,
    createDate: null,
    updateDate: null,
    deleteDate: null,
    __typename: 'Twig'
  };
  return twig;
}


export type CopyingTwigType = {
  space: SpaceType;
  twigId: string;
  parentTwigId: string;
}