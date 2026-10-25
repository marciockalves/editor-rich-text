import { describe, it, expect } from 'vitest';
import { splitInlineSpan, normalizeSpans } from './spanOperations';
import type { InlineSpan } from '../types/textHierarchy';

describe('Span Operations (Domain Core)', () => {
  it('deve dividir corretamente um InlineSpan no offset informado', () => {
    const span: InlineSpan = {
      id: 'span-1',
      text: 'Olá Mundo',
      style: { bold: true },
    };

    const result = splitInlineSpan(span, 4);

    expect(result.left.text).toBe('Olá ');
    expect(result.left.style.bold).toBe(true);
    
    expect(result.right.text).toBe('Mundo');
    expect(result.right.style.bold).toBe(true);
  });

  it('deve normalizar e fundir spans adjacentes com o mesmo estilo', () => {
    const spans: readonly InlineSpan[] = [
      { id: '1', text: 'Texto ', style: {} },
      { id: '2', text: 'normal', style: {} },
      { id: '3', text: ' com negrito', style: { bold: true } },
    ];

    const normalized = normalizeSpans(spans);

    // Os dois primeiros devem se fundir em um único span de texto "Texto normal"
    expect(normalized.length).toBe(2);
    expect(normalized[0].text).toBe('Texto normal');
    expect(normalized[0].style).toEqual({});
    expect(normalized[1].text).toBe(' com negrito');
    expect(normalized[1].style).toEqual({ bold: true });
  });
});