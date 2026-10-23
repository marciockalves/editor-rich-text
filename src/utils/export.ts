import type { DocumentAST } from "../core/types/document";


/**
 * Exporta o documento atual como um arquivo JSON baixável.
 */
export function exportToJSON(doc: DocumentAST) {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(doc, null, 2));
  const downloadAnchor = document.createElement('a'); // Agora aponta para o DOM global corretamente
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", `${doc.title.toLowerCase().replace(/\s+/g, '-')}.json`);
  document.body.appendChild(downloadAnchor); // Adiciona ao body do DOM
  downloadAnchor.click();
  downloadAnchor.remove();
}