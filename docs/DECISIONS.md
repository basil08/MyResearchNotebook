# Architecture Decision Record — Friday

Append-only. Newest last. Each entry: what we decided, what we rejected, and
what it costs. If you reverse one, add a new entry that supersedes it rather
than editing history.

Status: `accepted` · `superseded by ADR-nnn` · `proposed`

---

## ADR-001 — Visual direction: editorial paper
**Date:** 2026-08-29 · **Status:** accepted · **Milestone:** 0

Friday commits to a warm off-white "paper" ground, warm-neutral ink, serif
for content voice and system sans for chrome, with structure carried by 1px
hairlines and whitespace rather than shadows and cards.

**Rejected:**
- *True Notion neutral* (pure white, Inter throughout, blue accent) — maximally
  familiar but visually anonymous; the product would read as a generic SaaS
  tool rather than a research notebook.
- *Terminal-adjacent* (mono, near-black, phosphor accent) — excellent for
  scanning dense logs, hostile to the long-form prose these entries actually
  contain.

**Cost:** a serif/sans split is one more rule to enforce in review. Mitigated
by making it structural in the type scale — `display`/`title`/`heading` are
serif by construction, so a component cannot accidentally get it wrong.

---

## ADR-002 — System font stacks, no bundled webfont
**Date:** 2026-08-29 · **Status:** accepted · **Milestone:** 0

Typography uses `Platform.select`-ed font stacks: on web a CSS stack headed by
Lora and falling back through Iowan Old Style → Palatino → Georgia; on native a
single resolved family (Georgia on iOS, `serif` on Android). No font files are
bundled and no webfont is fetched.

**Rejected:** bundling Lora via `@expo-google-fonts/lora` + `expo-font`.

**Why:** zero network cost, zero FOUT/FOIT, zero added dependency, and no
async font-loading gate on first paint. Iowan/Palatino/Georgia are genuinely
good editorial serifs and are present on effectively every target device.

**Cost:** the serif differs slightly per platform, so the app is not
pixel-identical across OSes. Accepted — the *voice* is consistent, which is
what the design language actually asserts. If brand consistency later
outweighs this, bundling Lora is a contained change: swap `fonts.serif` in
`constants/design.ts` and add the loader gate.

---

## ADR-003 — Web-first, one universal component set
**Date:** 2026-08-29 · **Status:** accepted · **Milestone:** 0

One set of components, styled responsively via `useLayout()`. Every screen is
tuned for wide-viewport web; mobile gets the single-column fallback of the same
components and stays fully usable, but does not get bespoke native treatment
(custom sheets, gesture affordances, native keyboard choreography).

**Rejected:**
- *True parity* — roughly 1.6× the UI work on every milestone, for a surface
  that is currently the secondary use case.
- *Web only, drop native* — throws away the working EAS Android build.

**Cost:** mobile will feel like a good responsive web app rather than a native
one. Revisit if mobile usage becomes primary; the token layer is already
platform-agnostic, so the upgrade path is adding layout branches, not a rewrite.

---

## ADR-004 — Replace the 800px letterbox with a responsive shell
**Date:** 2026-08-29 · **Status:** accepted · **Milestone:** 0 (applied in 1)

The root layout currently pins all web content to `maxWidth: 800`, centred,
with a drop shadow — a phone emulator floating on a desktop screen. This is
removed. The window fills the viewport; a left rail (≥1180) and right context
pane (≥1500) claim the extra width; the *reading column* stays capped at
`layout.measure` (720 ≈ 72ch).

**Why:** the user's reported problems — "lots of unused space on the sides"
and "scroll is bad" — are both symptoms of the letterbox. A fixed 800px column
wastes ~60% of a 1600px screen and makes every list artificially tall, which is
what makes the scroll feel endless.

**Cost:** any layout that assumed a fixed 800px must be re-derived responsively.
All of them are being rewritten in Milestones 1–2 anyway.

---

## ADR-005 — Hairlines, not shadows, carry structure
**Date:** 2026-08-29 · **Status:** accepted · **Milestone:** 0

Inline elements separate with 1px rules and whitespace. The elevation scale has
exactly three steps (`none`, `popover`, `overlay`) and only genuinely floating
layers may use it.

