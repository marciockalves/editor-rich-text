import { useState } from 'react';
import type { DocumentAST, BlockNode, Alignment, InlineStyles, BlockType } from '../core/types/document';

export function useDocument(initialDoc: DocumentAST) {
  const [document, setDocument] = useState<DocumentAST>(initialDoc);
  const [activeBlockId, setActiveBlockId] = useState<string | null>(initialDoc.blocks[0]?.id || null);
  const [cursorOffset, setCursorOffset] = useState<number | null>(null);

  // Carrega um novo documento AST completo (Importação)
  const loadDocument = (newDoc: DocumentAST) => {
    setDocument(newDoc);
    if (newDoc.blocks.length > 0) {
      setActiveBlockId(newDoc.blocks[0].id);
      setCursorOffset(0);
    }
  };

  const updateBlockText = (blockId: string, newText: string) => {
    setDocument((prev) => ({
      ...prev,
      blocks: prev.blocks.map((block) => {
        if (block.id === blockId) {
          return {
            ...block,
            children: [{ id: `s-${Date.now()}`, text: newText, styles: block.children[0]?.styles }],
          };
        }
        return block;
      }),
    }));
  };

  const setBlockAlignment = (alignment: Alignment) => {
    if (!activeBlockId) return;
    setDocument((prev) => ({
      ...prev,
      blocks: prev.blocks.map((block) => 
        block.id === activeBlockId ? { ...block, alignment } : block
      ),
    }));
  };

  const setBlockType = (type: BlockType) => {
    if (!activeBlockId) return;
    setDocument((prev) => ({
      ...prev,
      blocks: prev.blocks.map((block) => 
        block.id === activeBlockId ? { ...block, type } : block
      ),
    }));
  };

  const setBlockFontFamily = (fontFamily: string) => {
    if (!activeBlockId) return;
    setDocument((prev) => ({
      ...prev,
      blocks: prev.blocks.map((block) => {
        if (block.id === activeBlockId) {
          const currentStyles = block.children[0]?.styles || {};
          const updatedStyles: InlineStyles = { ...currentStyles, fontFamily };
          return {
            ...block,
            children: block.children.map(child => ({ ...child, styles: updatedStyles })),
          };
        }
        return block;
      }),
    }));
  };

  const setBlockSpacing = (lineSpacing: number) => {
    if (!activeBlockId) return;
    setDocument((prev) => ({
      ...prev,
      blocks: prev.blocks.map((block) => 
        block.id === activeBlockId ? { ...block, lineSpacing } : block
      ),
    }));
  };

  const setBlockIndent = (delta: number) => {
    if (!activeBlockId) return;
    setDocument((prev) => ({
      ...prev,
      blocks: prev.blocks.map((block) => {
        if (block.id === activeBlockId) {
          const newIndent = Math.max(0, block.indent + delta);
          return { ...block, indent: newIndent };
        }
        return block;
      }),
    }));
  };

  const toggleInlineStyle = (styleKey: keyof InlineStyles) => {
    if (!activeBlockId) return;
    setDocument((prev) => ({
      ...prev,
      blocks: prev.blocks.map((block) => {
        if (block.id === activeBlockId) {
          const currentStyles = block.children[0]?.styles || {};
          const updatedStyles: InlineStyles = {
            ...currentStyles,
            [styleKey]: !currentStyles[styleKey],
          };
          return {
            ...block,
            children: block.children.map(child => ({
              ...child,
              styles: updatedStyles,
            })),
          };
        }
        return block;
      }),
    }));
  };

  const addBlockAfter = (blockId: string) => {
    const newBlockId = `b-${Date.now()}`;
    setDocument((prev) => {
      const index = prev.blocks.findIndex((b) => b.id === blockId);
      if (index === -1) return prev;

      const newBlock: BlockNode = {
        id: newBlockId,
        type: 'paragraph',
        alignment: 'left',
        lineSpacing: 1.5,
        indent: 0,
        children: [{ id: `s-${Date.now()}`, text: '' }],
      };

      const updatedBlocks = [...prev.blocks];
      updatedBlocks.splice(index + 1, 0, newBlock);

      return {
        ...prev,
        blocks: updatedBlocks,
      };
    });
    setActiveBlockId(newBlockId);
    setCursorOffset(0);
  };

  const removeBlock = (blockId: string) => {
    setDocument((prev) => {
      if (prev.blocks.length <= 1) return prev;
      const index = prev.blocks.findIndex((b) => b.id === blockId);
      const updatedBlocks = prev.blocks.filter((b) => b.id !== blockId);
      
      if (index > 0) {
        setActiveBlockId(updatedBlocks[index - 1].id);
        const prevText = updatedBlocks[index - 1].children.map(c => c.text).join('');
        setCursorOffset(prevText.length);
      }

      return {
        ...prev,
        blocks: updatedBlocks,
      };
    });
  };

  const mergeWithPrevious = (blockId: string, liveText: string) => {
    setDocument((prev) => {
      const index = prev.blocks.findIndex((b) => b.id === blockId);
      if (index <= 0) return prev;

      const prevBlock = prev.blocks[index - 1];
      const prevText = prevBlock.children.map(c => c.text).join('');
      const combinedText = prevText + liveText;

      const updatedBlocks = [...prev.blocks];
      updatedBlocks[index - 1] = {
        ...prevBlock,
        children: [{ id: `s-${Date.now()}`, text: combinedText, styles: prevBlock.children[0]?.styles }],
      };
      updatedBlocks.splice(index, 1);

      setActiveBlockId(prevBlock.id);
      setCursorOffset(prevText.length);

      return {
        ...prev,
        blocks: updatedBlocks,
      };
    });
  };

  const navigateBlock = (blockId: string, direction: 'up' | 'down') => {
    const index = document.blocks.findIndex((b) => b.id === blockId);
    if (index === -1) return;

    if (direction === 'up' && index > 0) {
      setActiveBlockId(document.blocks[index - 1].id);
      setCursorOffset(null);
    } else if (direction === 'down' && index < document.blocks.length - 1) {
      setActiveBlockId(document.blocks[index + 1].id);
      setCursorOffset(null);
    }
  };

  return {
    document,
    activeBlockId,
    cursorOffset,
    setActiveBlockId,
    loadDocument,
    updateBlockText,
    setBlockAlignment,
    setBlockType,
    setBlockFontFamily,
    setBlockSpacing,
    setBlockIndent,
    toggleInlineStyle,
    addBlockAfter,
    removeBlock,
    mergeWithPrevious,
    navigateBlock,
  };
}