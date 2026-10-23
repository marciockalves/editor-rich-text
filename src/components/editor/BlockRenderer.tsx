import React, { useRef, useEffect } from 'react';
import type { BlockNode } from '../../core/types/document';

interface BlockRendererProps {
  block: BlockNode;
  isActive: boolean;
  cursorOffset: number | null;
  onFocus: (id: string) => void;
  onUpdateText: (id: string, text: string) => void;
  onAddBlock: (id: string) => void;
  onRemoveBlock: (id: string) => void;
  onMergeWithPrevious: (id: string, liveText: string) => void;
  onNavigate: (id: string, direction: 'up' | 'down') => void;
}

export const BlockRenderer: React.FC<BlockRendererProps> = ({
  block,
  isActive,
  cursorOffset,
  onFocus,
  onUpdateText,
  onAddBlock,
  onRemoveBlock,
  onMergeWithPrevious,
  onNavigate,
}) => {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isActive && contentRef.current) {
      const el = contentRef.current;
      if (document.activeElement !== el) {
        el.focus();
      }

      const range = document.createRange();
      const sel = window.getSelection();

      try {
        if (el.firstChild) {
          const targetOffset = cursorOffset !== null ? Math.min(cursorOffset, el.textContent?.length || 0) : el.textContent?.length || 0;
          range.setStart(el.firstChild, targetOffset);
          range.collapse(true);
        } else {
          range.selectNodeContents(el);
          range.collapse(false);
        }
        sel?.removeAllRanges();
        sel?.addRange(range);
      } catch {
        range.selectNodeContents(el);
        range.collapse(false);
        sel?.removeAllRanges();
        sel?.addRange(range);
      }
    }
  }, [isActive, cursorOffset]);

  useEffect(() => {
    if (contentRef.current && document.activeElement !== contentRef.current) {
      const currentText = block.children.map((c) => c.text).join('');
      if (contentRef.current.innerText !== currentText) {
        contentRef.current.innerText = currentText;
      }
    }
  }, [block]);

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    const newText = e.currentTarget.innerText;
    onUpdateText(block.id, newText);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const selection = window.getSelection();
    const isCollapsed = selection?.isCollapsed;
    const anchorOffset = selection?.anchorOffset ?? 0;
    const textLength = contentRef.current?.innerText.length ?? 0;

    if (e.key === 'Enter') {
      e.preventDefault();
      onAddBlock(block.id);
    } else if (e.key === 'Backspace') {
      if (contentRef.current?.innerText === '') {
        e.preventDefault();
        onRemoveBlock(block.id);
      } else if (isCollapsed && anchorOffset === 0) {
        e.preventDefault();
        const liveText = contentRef.current?.innerText || '';
        onMergeWithPrevious(block.id, liveText);
      }
    } else if (e.key === 'ArrowUp') {
      if (isCollapsed && anchorOffset === 0) {
        e.preventDefault();
        onNavigate(block.id, 'up');
      }
    } else if (e.key === 'ArrowDown') {
      if (isCollapsed && anchorOffset === textLength) {
        e.preventDefault();
        onNavigate(block.id, 'down');
      }
    }
  };

  const alignmentClass = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
    justify: 'text-justify',
  }[block.alignment];

  // Lê os estilos salvos no AST e aplica no CSS
  const firstSpanStyles = block.children[0]?.styles || {};
  const inlineStyles: React.CSSProperties = {
    lineHeight: block.lineSpacing,
    paddingLeft: block.indent > 0 ? `${block.indent * 20}px` : undefined,
    fontWeight: firstSpanStyles.bold ? 'bold' : 'normal',
    fontStyle: firstSpanStyles.italic ? 'italic' : 'normal',
    textDecoration: firstSpanStyles.underline ? 'underline' : 'none',
    fontFamily: firstSpanStyles.fontFamily || 'inherit',
  };

  const renderEditableContent = () => (
    <div
      ref={contentRef}
      contentEditable
      suppressContentEditableWarning
      onFocus={() => onFocus(block.id)}
      onInput={handleInput}
      onKeyDown={handleKeyDown}
      style={inlineStyles}
      className="outline-none min-h-[1.5rem] whitespace-pre-wrap break-words"
    />
  );

  switch (block.type) {
    case 'heading-1':
      return <h1 className={`text-3xl font-bold my-3 ${alignmentClass}`}>{renderEditableContent()}</h1>;
    case 'heading-2':
      return <h2 className={`text-2xl font-semibold my-2.5 ${alignmentClass}`}>{renderEditableContent()}</h2>;
    case 'heading-3':
      return <h3 className={`text-xl font-medium my-2 ${alignmentClass}`}>{renderEditableContent()}</h3>;
    case 'blockquote':
      return <blockquote className={`border-l-4 border-blue-500 pl-4 py-1 my-3 text-gray-600 italic bg-gray-50 ${alignmentClass}`}>{renderEditableContent()}</blockquote>;
    case 'bullet-list':
      return <li className={`list-disc list-inside my-1 ${alignmentClass}`}>{renderEditableContent()}</li>;
    case 'numbered-list':
      return <li className={`list-decimal list-inside my-1 ${alignmentClass}`}>{renderEditableContent()}</li>;
    case 'paragraph':
    default:
      return <p className={`my-2 text-gray-800 ${alignmentClass}`}>{renderEditableContent()}</p>;
  }
};