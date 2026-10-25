// Define o estilo aplicado a um trecho específico de texto (Span)
export interface TextStyle {
  readonly bold?: boolean;
  readonly italic?: boolean;
  readonly underline?: boolean;
  readonly fontFamily?: string;
  readonly fontSize?: string;
}

// Menor unidade inline do texto: um trecho contínuo com a mesma formatação
export interface InlineSpan {
  readonly id: string;
  readonly text: string;
  readonly style: TextStyle;
}

// Tipos de blocos suportados no modelo
export type BlockType = 
  | 'paragraph' 
  | 'heading-1' 
  | 'heading-2' 
  | 'heading-3' 
  | 'blockquote';

// Bloco que agrupa uma sequência de InlineSpans
export interface BlockNode {
  readonly id: string;
  readonly type: BlockType;
  readonly spans: readonly InlineSpan[];
}

// Representação de uma posição exata no texto
export interface TextCursorPosition {
  readonly blockId: string;
  readonly spanIndex: number;
  readonly offset: number;
}

export interface DocumentModel {
  readonly title: string;
  readonly blocks: readonly BlockNode[];
}