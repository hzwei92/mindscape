import { ComponentType } from 'react';
import { EditorPlugin } from '@draft-js-plugins/editor';
import { AtomicBlockUtils, EditorState, RichUtils } from 'draft-js';
import IframelyComponent, { IframelyComponentProps } from './IframelyComponent';

export const types = {
  ATOMIC: 'atomic',
  LINK: 'link',
}

function addEmbed(
  editorState: EditorState,
  { url }: { url: string }
): EditorState {
  if (RichUtils.getCurrentBlockType(editorState) === types.ATOMIC) {
    return editorState;
  }
  const contentState = editorState.getCurrentContent();
  const contentStateWithEntity = contentState.createEntity(types.LINK, 'IMMUTABLE',{ 
    url,
  });

  const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
  return AtomicBlockUtils.insertAtomicBlock(editorState, entityKey, url);
}

export interface EmbedPluginConfig {
  decorator?(
    component: ComponentType<IframelyComponentProps>
  ): ComponentType<IframelyComponentProps>;
}

export interface EmbedPlugin extends EditorPlugin {
  addEmbed: typeof addEmbed;
  types: typeof types;
}

export default function createEmbedPlugin(
  config: EmbedPluginConfig = {}
): EmbedPlugin {
  return {
    blockRendererFn: (block, { getEditorState }) => {
      if (block.getType() === types.ATOMIC) {
        const contentState = getEditorState().getCurrentContent();
        const entityKey = block.getEntityAt(0);
        if (!entityKey) return null;
        const entity = contentState.getEntity(entityKey);
        const type = entity.getType();
        const { url } = entity.getData();
        if (type === types.LINK) {
          return {
            component: IframelyComponent,
            editable: false,
            props: {
              url,
            },
          };
        }
      }

      return null;
    },
    addEmbed,
    types,
  };
}