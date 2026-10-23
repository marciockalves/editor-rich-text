import type { BlockNode } from "../core/types/document";


/**
 * Divide uma lista plana de blocos em páginas com base em um limite estimado de caracteres ou blocos por página.
 */
export function paginateBlocks(blocks: BlockNode[], maxCharsPerPage: number = 800): BlockNode[][] {
  const pages: BlockNode[][] = [];
  let currentPage: BlockNode[] = [];
  let currentCharCount = 0;

  for (const block of blocks) {
    const blockTextLength = block.children.reduce((acc, child) => acc + child.text.length, 0) + 20; // +20 de overhead estrutural

    if (currentCharCount + blockTextLength > maxCharsPerPage && currentPage.length > 0) {
      pages.push(currentPage);
      currentPage = [block];
      currentCharCount = blockTextLength;
    } else {
      currentPage.push(block);
      currentCharCount += blockTextLength;
    }
  }

  if (currentPage.length > 0) {
    pages.push(currentPage);
  }

  // Garante pelo menos uma página vazia se o documento estiver limpo
  if (pages.length === 0) {
    pages.push([]);
  }

  return pages;
}