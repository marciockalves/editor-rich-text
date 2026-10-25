import type { BlockNode, InlineSpan, BlockType } from '../types/textHierarchy';
import { insertSoftBreakInSpan, splitInlineSpan } from './spanOperations';

export interface BlockSplitResult {
  readonly currentBlock: BlockNode;
  readonly newBlock: BlockNode;
}

export interface BlockMergeResult {
  readonly updatedBlocks: readonly BlockNode[];
  readonly targetBlockIdToFocus: string;
  readonly cursorOffset: number;
}

export interface EnterHandlerResult {
  readonly updatedBlocks: readonly BlockNode[];
  readonly targetBlockIdToFocus: string;
  readonly cursorOffset: number;
}

/**
 * Divide um bloco em dois a partir de um span e offset específicos.
 * Utiliza Guard Clauses para garantir integridade e evitar exceções.
 */
export function splitBlock(
  block: BlockNode, 
  targetSpanIndex: number, 
  offset: number, 
  newBlockType: BlockType = 'paragraph'
): BlockSplitResult {
  // Guard 1: Índice do span inválido ou fora do limite
  if (targetSpanIndex < 0 || targetSpanIndex >= block.spans.length) {
    return {
      currentBlock: block,
      newBlock: {
        id: `b-${Date.now()}`,
        type: newBlockType,
        spans: [{ id: `s-${Date.now()}`, text: '', style: {} }],
      },
    };
  }

  const targetSpan = block.spans[targetSpanIndex];
  const { left, right } = splitInlineSpan(targetSpan, offset);

  const spansBefore = block.spans.slice(0, targetSpanIndex);
  const spansAfter = block.spans.slice(targetSpanIndex + 1);

  const currentBlockSpans: readonly InlineSpan[] = [...spansBefore, left];
  const newBlockSpans: readonly InlineSpan[] = [right, ...spansAfter];

  return {
    currentBlock: {
      ...block,
      spans: currentBlockSpans.length > 0 ? currentBlockSpans : [{ id: `s-${Date.now()}-empty`, text: '', style: {} }],
    },
    newBlock: {
      id: `b-new-${Date.now()}`,
      type: newBlockType,
      spans: newBlockSpans.length > 0 ? newBlockSpans : [{ id: `s-${Date.now()}-empty`, text: '', style: {} }],
    },
  };
}

/**
 * Funde o bloco na posição index com o bloco imediatamente anterior.
 * Utiliza Guard Clauses para validações iniciais.
 */
export function mergeBlockWithPrevious(
  blocks: readonly BlockNode[], 
  currentIndex: number
): BlockMergeResult {
  // Guard 1: Se for o primeiro bloco, não há anterior para fundir
  if (currentIndex <= 0 || currentIndex >= blocks.length) {
    return {
      updatedBlocks: blocks,
      targetBlockIdToFocus: blocks[currentIndex]?.id ?? '',
      cursorOffset: 0,
    };
  }

  const currentBlock = blocks[currentIndex];
  const previousBlock = blocks[currentIndex - 1];

  // Calcula o offset onde o cursor deve ficar (fim do último span do bloco anterior)
  const previousLastSpan = previousBlock.spans[previousBlock.spans.length - 1];
  const cursorOffset = previousLastSpan ? previousLastSpan.text.length : 0;

  // Concatena os spans do bloco atual ao final do bloco anterior
  const mergedSpans: readonly InlineSpan[] = [
    ...previousBlock.spans,
    ...currentBlock.spans,
  ];

  const updatedPreviousBlock: BlockNode = {
    ...previousBlock,
    spans: mergedSpans,
  };

  // Reconstrói a lista ignorando o bloco atual e atualizando o anterior
  const updatedBlocks = blocks
    .map((b, idx) => (idx === currentIndex - 1 ? updatedPreviousBlock : b))
    .filter((_, idx) => idx !== currentIndex);

  return {
    updatedBlocks,
    targetBlockIdToFocus: previousBlock.id,
    cursorOffset,
  };
}

export function handleEnterKey(
  blocks: readonly BlockNode[],
  activeBlockId: string,
  targetSpanIndex: number,
  offset: number,
  isShiftPressed: boolean
): EnterHandlerResult {
  const blockIndex = blocks.findIndex((b) => b.id === activeBlockId);

  // Guard Clause: Bloco ativo não encontrado
  if (blockIndex === -1) {
    return { updatedBlocks: blocks, targetBlockIdToFocus: activeBlockId, cursorOffset: offset };
  }

  const currentBlock = blocks[blockIndex];

  // Estratégia para Shift + Enter (Quebra Suave / Soft Break)
  const handleSoftBreak = (): EnterHandlerResult => {
    const targetSpan = currentBlock.spans[targetSpanIndex];
    if (!targetSpan) {
      return { updatedBlocks: blocks, targetBlockIdToFocus: activeBlockId, cursorOffset: offset };
    }

    const updatedSpan = insertSoftBreakInSpan(targetSpan, offset);
    const updatedSpans = currentBlock.spans.map((s, idx) => (idx === targetSpanIndex ? updatedSpan : s));
    const updatedBlock = { ...currentBlock, spans: updatedSpans };
    
    const updatedBlocks = blocks.map((b, idx) => (idx === blockIndex ? updatedBlock : b));

    return {
      updatedBlocks,
      targetBlockIdToFocus: activeBlockId,
      cursorOffset: offset + 1, // Move o cursor para logo após o \n
    };
  };

  // Estratégia para Enter Simples (Quebra de Bloco / Hard Break)
  const handleHardBreak = (): EnterHandlerResult => {
    const { currentBlock: newCurrent, newBlock } = splitBlock(currentBlock, targetSpanIndex, offset);
    
    const updatedBlocks = [
      ...blocks.slice(0, blockIndex),
      newCurrent,
      newBlock,
      ...blocks.slice(blockIndex + 1),
    ];

    return {
      updatedBlocks,
      targetBlockIdToFocus: newBlock.id,
      cursorOffset: 0, // Cursor vai para o início do novo bloco
    };
  };

  // Lookup Table substituindo completamente o if/else e switch/case
  const breakStrategies: Record<string, () => EnterHandlerResult> = {
    'true': handleSoftBreak,
    'false': handleHardBreak,
  };

  // Executa a estratégia mapeada com base no booleano convertido em string
  const executeStrategy = breakStrategies[String(isShiftPressed)] ?? handleHardBreak;
  return executeStrategy();
}