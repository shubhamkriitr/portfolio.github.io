/**
 * Typeface configuration — the single place to change fonts.
 *
 * ─── To swap a typeface ───────────────────────────────────────────────────
 *
 *   1. yarn add @fontsource-variable/<name>     (or @fontsource/<name>)
 *   2. Add one @import line to src/styles/global.css
 *   3. Edit the entry below
 *
 * Step 2 cannot be folded in here: CSS `@import` must be statically
 * analysable at build time, so it has to live in a real stylesheet. Every
 * *other* consumer — the CSS variables, the OG image generator, and the
 * heading weights — reads from this file.
 *
 * ─── Roles ────────────────────────────────────────────────────────────────
 *
 *   display  your name, page titles, article titles      (--font-heading)
 *   body     running text and UI                         (--font-sans)
 *   mono     section labels, dates, tags, code           (--font-mono)
 *
 * ─── The weight trap ──────────────────────────────────────────────────────
 *
 * `display.weight` exists because some display serifs ship a SINGLE weight.
 * Asking such a face for 600 or 700 makes the browser synthesise a smeared
 * faux-bold. Instrument Serif is one of these — hence 400. If you swap in a
 * multi-weight serif, raise this to 600 or 700 and the whole site follows.
 *
 * ─── OG images ────────────────────────────────────────────────────────────
 *
 * Satori (which renders the social-preview PNGs) cannot read variable woff2,
 * so `og` points at *static* .woff files. For a variable Fontsource package
 * you usually need the matching static package installed too — e.g.
 * `@fontsource-variable/schibsted-grotesk` for the site plus
 * `@fontsource/schibsted-grotesk` for satori.
 */

/** One static font file satori loads for OG image rendering. */
export interface OgFontFile {
  /** Fontsource package directory, e.g. '@fontsource/instrument-serif'. */
  pkg: string;
  /** Filename inside that package's `files/` directory. */
  file: string;
  /** Weight satori should associate with this file. */
  weight: 400 | 500 | 600 | 700;
}

export const fonts = {
  display: {
    /** CSS font-family stack. First entry must match the @font-face family. */
    stack: "'Instrument Serif', Georgia, 'Times New Roman', serif",
    /** Weight for the name and every page/article title. See "weight trap". */
    weight: 400,
    /** Static files for OG image rendering. */
    og: [
      {
        pkg: '@fontsource/instrument-serif',
        file: 'instrument-serif-latin-400-normal.woff',
        weight: 400,
      },
    ] as OgFontFile[],
  },

  body: {
    stack: "'Schibsted Grotesk', system-ui, -apple-system, sans-serif",
    og: [
      {
        pkg: '@fontsource/schibsted-grotesk',
        file: 'schibsted-grotesk-latin-400-normal.woff',
        weight: 400,
      },
      {
        pkg: '@fontsource/schibsted-grotesk',
        file: 'schibsted-grotesk-latin-600-normal.woff',
        weight: 600,
      },
    ] as OgFontFile[],
  },

  mono: {
    stack: "'IBM Plex Mono', ui-monospace, SFMono-Regular, monospace",
  },
} as const;

/** Family name satori should register a stack under (first entry, unquoted). */
export function familyName(stack: string): string {
  return stack.split(',')[0]!.trim().replace(/^['"]|['"]$/g, '');
}

export type FontConfig = typeof fonts;
