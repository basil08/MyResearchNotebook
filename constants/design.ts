/**
 * Friday — Design Tokens
 * ----------------------
 * Single source of truth for colour, type, space, radius, motion and layout.
 *
 * Direction: "Editorial paper". A research notebook, not a SaaS dashboard.
 *   - Warm off-white ground, warm-neutral ink. No pure #fff / #000 anywhere.
 *   - Serif for anything that reads as *content* (entry dates, headings).
 *   - System sans for chrome (buttons, labels, nav, meta).
 *   - Structure comes from 1px hairlines and whitespace, NOT from shadows.
 *     Shadows are reserved exclusively for things that float above the page
 *     (popovers, modals, drag previews).
 *   - Exactly one accent. Colour is information, not decoration.
 *
 * Never hardcode a colour in a component. Pull from `useTheme()`.
 * See docs/DESIGN_LANGUAGE.md for the rules and docs/DECISIONS.md for the why.
 */

import { Platform, type TextStyle } from 'react-native';

/* ------------------------------------------------------------------ *
 * Palette
 * ------------------------------------------------------------------ */

export const palette = {
  light: {
    /** Page background. The "paper". */
    ground: '#FAF9F7',
    /** Raised content surface (editor body, popover interior). */
    surface: '#FFFFFF',
    /** Recessed surface (code blocks, inert wells, table zebra). */
    sunken: '#F2F0EC',
    /** Hover/press wash over the ground. */
    wash: '#EFEDE8',

    /** Primary text. */
    ink: '#1A1917',
    /** Secondary text: field labels, meta, timestamps. */
    inkMuted: '#605C55',
    /** Tertiary text: placeholders, disabled, hints. */
    inkFaint: '#8A857C',
    /** Text on top of `accent`. */
    inkInverse: '#FBFAF8',

    /** Default 1px rule. The main structural device. */
    hairline: '#E4E0D9',
    /** Emphasised rule: focus rings, active borders, section breaks. */
    hairlineStrong: '#CEC8BD',

    accent: '#2E5C8A',
    accentHover: '#25496E',
    accentPressed: '#1D3A58',
    /** Tinted background for selected/active states. */
    accentSoft: '#E7EEF6',

    danger: '#A6322A',
    dangerSoft: '#F8E9E7',
    success: '#2F6B4F',
    successSoft: '#E6F0EA',
    warning: '#8A6320',
    warningSoft: '#F8EFDE',

    /** Search-hit / text marker. */
    highlight: '#FAEFC4',
    /** Scrim behind modals. */
    scrim: 'rgba(26, 25, 23, 0.32)',
  },

  dark: {
    ground: '#131211',
    surface: '#1B1A18',
    sunken: '#0E0D0C',
    wash: '#232120',

    ink: '#EDEAE3',
    inkMuted: '#A7A199',
    inkFaint: '#6F6A62',
    inkInverse: '#131211',

    hairline: '#2C2A27',
    hairlineStrong: '#3F3B36',

    accent: '#84AAD3',
    accentHover: '#9CBBDE',
    accentPressed: '#6C93BC',
    accentSoft: '#1D2833',

    danger: '#DE857C',
    dangerSoft: '#2E1E1C',
    success: '#7FBE9C',
    successSoft: '#182620',
    warning: '#D2A55E',
    warningSoft: '#2A2013',

    highlight: '#453A18',
    scrim: 'rgba(0, 0, 0, 0.58)',
  },
} as const;

export type ColorScheme = keyof typeof palette;
export type ColorToken = keyof (typeof palette)['light'];
/** Widened so `palette.light` and `palette.dark` are interchangeable. */
export type Colors = Record<ColorToken, string>;

/* ------------------------------------------------------------------ *
 * Typography
 * ------------------------------------------------------------------ */

/**
 * Font stacks. RN native cannot parse CSS font stacks (comma lists), so the
 * web branch gets a real stack and native branches get one resolved family.
 * ADR-002: no bundled webfont — zero network cost, zero FOUT, and Iowan/
 * Palatino/Georgia are genuinely good editorial serifs on every target.
 */