**Why:** the current list renders every entry as an elevated card. At ~20
entries the page becomes a stack of drop shadows with no visual hierarchy —
directly the "can't make sense at a glance" complaint. Hairlines let density
increase without visual noise.

**Cost:** on very low-contrast displays hairlines can disappear. Mitigated with
`hairlineStrong` for section-level breaks.

---

## ADR-006 — Rename to "Friday": UI and docs only
**Date:** 2026-08-29 · **Status:** accepted · **Milestone:** 3

The product becomes **Friday**. Changed: app display name, all UI copy, README,
docs. **Unchanged:** `bundleIdentifier` / `android.package`
(`com.basil.myresearchnotebook`), Expo slug, deep-link scheme, EAS `projectId`,
and the repository directory name.

**Why:** changing the Android package makes an installed build a *different
app* — it will not update in place, it appears as a second icon, and the EAS
project must be re-linked. Not worth it for a cosmetic rename.

**Cost:** internal identifiers permanently disagree with the product name. This
is normal and harmless; the mismatch is documented here so nobody "fixes" it.

**Applied in Milestone 3:** display name in `app.json` and `app.config.cjs`;
splash and adaptive-icon backgrounds moved onto the palette (`#FAF9F7` light,
`#131211` dark) from the stock white/blue; login, About and all UI copy; README
rewritten; comment headers in `netlify.toml`, both Apps Script files and the EAS
guide. `package.json` `name` was left as `myresearchnotebook` — it is an internal
identifier and changing it buys nothing.

The **icon and splash artwork are still the Expo template images.** They need a
designer or a generated mark; nothing in this milestone could honestly produce
them.

Two things came out of building it. `/about` is **public** — it explains what
Friday is, which is exactly what someone who cannot get past the sign-in screen
may need to read — so `AppShell` now hides the sign-out control when there is no
signed-in user. And the browser tab title is set imperatively from the root
layout rather than through `Stack.Screen` options: expo-router renders an empty
react-helmet `<title>` ahead of the one in `+html.tsx`, and with headers hidden
the screen `title` option never populates it, leaving the tab blank.

---

## ADR-007 — Tokens are the only styling API
**Date:** 2026-08-29 · **Status:** accepted · **Milestone:** 0

Components read design values exclusively through `useTheme()`. No component
imports `palette` directly, and no component contains a hex value, a font
family, or an off-grid pixel number.

**Why:** it is the only mechanism that makes light/dark, future density modes,
and a future re-skin single-file changes rather than a codebase-wide grep.

**Cost:** slightly more verbose call sites than inline styles. Accepted.

---

## ADR-008 — Field identity by label + glyph, never colour
**Date:** 2026-08-29 · **Status:** accepted · **Milestone:** 0

The eight log fields are distinguished in dense views by a short scan label
(`Read`, `Learnt`, `Built`, …) plus a stable Material glyph, defined once in
`fieldMeta`. They are never distinguished by hue.

**Why:** eight hues is noise, not signal, and it collapses for colour-blind
users and in dark mode. A two-to-three-word label is faster to scan than a
colour legend the reader has to learn. It also keeps the single-accent rule
(ADR-001) intact.

**Cost:** labels take horizontal space in the list row. Budgeted for: the
scan label column is fixed-width and the value truncates, not the label.

---

## ADR-009 — Real routes replace in-screen view modes
**Date:** 2026-08-29 · **Status:** accepted · **Milestone:** 1

Home, new entry and entry detail are now expo-router routes (`/`,
`/entry/new`, `/entry/[id]`). Previously all four views were `viewMode` states
inside a single home screen, which also owned the corpus in local state. The
corpus moved to `contexts/logs-context.tsx`.

**Why:** the state machine was the direct cause of several complaints. Opening
an entry had no URL, so the browser back button did nothing and no view could
be linked or refreshed. Every view re-rendered the whole home screen. And
because the entry view lived *inside* the list screen, editing had to be a
third mode rather than the same page — which is what makes Milestone 2's
inline editor awkward to build against the old shape.

**Cost:** the corpus is fetched once per signed-in user and cached in memory,
so a write must patch the cache as well as the sheet. `LogsProvider` does this
in one place. A stale cache is possible if the sheet is edited directly in
Google Sheets during a session; pull-to-refresh resolves it.

