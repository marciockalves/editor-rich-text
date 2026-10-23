export interface InlineStyles {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  color?: string;
  backgroundColor?: string; // Cor de destaque (highlighter)
  fontFamily?: string;
  fontSize?: string; // ex: '16px'
}


export interface InlineSpan {
  id: string;
  text: string;
  styles?: InlineStyles;
}

export type BlockType = 
  | 'paragraph' 
  | 'heading-1' 
  | 'heading-2' 
  | 'heading-3' 
  | 'blockquote' 
  | 'bullet-list' 
  | 'numbered-list';


export type Alignment = 'left' | 'center' | 'right' | 'justify';


export interface BlockNode {
  id: string;
  type: BlockType;
  alignment: Alignment;
  lineSpacing: number; // ex: 1.15, 1.5, 2.0
  indent: number; // Nível de recuo (ex: 0, 1, 2)
  children: InlineSpan[];
}

export interface PageSettings {
  marginTop: number;    // em mm (padrão: 20mm)
  marginBottom: number; // em mm
  marginLeft: number;   // em mm
  marginRight: number;  // em mm
}

export interface DocumentAST {
  body?: any;
  id: string;
  title: string;
  pageSettings: PageSettings;
  blocks: BlockNode[];
}