/**
 * Catálogo curado de fontes do Google Fonts.
 *
 * Os valores de `family` são exatamente o que fica salvo no tema da loja
 * (`fontTitle` e `fontBody`) e o que aparece nas opções dos seletores do
 * painel. Só entram famílias que possuem os pesos 400 e 700: pedir um peso
 * inexistente faz o Google devolver HTTP 400 e derrubar a folha inteira,
 * fazendo o site cair nas fontes de fallback.
 */
export interface FontOption {
  /** Valor salvo no tema e usado no CSS. */
  family: string;
  /** Texto exibido na opção. */
  label: string;
}

/** Fontes com cara de título (serifadas / de destaque). */
export const TITLE_FONTS: FontOption[] = [
  { family: "Playfair Display", label: "Playfair Display" },
  { family: "Libre Baskerville", label: "Libre Baskerville" },
  { family: "Merriweather", label: "Merriweather" },
  { family: "Lora", label: "Lora" },
  { family: "EB Garamond", label: "EB Garamond" },
  { family: "Cormorant Garamond", label: "Cormorant Garamond" },
  { family: "Bitter", label: "Bitter" },
  { family: "Zilla Slab", label: "Zilla Slab" },
  { family: "Domine", label: "Domine" },
  { family: "Source Serif 4", label: "Source Serif 4" },
];

/** Fontes de leitura (corpo de texto). */
export const BODY_FONTS: FontOption[] = [
  { family: "Nunito", label: "Nunito" },
  { family: "Inter", label: "Inter" },
  { family: "Poppins", label: "Poppins" },
  { family: "Montserrat", label: "Montserrat" },
  { family: "Open Sans", label: "Open Sans" },
  { family: "Roboto", label: "Roboto" },
  { family: "Work Sans", label: "Work Sans" },
  { family: "Rubik", label: "Rubik" },
  { family: "Source Sans 3", label: "Source Sans 3" },
  { family: "Lato", label: "Lato" },
  { family: "DM Sans", label: "DM Sans" },
  { family: "Manrope", label: "Manrope" },
];

const KNOWN_FONTS = new Set(
  [...TITLE_FONTS, ...BODY_FONTS].map((option) => option.family),
);

export function isKnownFont(family: string): boolean {
  return KNOWN_FONTS.has(family.trim());
}

/**
 * Monta a URL da folha do Google Fonts para as famílias informadas.
 *
 * Famílias fora do catálogo são ignoradas (uma única família inválida faria o
 * Google responder 400 e a folha inteira não carregar). Retorna `null` quando
 * nenhuma família é carregável.
 */
export function googleFontsHref(families: Array<string | null | undefined>): string | null {
  const unique = [
    ...new Set(
      families
        .map((family) => (family ?? "").trim())
        .filter((family) => family && isKnownFont(family)),
    ),
  ];
  if (unique.length === 0) return null;

  const params = unique
    .map((family) => `family=${encodeURIComponent(family).replace(/%20/g, "+")}:wght@400;700`)
    .join("&");
  return `https://fonts.googleapis.com/css2?${params}&display=swap`;
}

/**
 * Garante que a fonte salva (inclusive valores antigos ou personalizados que
 * não estão no catálogo) apareça como opção selecionada no seletor.
 */
export function withCurrentFont(
  options: FontOption[],
  current?: string | null,
): FontOption[] {
  const value = (current ?? "").trim();
  if (!value || options.some((option) => option.family === value)) return options;
  return [{ family: value, label: value }, ...options];
}

/**
 * Pilha de fonte para uso em CSS: família entre aspas + fallbacks genéricos.
 * Remove aspas e contrabarras do valor salvo para não quebrar o CSS.
 * Retorna `undefined` quando não há família válida (o consumidor usa o padrão).
 */
export function fontStack(
  family: string | null | undefined,
  genericFallback: string,
): string | undefined {
  const clean = (family ?? "").replace(/["'\\]/g, "").trim();
  if (!clean) return undefined;
  return `"${clean}", ${genericFallback}`;
}
