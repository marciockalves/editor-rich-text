import type { BlockType } from '../types/textHierarchy';

export interface BlockConfig {
  readonly tag: string;
  readonly defaultClassName: string;
}

// Tabela de busca (Lookup Table) substituindo inteiramente o switch/case
export const BLOCK_CONFIG_MAP: Record<BlockType, BlockConfig> = {
  'paragraph': {
    tag: 'p',
    defaultClassName: 'text-base text-gray-800 leading-relaxed my-2',
  },
  'heading-1': {
    tag: 'h1',
    defaultClassName: 'text-2xl font-bold text-gray-900 my-4',
  },
  'heading-2': {
    tag: 'h2',
    defaultClassName: 'text-xl font-semibold text-gray-800 my-3',
  },
  'heading-3': {
    tag: 'h3',
    defaultClassName: 'text-lg font-medium text-gray-800 my-2',
  },
  'blockquote': {
    tag: 'blockquote',
    defaultClassName: 'border-l-4 border-blue-500 pl-4 italic text-gray-600 my-3',
  },
};

/**
 * Obtém a configuração do bloco com fallback seguro via Guard Clause
 */
export function getBlockConfig(type: BlockType): BlockConfig {
  const config = BLOCK_CONFIG_MAP[type];
  
  // Guard Clause para tipo inexistente
  if (!config) {
    return BLOCK_CONFIG_MAP['paragraph'];
  }

  return config;
}