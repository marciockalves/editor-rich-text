import React, { useState } from 'react';
import rawDocument from '../core/templates/defaultDocument.json';
import type { BlockNode, DocumentModel } from '../core/types/textHierarchy';
import { getBlockConfig } from '../core/domain/blockStyleMapper';
import { dispatchShortcut } from '../core/domain/keyboardHandlers';

const defaultDocument: DocumentModel = rawDocument as DocumentModel;

export const Editor: React.FC = () => {
  const [blocks, setBlocks] = useState<readonly BlockNode[]>(defaultDocument.blocks);

  const handleKeyDown = (e: React.KeyboardEvent<Element>, blockId: string) => {
    dispatchShortcut({
      blocks,
      blockId,
      e,
      setBlocks,
    });
  };

  return (
    <div className="max-w-3xl mx-auto p-8 bg-white shadow-sm rounded-lg min-h-[500px] my-8 font-sans">
      <h1 className="text-xl font-bold text-gray-700 mb-6 border-b pb-2">
        {defaultDocument.title}
      </h1>

      <div className="space-y-2">
        {blocks.map((block) => {
          const config = getBlockConfig(block.type);
          const Component = config.tag as React.ElementType;

          return (
            <Component
              key={block.id}
              data-block-id={block.id}
              className={`${config.defaultClassName} whitespace-pre-wrap outline-none focus:ring-1 focus:ring-blue-200 rounded p-1`}
              contentEditable={true}
              suppressContentEditableWarning={true}
              onKeyDown={(e: React.KeyboardEvent<HTMLElement>) => handleKeyDown(e, block.id)}
            >
              {block.spans.map((span) => (
                <span
                  key={span.id}
                  data-span-id={span.id}
                  style={{
                    fontWeight: span.style.bold ? 'bold' : 'normal',
                    fontStyle: span.style.italic ? 'italic' : 'normal',
                    textDecoration: span.style.underline ? 'underline' : 'none',
                  }}
                >
                  {span.text}
                </span>
              ))}
            </Component>
          );
        })}
      </div>
    </div>
  );
};