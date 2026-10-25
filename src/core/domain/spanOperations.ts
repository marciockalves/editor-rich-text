import type { InlineSpan, TextStyle } from '../types/textHierarchy';

export interface SpanSplitResult {
  readonly left: InlineSpan;
  readonly right: InlineSpan;
}

/**
 * Divide um InlineSpan em dois no offset informado.
 * Utiliza Guard Clauses para garantir integridade e evitar exceções.
 */
export function splitInlineSpan(span: InlineSpan, offset: number): SpanSplitResult {
  // Guard 1: Offset inválido (menor ou igual a zero)
  if (offset <= 0) {
    return {
      left: { ...span, text: '' },
      right: span,
    };
  }

  // Guard 2: Offset além ou igual ao tamanho do texto
  if (offset >= span.text.length) {
    return {
      left: span,
      right: { ...span, id: `${span.id}-right-${Date.now()}`, text: '' },
    };
  }

  // Fluxo limpo e direto sem ramificações condicionais complexas
  return {
    left: {
      ...span,
      text: span.text.slice(0, offset),
    },
    right: {
      id: `${span.id}-split-${Date.now()}`,
      text: span.text.slice(offset),
      style: { ...span.style },
    },
  };
}

/**
 * Compara se dois estilos são estritamente iguais.
 */
export function areStylesEqual(styleA: TextStyle, styleB: TextStyle): boolean {
  return (
    styleA.bold === styleB.bold &&
    styleA.italic === styleB.italic &&
    styleA.underline === styleB.underline &&
    styleA.fontFamily === styleB.fontFamily &&
    styleA.fontSize === styleB.fontSize
  );
}

/**
 * Junta spans consecutivos que possuem exatamente o mesmo estilo,
 * prevenindo a poluição da árvore por micro-spans vazios ou redundantes.
 */
export function normalizeSpans(spans: readonly InlineSpan[]): readonly InlineSpan[] {
  // Guard: Se houver 0 ou 1 span, não há o que normalizar
  if (spans.length <= 1) {
    return spans;
  }

  return spans.reduce<InlineSpan[]>((accumulator, currentSpan) => {
    // Guard: Se o span atual for vazio e houver mais conteúdo, podemos omiti-lo
    if (currentSpan.text.length === 0 && spans.length > 1) {
      return accumulator;
    }

    const previousSpan = accumulator[accumulator.length - 1];

    // Se não há anterior ou os estilos são diferentes, apenas adiciona o atual
    if (!previousSpan || !areStylesEqual(previousSpan.style, currentSpan.style)) {
      return [...accumulator, currentSpan];
    }

    // Se os estilos são iguais, funde o texto no span anterior (imutável)
    const mergedSpan: InlineSpan = {
      ...previousSpan,
      text: previousSpan.text + currentSpan.text,
    };

    return [...accumulator.slice(0, -1), mergedSpan];
  }, []);
}

/**
 * Aplica um estilo a um intervalo de caracteres [start, end] dentro de um array de spans.
 * Esta é a função central que simula o comportamento de editores profissionais.
 */
export function applyStyleToSpanRange(
  spans: readonly InlineSpan[],
  start: number,
  end: number,
  stylePatch: TextStyle
): readonly InlineSpan[] {
  // Guard 1: Intervalo inválido ou nulo
  if (start >= end || spans.length === 0) {
    return spans;
  }

  let currentCursor = 0;

  const transformedSpans = spans.flatMap((span) => {
    const spanStart = currentCursor;
    const spanEnd = currentCursor + span.text.length;
    currentCursor = spanEnd;

    // Caso 1: O span está completamente fora da seleção (à esquerda ou à direita)
    if (spanEnd <= start || spanStart >= end) {
      return [span];
    }

    // Caso 2: O span está totalmente dentro da seleção
    if (spanStart >= start && spanEnd <= end) {
      return [{
        ...span,
        style: { ...span.style, ...stylePatch },
      }];
    }

    // Caso 3: O span cruza parcialmente as fronteiras da seleção (precisa de fatiamento)
    // Calculamos os offsets relativos dentro deste span específico
    const relativeStart = Math.max(0, start - spanStart);
    const relativeEnd = Math.min(span.text.length, end - spanStart);

    // Primeiro corte: separa a parte esquerda que fica fora da seleção
    const firstSplit = splitInlineSpan(span, relativeStart);
    
    // Segundo corte: separa a parte central (selecionada) da parte direita (fora da seleção)
    const adjustedRelativeEnd = relativeEnd - relativeStart;
    const secondSplit = splitInlineSpan(firstSplit.right, adjustedRelativeEnd);

    // Monta o trio de spans resultante: [Fora da esq, Dentro com estilo aplicado, Fora da dir]
    const leftPart = firstSplit.left.text.length > 0 ? [firstSplit.left] : [];
    const middlePart = {
      ...secondSplit.left,
      style: { ...secondSplit.left.style, ...stylePatch },
    };
    const rightPart = secondSplit.right.text.length > 0 ? [secondSplit.right] : [];

    return [...leftPart, middlePart, ...rightPart];
  });

  // Normaliza o resultado para fundir trechos adjacentes com o mesmo estilo
  return normalizeSpans(transformedSpans);
}

/**
 * Insere um caractere de quebra de linha suave (\n) no offset especificado de um span.
 */
export function insertSoftBreakInSpan(span: InlineSpan, offset: number): InlineSpan {
  // Guard Clause: Offset inválido
  if (offset < 0 || offset > span.text.length) {
    return span;
  }

  const leftText = span.text.slice(0, offset);
  const rightText = span.text.slice(offset);

  return {
    ...span,
    text: `${leftText}\n${rightText}`,
  };
}