import { Page } from './components/editor/Page';
import { Toolbar } from './components/toolbar/Toolbar';
import type { DocumentAST } from './core/types/document';
import { useDocument } from './hooks/useDocument';
import { exportToJSON } from './utils/export';
import { paginateBlocks } from './utils/pagination';


const initialDocument: DocumentAST = {
  id: 'doc-1',
  title: 'Meu Documento Exportável',
  pageSettings: {
    marginTop: 20,
    marginBottom: 20,
    marginLeft: 25,
    marginRight: 25,
  },
  blocks: [
    {
      id: 'b-1',
      type: 'heading-1',
      alignment: 'left',
      lineSpacing: 1.2,
      indent: 0,
      children: [{ id: 's-1', text: 'Módulo 6: Importação e Exportação' }],
    },
    {
      id: 'b-2',
      type: 'paragraph',
      alignment: 'justify',
      lineSpacing: 1.5,
      indent: 0,
      children: [{ id: 's-2', text: 'Faça alterações, exporte o arquivo JSON e depois clique em "Abrir" para recarregá-lo!' }],
    },
  ],
};

export function App() {
  const { 
    document: doc, 
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
    navigateBlock
  } = useDocument(initialDocument);

  const pages = paginateBlocks(doc.blocks, 1000);

  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col items-center overflow-y-auto">
      <header className="mb-4 text-center">
        <h1 className="text-xl font-bold text-gray-800">{doc.title}</h1>
        <p className="text-xs text-gray-500">Módulo 6: Persistência Bidirecional (Import & Export)</p>
      </header>

      {/* Barra de Ferramentas com Ações de Importar e Exportar */}
      <Toolbar 
        onAlignmentChange={setBlockAlignment}
        onStyleToggle={toggleInlineStyle}
        onFontChange={setBlockFontFamily}
        onTypeChange={setBlockType}
        onSpacingChange={setBlockSpacing}
        onIndentChange={setBlockIndent}
        onExportJSON={() => exportToJSON(doc)}
        onImportJSON={loadDocument}
      />

      {/* Páginas do Editor */}
      {pages.map((pageBlocks, index) => (
        <Page
          key={`page-${index}`}
          pageNumber={index + 1}
          blocks={pageBlocks}
          settings={doc.pageSettings}
          activeBlockId={activeBlockId}
          cursorOffset={cursorOffset}
          onFocusBlock={setActiveBlockId}
          onUpdateText={updateBlockText}
          onAddBlock={addBlockAfter}
          onRemoveBlock={removeBlock}
          onMergeWithPrevious={mergeWithPrevious}
          onNavigate={navigateBlock}
        />
      ))}
    </div>
  );
}

export default App;