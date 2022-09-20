import { Role } from '../role/role';
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
  abstract: Arrow;

  twigs: Arrow[];
  twigN: number;
  twigZ: number;
  rootTwigId: string | null;

  canEdit: string;
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

  clicks: number;
  tokens: number;
  weight: number;

  isOpaque: boolean;

  activeDate: string | null;
  saveDate: string | null;
  commitDate: string | null;
  removeDate: string | null;
  createDate: string | null;
  updateDate: string | null;
  deleteDate: string | null;

  __typename: string;
}

export const createArrow = (params: {
  id: string,
  user: User,
  draft: string | null,
  title: string | null,
  url: string | null,
  faviconUrl: string | null,
  abstract: Arrow,
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

    abstractId: abstract.id,
    abstract,
    twigs: [],
    twigN: 0,
    twigZ: 0,
    rootTwigId: null,

    canEdit: 'OTHER',
    canPost: 'OTHER',
    canTalk: 'OTHER',
    canHear: 'OTHER',
    canView: 'OTHER',

    roles: [],
    // subs: [],
    votes: [],

    lng: null,
    lat: null,
    city: null,
    state: null,
    country: null,

    clicks: 1,
    tokens: 0,
    weight: 1,

    isOpaque: false,

    activeDate: date,
    saveDate: date,
    commitDate: null,
    removeDate: null,
    createDate: date,
    updateDate: date,
    deleteDate: null,

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