export const fonts = Platform.select({
  web: {
    serif: "'Lora', 'Iowan Old Style', 'Palatino Linotype', Palatino, Georgia, serif",
    sans: "-apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
    mono: "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, 'Liberation Mono', monospace",
  },
  ios: { serif: 'Georgia', sans: 'System', mono: 'Menlo' },
  default: { serif: 'serif', sans: 'sans-serif', mono: 'monospace' },
})!;

/**
 * The type scale. Every piece of text in the app must use one of these.
 * `display`/`title`/`heading` are serif (content voice);
 * everything else is sans (chrome voice).
 */
export const type = {
  /** Page-level entry date on a full entry view. */
  display: {
    fontFamily: fonts.serif,
    fontSize: 34,
    lineHeight: 42,
    fontWeight: '600',
    letterSpacing: -0.4,
  },
  /** Entry date in list rows; modal titles. */
  title: {
    fontFamily: fonts.serif,
    fontSize: 26,
    lineHeight: 34,
    fontWeight: '600',
    letterSpacing: -0.25,
  },
  /** Section heading inside content. */
  heading: {
    fontFamily: fonts.serif,
    fontSize: 19,
    lineHeight: 27,
    fontWeight: '600',
    letterSpacing: -0.1,
  },
  /** Emphasised sans run-in above a block. */
  subhead: {
    fontFamily: fonts.sans,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '600',
    letterSpacing: -0.05,
  },
  /** Long-form reading + editing text. The workhorse. */
  body: {
    fontFamily: fonts.sans,
    fontSize: 15,
    lineHeight: 25,
    fontWeight: '400',
    letterSpacing: 0,
  },
  /** Body in a focused single-column editor. */
  bodyLarge: {
    fontFamily: fonts.sans,
    fontSize: 16.5,
    lineHeight: 28,
    fontWeight: '400',
    letterSpacing: 0,
  },
  /** UI chrome: buttons, nav, menu items, meta. */
  ui: {
    fontFamily: fonts.sans,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
    letterSpacing: 0,
  },
  /** Small chrome: timestamps, counts, footnotes. */
  uiSmall: {
    fontFamily: fonts.sans,
    fontSize: 11.5,
    lineHeight: 16,
    fontWeight: '500',
    letterSpacing: 0,
  },
  /** Field labels. Always uppercase, always tracked out. */
  label: {
    fontFamily: fonts.sans,
    fontSize: 10.5,
    lineHeight: 14,
    fontWeight: '700',
    letterSpacing: 0.9,
    textTransform: 'uppercase',
  },
  /** Code, ids, raw timestamps. */
  mono: {
    fontFamily: fonts.mono,
    fontSize: 12.5,
    lineHeight: 20,
    fontWeight: '400',
    letterSpacing: 0,
  },
} as const satisfies Record<string, TextStyle>;

export type TypeVariant = keyof typeof type;

/* ------------------------------------------------------------------ *
 * Space — 4px base grid
 * ------------------------------------------------------------------ */

export const space = {
  /** 2 — hairline nudges only */
  xxs: 2,
  /** 4 */
  xs: 4,
  /** 8 — inside a chip, icon↔label */
  sm: 8,
  /** 12 — control padding */
  md: 12,
  /** 16 — default gap between related blocks */
  lg: 16,
  /** 24 — gap between fields */
  xl: 24,
  /** 32 — gap between sections */
  xxl: 32,
  /** 48 — gap between major regions */
  xxxl: 48,
  /** 64 — page top/bottom breathing room */
  huge: 64,
} as const;

/* ------------------------------------------------------------------ *
 * Radius — restrained. Paper does not have big rounded corners.
 * ------------------------------------------------------------------ */

export const radius = {
  none: 0,
  /** inputs, small chips */
  sm: 4,
  /** buttons, cards */
  md: 6,
  /** popovers, sheets */
  lg: 10,
  /** modal / bottom sheet top corners */
  xl: 16,
  pill: 999,
} as const;

/* ------------------------------------------------------------------ *
 * Elevation — floating things ONLY. Never on inline content.
 * ------------------------------------------------------------------ */

export const elevation = {
  none: 0,
  /** dropdown, tooltip, autocomplete */
  popover: 1,
  /** modal, bottom sheet, drag preview */
  overlay: 2,
} as const;

export type ElevationLevel = keyof typeof elevation;

