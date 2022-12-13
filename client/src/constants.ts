export const PROD_SERVER_URI = 'https://www.mindscape.pub';
export const PROD_WS_SERVER_URI = 'ws://www.mindscape.pub';

export const DEV_SERVER_URI = 'http://localhost:9000';
export const DEV_WS_SERVER_URI = 'ws://localhost:9000';

export const EMAIL_REGEX = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/

export const GOOGLE_CLIENT_ID = '453561312616-3go403qbepjm03b5g95h15tpcag6fvb0.apps.googleusercontent.com';

export const REFRESH_ACCESS_TOKEN_TIME = 8 * 60 * 1000;

export const MAPBOX_ACCESS_TOKEN = 'pk.eyJ1IjoiamFtbnRjZyIsImEiOiJja3ZqMGk0bmRiZms0MnB0OXNpb2NneGo0In0.nDqGANM1cIwpqVLBl506Vw';

export const DEFAULT_COLOR = '#9575cd';

export const ALGOLIA_APP_ID = 'DTKWUTA4VI';
export const ALGOLIA_APP_KEY = '1160d150f2a313136f146c5107c129a6';
export const ALGOLIA_INDEX_NAME = process.env.NODE_ENV === 'production'
  ? 'prod_JAMN'
  : 'dev_JAMN';

export const MOBILE_WIDTH = 420;

export const LOAD_LIMIT = 20;


export const IFRAMELY_API_KEY ='bc4275a2a8daa296c09f9243cf940f0a'

export const MAX_Z_INDEX = 2000000000;

export const TWIG_WIDTH = 220;

export const MENU_WIDTH = 500;
export const MENU_MIN_WIDTH = 400;

export const SPACE_BAR_HEIGHT = 56;

export const VIEW_RADIUS = 10000;

export const NOT_FOUND = 'NOT_FOUND';

export const CLOSED_LINK_TWIG_DIAMETER = 30;

export const ROLES_MENU_WIDTH = 300;

export const APP_BAR_X = 50;

export const ACCESS_TOKEN = 'ACCESS_TOKEN';
export const REFRESH_TOKEN = 'REFRESH_TOKEN';


export const OFF_WHITE = '#ededed';


export const SPACE_PANEL_WIDTH = 280;

export const INPUT_WIDTH = 300;


export const ACTIVE_TIME = 10 * 1000;

export const NOTCH_SIZE = 44;

export const TAB_HEIGHT = 42;

export const QUEST_WIDTH = 280;

export const SCROLL_SENSITIVITY = 0.1;

export const ItemTypes = {
  TAB: 'tab',
}