import { EditorState, SelectionState } from 'draft-js';

export default function moveSelectionToEnd(editorState: EditorState,) {
  const content = editorState.getCurrentContent();
  const blockMap = content.getBlockMap();
  const key = blockMap.last().getKey();
  const length = blockMap.last().getLength();
  const selection = new SelectionState({
    anchorKey: key,
    anchorOffset: length,
    focusKey: key,
    focusOffset: length,
  });
  return EditorState.forceSelection(editorState, selection);
}