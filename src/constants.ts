export const PRIVATE_ARROW_DRAFT = JSON.stringify({
  blocks: [
    {
      key: 'privatePost',
      text: '<private>',
      type: 'unstyled',
      depth: 0,
      inlineStyleRanges: [],
      entityRanges: [],
      data: {},
    }
  ],
  entityMap: {},
});

export const PRIVATE_ARROW_TEXT = '<private>';

export const REMOVED_ARROW_DRAFT = JSON.stringify({
  blocks: [
    {
      key: 'removedPost',
      text: '<deleted>',
      type: 'unstyled',
      depth: 0,
      inlineStyleRanges: [],
      entityRanges: [],
      data: {},
    }
  ],
  entityMap: {},
});

export const REMOVED_ARROW_TEXT = '<deleted>';


export const START_ARROW_ID = '7402c3dd-36fd-4045-9dad-1d53ea987ad6';
export const START_ARROW_TITLE = '👁‍🗨 MINDSCAPE.PUB'
export const START_ARROW_ROUTNAME = 'mindscape'


export const START_ARROW_1_ID = '319a26c6-8b38-46a4-86d2-48f215fc44ba';
export const START_ARROW_2_ID = '4ca52a91-81e6-4232-ac72-51fffa166d35';

export const uuidRegexExp = /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i;

export const LOAD_LIMIT = 20;

export const ACTIVE_TIME = 60 * 1000;
export const IDLE_TIME = 2 * 60 * 1000;


export const VIEW_RADIUS = 30000;

export const TWIG_WIDTH = 360;
export const TWIG_HEIGHT = 140;