/** Platform-correct shadow for a floating layer. */
export function shadow(level: ElevationLevel, scheme: ColorScheme = 'light') {
  if (level === 'none') return {};
  const dark = scheme === 'dark';
  const spec = {
    popover: { y: 4, blur: 12, opacity: dark ? 0.45 : 0.1 },
    overlay: { y: 12, blur: 32, opacity: dark ? 0.6 : 0.16 },
  }[level];

  if (Platform.OS === 'web') {
    return { boxShadow: `0 ${spec.y}px ${spec.blur}px rgba(0,0,0,${spec.opacity})` } as any;
  }
  return {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: spec.y },
    shadowRadius: spec.blur / 2,
    shadowOpacity: spec.opacity,
    elevation: level === 'overlay' ? 8 : 3,
  };
}

/* ------------------------------------------------------------------ *
 * Layout
 * ------------------------------------------------------------------ */

export const breakpoints = {
  /** phone */
  xs: 0,
  /** large phone / small tablet */
  sm: 640,
  /** tablet — two panes become possible */
  md: 900,
  /** laptop — three panes */
  lg: 1180,
  /** wide desktop */
  xl: 1500,
} as const;

export type Breakpoint = keyof typeof breakpoints;

export const layout = {
  /**
   * Reading measure. ~72ch at body size — the widest a line can get before
   * the eye loses the next line's start. Content is capped at this; the
   * *page* is not (ADR-003: kill the 800px letterbox).
   */
  measure: 720,
  /** Wider cap for scannable list/table content. */
  measureWide: 980,
  /** Left navigation rail (lg+). */
  railWidth: 232,
  /** Right context/index pane (xl+). */
  asideWidth: 292,
  /** Horizontal page gutter by breakpoint. */
  gutter: { xs: 16, sm: 20, md: 28, lg: 36, xl: 48 },
  /** Top chrome bar. */
  barHeight: 48,
  /** Minimum hit target. */
  touchTarget: 44,
} as const;

/* ------------------------------------------------------------------ *
 * Motion — fast, small, never bouncy. Paper does not bounce.
 * ------------------------------------------------------------------ */

export const motion = {
  duration: { instant: 90, fast: 140, base: 200, slow: 280 },
  easing: {
    /** default in/out */
    standard: 'cubic-bezier(0.2, 0, 0, 1)',
    /** entering */
    decelerate: 'cubic-bezier(0, 0, 0, 1)',
    /** exiting */
    accelerate: 'cubic-bezier(0.3, 0, 1, 1)',
  },
} as const;

/* ------------------------------------------------------------------ *
 * Semantic field identity
 * ------------------------------------------------------------------ *
 * The eight log fields need to be recognisable at a glance in a dense list.
 * Each gets a short scan label and a stable glyph. Colour is deliberately
 * NOT used to distinguish them — eight hues would be noise, not signal.
 */

export const fieldMeta = {
  plan_to_read: { short: 'Plan · read', glyph: 'menu-book', order: 1 },
  plan_to_do: { short: 'Plan · do', glyph: 'flag', order: 2 },
  did_read: { short: 'Read', glyph: 'auto-stories', order: 3 },
  learned_today: { short: 'Learnt', glyph: 'lightbulb', order: 4 },
  new_thoughts: { short: 'Thought', glyph: 'psychology', order: 5 },
  coded_today: { short: 'Built', glyph: 'code', order: 6 },
  wrote_or_taught: { short: 'Wrote', glyph: 'edit-note', order: 7 },
  try_tomorrow: { short: 'Next', glyph: 'east', order: 8 },
} as const;

export type LogField = keyof typeof fieldMeta;

/** Full prompts — used as editor placeholders, never as list labels. */
export const fieldPrompt: Record<LogField, string> = {
  plan_to_read: 'What do you plan to read?',
  plan_to_do: 'What do you plan to do?',
  did_read: 'What did you read?',
  learned_today: 'What did you learn?',
  new_thoughts: 'What new things did you think of?',
  coded_today: 'What did you code or implement?',
  wrote_or_taught: 'What did you write, or teach someone?',
  try_tomorrow: 'What should you try tomorrow?',
};

export const logFields = (Object.keys(fieldMeta) as LogField[]).sort(
  (a, b) => fieldMeta[a].order - fieldMeta[b].order
);
