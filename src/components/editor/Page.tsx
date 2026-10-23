import React from 'react';
import type { BlockNode, PageSettings } from '../../core/types/document';
import { BlockRenderer } from './BlockRenderer';

interface PageProps {
  pageNumber: number;
  blocks: BlockNode[];
  settings: PageSettings;
  activeBlockId: string | null;
  cursorOffset: number | null;
  onFocusBlock: (id: string) => void;
  onUpdateText: (id: string, text: string) => void;
  onAddBlock: (id: string) => void;
  onRemoveBlock: (id: string) => void;
  onMergeWithPrevious: (id: string, liveText: string) => void;
  onNavigate: (id: string, direction: 'up' | 'down') => void;
}

export const Page: React.FC<PageProps> = ({
  pageNumber,
  blocks,
  settings,
  activeBlockId,
  cursorOffset,
  onFocusBlock,
  onUpdateText,
  onAddBlock,
  onRemoveBlock,
  onMergeWithPrevious,
  onNavigate,
}) => {
  return (
    <div
      className="bg-white page-shadow relative mx-auto mb-8 transition-all duration-200 ease-in-out"
      style={{
        width: '210mm',
        minHeight: '297mm',
        paddingTop: `${settings.marginTop}mm`,
        paddingBottom: `${settings.marginBottom}mm`,
        paddingLeft: `${settings.marginLeft}mm`,
        paddingRight: `${settings.marginRight}mm`,
      }}
    >
      <div className="absolute top-3 right-4 text-xs text-gray-400 select-none print:hidden">
        Página {pageNumber}
      </div>

      <div className="w-full h-full outline-none">
        {blocks.map((block) => (
          <BlockRenderer
            key={block.id}
            block={block}
            isActive={block.id === activeBlockId}
            cursorOffset={cursorOffset}
            onFocus={onFocusBlock}
            onUpdateText={onUpdateText}
            onAddBlock={onAddBlock}
            onRemoveBlock={onRemoveBlock}
            onMergeWithPrevious={onMergeWithPrevious}
            onNavigate={onNavigate}
          />
        ))}
      </div>
    </div>
  );
};