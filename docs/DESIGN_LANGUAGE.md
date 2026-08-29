# Friday — Design Language

> Friday is a research notebook. It should feel like paper you can search,
> not like a dashboard. Everything below exists to keep that true as the
> codebase grows.

**Direction: Editorial paper.**
Warm off-white ground, warm-neutral ink, serif for content, system sans for
chrome, structure from hairlines and whitespace. One accent. No decoration.

---

## 1. The five rules

1. **Never hardcode a value.** No hex, no magic pixel numbers, no font names
   in a component. Everything comes from `useTheme()`.
   ```tsx
   const t = useTheme();
   <View style={{ padding: t.space.lg, borderColor: t.colors.hairline }} />
   ```
2. **Structure is a hairline, not a shadow.** Shadows are reserved for layers
   that genuinely float above the page — popovers, modals, drag previews.
   An inline card gets `bordered`, never `float`.
3. **Serif is the content voice, sans is the chrome voice.** Entry dates and
   headings are serif. Buttons, labels, nav, meta and timestamps are sans.
   Nothing is both.
4. **Colour is information.** The accent means "active / selected / link".
   Danger means destructive. If a colour isn't carrying meaning, remove it.
5. **Content is capped, the page is not.** Reading columns cap at
   `layout.measure` (720). The window itself fills the viewport and uses the
   extra width for navigation and context panes — never for empty margin.

---

## 2. Tokens

All in `constants/design.ts`. Reached via `useTheme()` / `useLayout()`.

### Colour

Two schemes, same token names. Nothing is pure `#fff` or `#000`.

| Token | Role |
|---|---|
| `ground` | the page itself |
| `surface` | raised content (editor body, popover interior) |
| `sunken` | recessed wells (code blocks, inert areas) |
| `wash` | hover / press over the ground |
| `ink` | primary text |
| `inkMuted` | labels, meta, timestamps |
| `inkFaint` | placeholders, disabled, hints |
| `inkInverse` | text on top of `accent` |
| `hairline` | the default 1px rule — the main structural device |
| `hairlineStrong` | focus rings, active borders, section breaks |
| `accent` / `accentHover` / `accentPressed` / `accentSoft` | the one accent |
| `danger` `success` `warning` (+ `*Soft`) | status only |
| `highlight` | search-hit marker |
| `scrim` | behind modals |

### Type

Nine variants. If a new size is needed, the answer is almost always "use an
existing one".

| Variant | Family | Size / LH | Use |
|---|---|---|---|
| `display` | serif | 34 / 42 | entry date on a full entry page |
| `title` | serif | 26 / 34 | entry date in list rows, modal titles |
| `heading` | serif | 19 / 27 | section heading inside content |
| `subhead` | sans | 15 / 22 | emphasised run-in above a block |
| `body` | sans | 15 / 25 | reading + editing — the workhorse |
| `bodyLarge` | sans | 16.5 / 28 | focused single-column editor |
| `ui` | sans | 13 / 18 | buttons, nav, menus, meta |
| `uiSmall` | sans | 11.5 / 16 | timestamps, counts, footnotes |
| `label` | sans | 10.5 / 14 | field labels — uppercase, tracked +0.9 |
| `mono` | mono | 12.5 / 20 | code, ids, raw timestamps |

Font stacks are `Platform.select`-ed: web gets a real CSS stack, native gets
one resolved family (RN cannot parse comma stacks). See ADR-002.

### Space — 4px grid

`xxs 2 · xs 4 · sm 8 · md 12 · lg 16 · xl 24 · xxl 32 · xxxl 48 · huge 64`

Rough intent: `sm` inside a control, `lg` between related blocks, `xl`
between fields, `xxl` between sections, `xxxl` between regions.

### Radius

`none 0 · sm 4 (inputs, chips) · md 6 (buttons, cards) · lg 10 (popovers) ·
xl 16 (sheets) · pill 999`

Paper does not have big rounded corners. Nothing inline goes above `md`.

### Elevation

`none` · `popover` · `overlay`. That is the entire set, and only floating
layers may use it. `t.shadow(level)` returns the platform-correct style
(boxShadow on web, shadow props on native).

### Motion

`instant 90 · fast 140 · base 200 · slow 280`, easings `standard`,
`decelerate` (entering), `accelerate` (exiting). Nothing bounces. Nothing
animates longer than 280ms.

### Layout

| Token | Value | Meaning |
|---|---|---|
| `measure` | 720 | reading column cap (~72ch) |
| `measureWide` | 980 | scannable list/table cap |
| `railWidth` | 232 | left nav rail (lg+) |
| `asideWidth` | 292 | right context pane (xl+) |
| `gutter` | 16→48 | page gutter, per breakpoint |
| `barHeight` | 48 | top chrome |
| `touchTarget` | 44 | minimum hit area |

Breakpoints: `xs 0 · sm 640 · md 900 · lg 1180 · xl 1500`

```
xs/sm  <900     one column, bottom nav, sheets
md     900+     content + collapsible aside
lg     1180+    rail | content
xl     1500+    rail | content | aside
```

---

## 3. Primitives

`import { ... } from '@/components/ui'`

| Component | Notes |
|---|---|
| `Text` | `variant` + `tone`. Every string renders through it. |
| `Surface` | `level` (ground/raised/sunken/transparent), `bordered`, `float`, `radius`, `padding`. |
| `Divider` | `strong`, `vertical`, `spacing`. |
| `Row` / `Stack` | flex with a token `gap`. Prefer these over ad-hoc flex styles. |
| `Button` | `primary` \| `secondary` \| `ghost` \| `danger`, sizes `sm`/`md`, `icon`, `loading`, `block`. |
| `Field` | `boxed` (forms, search) or `seamless` (the entry editor). |
| `Chip` | tag / keyword / filter pill, with optional `count` and `weight`. |
| `Icon` | Material Icons, theme-toned, sizes matched to the type scale. |

### Button budget
One `primary` per screen region. If two things look equally important,
one of them is `secondary`. `ghost` is for toolbar actions that should
disappear until hovered. `danger` is always behind a confirm.

---

## 4. Field identity

The eight log fields must be recognisable at a glance in a dense list. Each
has a **short scan label** and a **stable glyph** in `fieldMeta`:

| Field | Label | Glyph |
|---|---|---|
| `plan_to_read` | Plan · read | menu-book |
| `plan_to_do` | Plan · do | flag |
| `did_read` | Read | auto-stories |
| `learned_today` | Learnt | lightbulb |
| `new_thoughts` | Thought | psychology |
| `coded_today` | Built | code |
| `wrote_or_taught` | Wrote | edit-note |
| `try_tomorrow` | Next | east |

Colour is deliberately **not** used to tell fields apart — eight hues would be
noise. The full question text (`fieldPrompt`) is an editor placeholder only;
it never appears as a list label.

---

## 5. Accessibility floor

- Body and UI text meet WCAG AA against their own surface in both schemes.
  `inkFaint` is for non-essential text only — never for anything you must read.
- Every interactive element has an accessible role and label; icon-only
  controls must pass `label`.
- Hit targets ≥ `layout.touchTarget` (44) on touch.
- Focus is always visible: `hairlineStrong` on seamless inputs, `accent` on
  boxed ones. Never remove the ring without replacing it.
- State is never colour-only — pair it with a glyph, weight or label.

---

## 6. Adding to the system

Before adding a token or a primitive, check the existing set covers it. If it
genuinely doesn't:

1. Add the token to `constants/design.ts` (not to a component).
2. Document it in this file.
3. Record an ADR in `docs/DECISIONS.md` if it changes a rule above.
