import type { BlockNode } from '../types/textHierarchy';
import { handleEnterKey, mergeBlockWithPrevious } from './blockOperations';

export interface ShortcutContext {
  readonly blocks: readonly BlockNode[];
  readonly blockId: string;
  readonly e: React.KeyboardEvent<Element>;
  readonly setBlocks: (blocks: readonly BlockNode[]) => void;
}

type ShortcutAction = (context: ShortcutContext) => void;

/**
 * Extrai o spanId e o offset reais a partir da seleção do DOM.
 */
function extractCursorContext(blockId: string, blocks: readonly BlockNode[]) {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return null;

  const range = selection.getRangeAt(0);
  const offset = range.startOffset;

  const targetNode = range.startContainer;
  const elementNode = targetNode.nodeType === Node.TEXT_NODE 
    ? targetNode.parentElement 
    : (targetNode as HTMLElement);

  const spanElement = elementNode?.closest('[data-span-id]');
  const spanId = spanElement?.getAttribute('data-span-id');

  const currentBlock = blocks.find((b) => b.id === blockId);
  if (!currentBlock) return null;

  const spanIndex = spanId 
    ? currentBlock.spans.findIndex((s) => s.id === spanId)
    : 0;

  return {
    offset,
    spanIndex: spanIndex !== -1 ? spanIndex : 0,
  };
}

/**
 * Handler específico para a tecla Enter e Shift + Enter
 */
const handleEnterShortcut: ShortcutAction = ({ blocks, blockId, e, setBlocks }) => {
  e.preventDefault();

  const cursorContext = extractCursorContext(blockId, blocks);
  if (!cursorContext) return;

  const result = handleEnterKey(
    blocks,
    blockId,
    cursorContext.spanIndex,
    cursorContext.offset,
    e.shiftKey
  );

  console.log("=====> %o", result.updatedBlocks);

  setBlocks(result.updatedBlocks);
};

/**
 * Handler específico para a tecla Backspace (mantido para estabilidade)
 */
const handleBackspaceShortcut: ShortcutAction = ({ blocks, blockId, e, setBlocks }) => {
  const blockIndex = blocks.findIndex((b) => b.id === blockId);
  const selection = window.getSelection();
  const offset = selection && selection.rangeCount > 0 ? selection.getRangeAt(0).startOffset : 0;

  if (offset === 0 && blockIndex > 0) {
    e.preventDefault();
    const result = mergeBlockWithPrevious(blocks, blockIndex);
    setBlocks(result.updatedBlocks);
  }
};

/**
 * Dicionário de atalhos (Record Pattern)
 * Facilita a adição de novas teclas de atalho no futuro sem bagunçar a casca.
 */
const shortcutDictionary: Record<string, ShortcutAction> = {
  'Enter': handleEnterShortcut,
  'Backspace': handleBackspaceShortcut,
};

/**
 * Despachante principal de atalhos
 */
export function dispatchShortcut(context: ShortcutContext): void {
  const action = shortcutDictionary[context.e.key];
  if (action) {
    action(context);
  }
}