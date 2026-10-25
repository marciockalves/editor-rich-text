/**
 * Estilos aplicáveis a um trecho de texto (span).
 */
export interface SpanStyle {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  code?: boolean;
  color?: string;
}

/**
 * Trecho de texto com formatação específica dentro de um bloco.
 */
export interface Span {
  id: string;
  text: string;
  style: SpanStyle;
}

/**
 * Tipos possíveis de blocos de conteúdo no documento.
 */
export type BlockType = 
  | 'heading-1'
  | 'heading-2'
  | 'heading-3'
  | 'paragraph'
  | 'bullet-list-item'
  | 'numbered-list-item'
  | 'quote';

/**
 * Bloco de conteúdo dentro do documento.
 */
export interface Block {
  id: string;
  type: BlockType;
  spans: Span[];
}

/**
 * Estrutura principal do documento.
 */
export interface Document {
  id: string;
  title: string;
  blocks: Block[];
}