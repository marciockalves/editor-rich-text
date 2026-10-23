import React, { useRef } from 'react';
import { 
  Bold, 
  Italic, 
  Underline, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  AlignJustify, 
  Type,
  Indent,
  Outdent,
  Download,
  Upload
} from 'lucide-react';
import type { Alignment, InlineStyles, BlockType, DocumentAST } from '../../core/types/document';

interface ToolbarProps {
  onAlignmentChange: (alignment: Alignment) => void;
  onStyleToggle: (style: keyof InlineStyles) => void;
  onFontChange: (font: string) => void;
  onTypeChange: (type: BlockType) => void;
  onSpacingChange: (spacing: number) => void;
  onIndentChange: (delta: number) => void;
  onExportJSON: () => void;
  onImportJSON: (importedDoc: DocumentAST) => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({ 
  onAlignmentChange, 
  onStyleToggle, 
  onFontChange, 
  onTypeChange,
  onSpacingChange,
  onIndentChange,
  onExportJSON,
  onImportJSON
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const jsonContent = JSON.parse(event.target?.result as string);
        if (jsonContent && jsonContent.blocks) {
          onImportJSON(jsonContent as DocumentAST);
        } else {
          alert('Arquivo JSON inválido. A estrutura do documento AST não foi reconhecida.');
        }
      } catch (err) {
        alert('Erro ao ler o arquivo JSON.');
      }
    };
    reader.readAsText(file);
    // Limpa a seleção do input para permitir carregar o mesmo arquivo novamente se necessário
    e.target.value = '';
  };

  return (
    <div className="bg-white border border-gray-300 rounded-lg shadow-sm px-4 py-2 mb-6 flex flex-wrap items-center justify-between gap-3 sticky top-4 z-10 max-w-[210mm] w-full mx-auto">
      <div className="flex flex-wrap items-center gap-3">
        {/* Seletor de Tipo de Parágrafo */}
        <div className="flex items-center gap-1 border-r border-gray-200 pr-3">
          <select 
            onChange={(e) => onTypeChange(e.target.value as BlockType)}
            className="text-sm bg-gray-50 border border-gray-200 rounded px-2 py-1 outline-none text-gray-700 cursor-pointer"
          >
            <option value="paragraph">Corpo de Texto</option>
            <option value="heading-1">Título 1</option>
            <option value="heading-2">Título 2</option>
            <option value="heading-3">Título 3</option>
            <option value="blockquote">Citação</option>
            <option value="bullet-list">Lista com Marcadores</option>
            <option value="numbered-list">Lista Numerada</option>
          </select>
        </div>

        {/* Seletor de Fontes */}
        <div className="flex items-center gap-1 border-r border-gray-200 pr-3">
          <Type className="w-4 h-4 text-gray-500" />
          <select 
            onChange={(e) => onFontChange(e.target.value)}
            className="text-sm bg-gray-50 border border-gray-200 rounded px-2 py-1 outline-none text-gray-700 cursor-pointer"
          >
            <option value="Inter">Inter</option>
            <option value="Arial">Arial</option>
            <option value="Times New Roman">Times New Roman</option>
            <option value="Courier New">Courier New</option>
          </select>
        </div>

        {/* Grupo de Estilos Inline */}
        <div className="flex items-center gap-1 border-r border-gray-200 pr-3">
          <button 
            type="button"
            onClick={() => onStyleToggle('bold')}
            title="Negrito"
            className="p-1.5 hover:bg-gray-100 rounded text-gray-700 transition-colors cursor-pointer"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button 
            type="button"
            onClick={() => onStyleToggle('italic')}
            title="Itálico"
            className="p-1.5 hover:bg-gray-100 rounded text-gray-700 transition-colors cursor-pointer"
          >
            <Italic className="w-4 h-4" />
          </button>
          <button 
            type="button"
            onClick={() => onStyleToggle('underline')}
            title="Sublinhado"
            className="p-1.5 hover:bg-gray-100 rounded text-gray-700 transition-colors cursor-pointer"
          >
            <Underline className="w-4 h-4" />
          </button>
        </div>

        {/* Grupo de Alinhamento */}
        <div className="flex items-center gap-1 border-r border-gray-200 pr-3">
          <button 
            type="button"
            onClick={() => onAlignmentChange('left')}
            title="Alinhar à Esquerda"
            className="p-1.5 hover:bg-gray-100 rounded text-gray-700 transition-colors cursor-pointer"
          >
            <AlignLeft className="w-4 h-4" />
          </button>
          <button 
            type="button"
            onClick={() => onAlignmentChange('center')}
            title="Centralizar"
            className="p-1.5 hover:bg-gray-100 rounded text-gray-700 transition-colors cursor-pointer"
          >
            <AlignCenter className="w-4 h-4" />
          </button>
          <button 
            type="button"
            onClick={() => onAlignmentChange('right')}
            title="Alinhar à Direita"
            className="p-1.5 hover:bg-gray-100 rounded text-gray-700 transition-colors cursor-pointer"
          >
            <AlignRight className="w-4 h-4" />
          </button>
          <button 
            type="button"
            onClick={() => onAlignmentChange('justify')}
            title="Justificar"
            className="p-1.5 hover:bg-gray-100 rounded text-gray-700 transition-colors cursor-pointer"
          >
            <AlignJustify className="w-4 h-4" />
          </button>
        </div>

        {/* Espaçamento e Recuo */}
        <div className="flex items-center gap-1">
          <select 
            onChange={(e) => onSpacingChange(parseFloat(e.target.value))}
            title="Espaçamento entre Linhas"
            className="text-xs bg-gray-50 border border-gray-200 rounded px-2 py-1.5 outline-none text-gray-700 cursor-pointer"
            defaultValue="1.5"
          >
            <option value="1.0">1.0</option>
            <option value="1.15">1.15</option>
            <option value="1.5">1.5</option>
            <option value="2.0">2.0</option>
          </select>
          <button 
            type="button"
            onClick={() => onIndentChange(-1)}
            title="Diminuir Recuo"
            className="p-1.5 hover:bg-gray-100 rounded text-gray-700 transition-colors cursor-pointer"
          >
            <Outdent className="w-4 h-4" />
          </button>
          <button 
            type="button"
            onClick={() => onIndentChange(1)}
            title="Aumentar Recuo"
            className="p-1.5 hover:bg-gray-100 rounded text-gray-700 transition-colors cursor-pointer"
          >
            <Indent className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Botões de Ação de Persistência */}
      <div className="flex items-center gap-2">
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          accept=".json" 
          className="hidden" 
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          title="Importar JSON"
          className="flex items-center gap-1.5 bg-gray-600 hover:bg-gray-700 text-white text-xs font-medium px-3 py-2 rounded shadow-sm transition-colors cursor-pointer"
        >
          <Upload className="w-4 h-4" />
          Abrir
        </button>
        <button
          type="button"
          onClick={onExportJSON}
          title="Exportar AST (JSON)"
          className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-3 py-2 rounded shadow-sm transition-colors cursor-pointer"
        >
          <Download className="w-4 h-4" />
          Exportar
        </button>
      </div>
    </div>
  );
};