---

## ADR-010 — Expo template scaffolding deleted
**Date:** 2026-08-29 · **Status:** accepted · **Milestone:** 1

Removed: the `(tabs)` group and its About screen, `modal.tsx`,
`parallax-scroll-view`, `hello-wave`, `haptic-tab`, `external-link`,
`collapsible`, `icon-symbol`, `debug-info`, `parsed-text-view`, and the four
`research-log-*` view components superseded by `components/entry/`.

**Why:** all were unreachable after ADR-009, and two of them (`markdown-view`,
`parsed-text-view`) were the only files in the repo that failed `tsc`. The
bottom tab bar in particular fought the web-first direction — two tabs, one of
which was a static About page.

**Cost:** the About screen is gone for now. Its content described the
multi-step form and the old field prompts, so it was already wrong. A real one
returns in Milestone 3 with the rest of the Friday branding.

`components/themed-text.tsx` and `themed-view.tsx` survive only because
`app/login.tsx` still uses them; both go when login is rebranded in Milestone 3.

---

## ADR-011 — Autosave replaces the Save button
**Date:** 2026-08-29 · **Status:** accepted · **Milestone:** 2

Entry edits save themselves. `hooks/use-autosave.ts` debounces 1200ms,
coalesces edits across fields into one patch, allows only one write in flight
at a time, and flushes on mode change, navigation and tab close. The bar shows
what the save is doing (Unsaved changes → Saving… → Saved 14:32), and a failed
save keeps the patch and offers Retry rather than dropping the text.

**Why:** the brief was "too many unnecessary clicks". A Save button is one
mandatory click per edit plus the anxiety of remembering it.

**Why those three properties specifically:** the backend is a Google Apps
Script driving a Sheet. A round trip is roughly 1–2s and Apps Script
serialises calls per deployment, so naive per-keystroke or per-field saving
would queue writes faster than they drain. Coalescing plus single-flight keeps
a burst of typing to one write.

**Cost:** a save can fail after the user has looked away. Mitigated by keeping
the failed patch in memory, surfacing the error in the bar, and blocking tab
close while a write is pending. It is not durable across a hard crash — an
offline queue is out of scope until the corpus justifies it.

---

## ADR-012 — Markdown source when writing, rendered when reading
**Date:** 2026-08-29 · **Status:** accepted · **Milestone:** 2

Read mode renders markdown. Write mode shows the raw source. There is no
live-rendering (WYSIWYG) editor.

**Rejected:** a rich-text editor that renders formatting as you type, as Notion
does.

**Why:** React Native's `TextInput` has no rich-text model. Faking one means
overlaying styled text on a transparent input and reimplementing caret
placement, selection and text layout — and getting that subtly wrong is worse
for a writing tool than showing the source. Markdown is also already the
storage format, so the source *is* the truth rather than a lossy export of it.

**Cost:** the user sees `*asterisks*` while typing. Accepted, given the
audience writes markdown anyway. If this becomes the top complaint, the
contained fix is a live-preview pane rather than an inline WYSIWYG.

**Consolation:** read and write use the same label, measure and vertical
rhythm, so toggling does not reflow the page, and clicking any field in read
mode opens write mode with that field already focused.

---

## Open items (not yet decided)

- **Mobile bypasses the authenticated proxy.** `getApiUrl()` sends native
  traffic straight to the Apps Script URL, which is deployed "Anyone" and does
  no token verification of its own. Web is verified at the Netlify function;
  mobile is not verified anywhere. Anyone with the script URL can read and
  write the whole corpus. Must be resolved before Milestone 6 (attachments),
  where the user has explicitly required that writes only go through the
  authenticated proxy.
- **Search compute location** (Milestone 5): client-side TF-IDF over the full
  corpus vs. a precomputed index. Decide when the corpus size is known.
- **Timestamp migration** (Milestone 4): existing `date` values are date-only
  strings; adding wall-clock time needs a backfill rule for historical rows.
  Milestone 1 works around this in `utils/entry.ts`: `date` is parsed
  defensively (a bare `YYYY-MM-DD` is read as *local* midnight, never UTC, or
  every entry shows a day early west of Greenwich), and a row's time is
  suppressed entirely unless `created_at` falls on the day the entry is about.
