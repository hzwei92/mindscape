import { Role, RoleType } from '../role/role';
import { Sheaf } from '../sheaf/sheaf';
import type { User } from '../user/user';
import { Vote } from '../vote/vote';
// import type { Vote } from '../vote/vote';
// import type { Sub } from '../sub/sub';

export type Arrow = {
  id: string;
  routeName: string;
  draft: string | null;
  text: string ;
  title: string | null;
  url: string | null;
  faviconUrl: string | null;
  color: string;

  userId: string;
  user: User;

  sourceId: string | null;
  source: Arrow | null;
  targetId: string | null;
  target: Arrow | null;

  sheafId: string | null;
  sheaf: Sheaf | null;

  ins: Arrow[];
  outs: Arrow[];
  inCount: number;
  outCount: number;

  abstractId: string;
  abstract: Arrow | null;

  abstractI: number | null;

  twigs: Arrow[];
  twigN: number;
  twigZ: number;
  rootTwigId: string | null;

  canAssignMemberRole: string;
  canEditLayout: string;
  canPost: string;
  canTalk: string;
  canHear: string;
  canView: string;

  roles: Role[];
  // subs: Sub[];
  votes: Vote[];

  lng: number | null;
  lat: number | null;
  city: string | null;
  state: string | null;
  country: string | null;

  weight: number;

  isOpaque: boolean;

  activeDate: string | null;
  saveDate: string | null;
  commitDate: string | null;
  removeDate: string | null;
  createDate: string | null;
  updateDate: string | null;
  deleteDate: string | null;

  currentUserRole: Role | null;

  __typename: string;
}

export const createArrow = (params: {
  id: string,
  user: User,
  draft: string | null,
  title: string | null,
  url: string | null,
  faviconUrl: string | null,
  abstract: Arrow | null,
  sheaf: Sheaf | null,
  source: Arrow | null,
  target: Arrow | null,
}) => {
  const {
    id,
    user,
    draft,
    title,
    url,
    faviconUrl,
    abstract,
    sheaf,
    source,
    target,
  } = params;

  const date = new Date().toISOString();
  const arrow: Arrow = {
    id,
    routeName: id,
    draft,
    text: '',
    title,
    url,
    faviconUrl,
    color: user.color,

    userId: user.id,
    user,

    sourceId: source?.id || null,
    source: source,
    targetId: target?.id || null,
    target: target,

    sheafId: sheaf?.id || null,
    sheaf,

    ins: [],
    outs: [],
    inCount: 0,
    outCount: 0,

    abstractId: abstract?.id || id,
    abstract: null,
    abstractI: null,

    twigs: [],
    twigN: 0,
    twigZ: 0,
    rootTwigId: null,

    canAssignMemberRole: RoleType.ADMIN,
    canEditLayout: RoleType.MEMBER,
    canPost: RoleType.SUBSCRIBER,
    canTalk: RoleType.MEMBER,
    canHear: RoleType.SUBSCRIBER,
    canView: RoleType.OTHER,

    roles: [],
    // subs: [],
    votes: [],

    lng: null,
    lat: null,
    city: null,
    state: null,
    country: null,

    weight: 1,

    isOpaque: false,

    activeDate: date,
    saveDate: date,
    commitDate: null,
    removeDate: null,
    createDate: date,
    updateDate: date,
    deleteDate: null,

    currentUserRole: null,

    __typename: 'Arrow'
  };
  return arrow
}

export type ArrowInstance = {
  id: string;
  arrowId: string;
  isNewlySaved: boolean;
  shouldRefreshDraft: boolean;
};