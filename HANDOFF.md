# Handoff: Circle of Fifths — Library Features & ChordSectionComponent Extraction

**Created:** 2026-07-13T13:32:38-05:00  
**Branch:** main  
**Latest commit:** `befd042 extracted chord-section`

---

## Summary

This is a publishable Angular 22 library (`@gblp/circle-of-fifths`) that renders an interactive SVG Circle of Fifths. Over the last several commits, three features were added: chord progression expand/collapse with section derivation, a **Copy button** on each progression card, and the extraction of the diatonic chord table into a standalone, exportable `ChordSectionComponent`. The library builds cleanly and all existing tests pass.

---

## Work Completed

### Changes Made

- [x] Added `verse`, `copy` keys to the `COPY` bilingual dictionary (`en`/`es`)
- [x] Added **Copy button** (`btn-copy`) inside `.prog-expand-row` on every progression card
- [x] `copyChords()` method: flat comma-separated string when collapsed; `"Verse: C, G; Chorus: F, Am; ..."` format (`: ` and `; ` delimiters) when expanded, always prepending the verse (root progression chords)
- [x] Extracted `KEYS[]`, `dimChord()`, `buildChordRows()` to module-level — shared by both components
- [x] Created `ChordSectionComponent` (`selector: chord-section`) with `chords: string[]` and `language` inputs, auto-detects best-matching scale via score across all 24 keys
- [x] `CircleOfFifthsComponent` now delegates its chord table rendering to `<chord-section>` passing `chordNames`
- [x] `ChordSectionComponent` has its own template and SCSS with self-contained CSS custom property definitions so it works standalone outside the parent

### Key Decisions

| Decision | Rationale | Alternatives Considered |
|---|---|---|
| Module-level `KEYS`, `dimChord`, `buildChordRows` | Single source of truth for both components; avoids duplicate logic | Separate service / injection |
| `ChordSectionComponent` in the same file (`circle-of-fifths.ts`) | Fewest files; all types and constants already in scope | Separate `chord-section.component.ts` file |
| Scale detection by max-score across all 24 keys | Simple, correct for typical 3–4 chord inputs | Interval analysis, key signature matching |
| `COPY.en` as dummy copy arg for scale-detection scoring | Chord names are language-independent; only label strings are localized | Separate language-free chord table |
| CSS custom props re-declared on `:host` in `chord-section.component.scss` | Allows standalone use outside parent; when nested, inherits same tokens | Rely on parent cascade (breaks standalone use) |

---

## Files Affected

### Created

- `projects/circle-of-fifths-lib/src/lib/chord-section.component.html` — template for `ChordSectionComponent`; renders chord grid from `rows()` computed signal
- `projects/circle-of-fifths-lib/src/lib/chord-section.component.scss` — encapsulated styles for chord grid cards; mirrors parent CSS token definitions for standalone use

### Modified

- `projects/circle-of-fifths-lib/src/lib/circle-of-fifths.ts` — primary change file:
  - Added `KEYS[]`, `dimChord()`, `buildChordRows()` at module level (before component declarations)
  - Added `ChordSectionComponent` class (declared **before** `CircleOfFifthsComponent` to avoid forward-reference TS error)
  - `CircleOfFifthsComponent`: removed inline `chordTable` body (now delegates to `buildChordRows`), added `chordNames` getter, removed `private dimChord()` method, added `copyChords()`, added `verse`/`copy` strings to `COPY`
  - `CircleOfFifthsComponent.imports` now includes `ChordSectionComponent`
- `projects/circle-of-fifths-lib/src/lib/circle-of-fifths.html` — replaced inline `<section class="chord-section">` block with `<chord-section [chords]="chordNames" [language]="language()">`, added `<button class="btn-expand" (click)="copyChords(prog)">` in `.prog-expand-row`
- `projects/circle-of-fifths-lib/src/lib/circle-of-fifths.scss` — removed chord-table CSS rules (`.chord-section`, `.chord-grid`, `.chord-card` and all state variants); kept progression styles

### Read (Reference)

- `src/app/app.ts` — host app; uses `<the-chords-circle-of-fifths />` directly, no changes needed
- `projects/circle-of-fifths-lib/src/public-api.ts` — exports `* from './lib/circle-of-fifths'`; `ChordSectionComponent` is automatically exported via this wildcard

---

## Technical Context

### Architecture / Design Notes

The library is a single Angular workspace with two projects:

```
circle-of-fifths/          ← host app (demo/dev shell)
projects/
  circle-of-fifths-lib/    ← publishable library (@gblp/circle-of-fifths)
    src/
      public-api.ts        ← barrel, wildcard re-exports lib/circle-of-fifths
      lib/
        circle-of-fifths.ts          ← all logic (COPY, KEYS, both components)
        circle-of-fifths.html        ← CircleOfFifthsComponent template
        circle-of-fifths.scss        ← CircleOfFifthsComponent styles
        chord-section.component.html ← ChordSectionComponent template
        chord-section.component.scss ← ChordSectionComponent styles
        circle-of-fifths.spec.ts     ← Vitest/TestBed tests
```

**Exported public surface** (via `public-api.ts` wildcard):
- `CircleOfFifthsComponent` — selector `the-chords-circle-of-fifths`
- `ChordSectionComponent` — selector `chord-section`

**Theming**: all colors are CSS custom properties under `--chords-*` (public tokens) resolved to `--_chords-*` (private scoped). Consumer overrides via `--chords-primary`, `--chords-text`, etc.

**Language**: `language` input accepts `'en' | 'es'`, defaults to `'en'`. All UI strings are in the `COPY` const.

**Progression sections**: `deriveSections()` derives Chorus (rotated from IV/VI pivot), Bridge (rotated from vi/III pivot), and Outro (fixed pattern) from a progression's numeral array. Verse = root chords of the progression card itself.

### Dependencies

No new dependencies were added. Stack: Angular 22, TypeScript 6, Vitest, ng-packagr, SCSS.

### Configuration Changes

None.

---

## Things to Know

### Gotchas & Pitfalls

- **`ChordSectionComponent` must be declared before `CircleOfFifthsComponent`** in `circle-of-fifths.ts`. Angular's partial compilation mode does not hoist component references within a file — placing `ChordSectionComponent` after causes TS2449 "used before declaration" error.
- **Scale detection is best-effort by score** — if a user passes chords that match equally across two keys, the first-found wins (loop order: index 0–11, major before minor). This is acceptable for the typical 3–4 chord input.
- **`copyChords()` uses `navigator.clipboard`** — requires HTTPS or localhost in browser. Fails silently in HTTP contexts; no error handling currently.
- The `btn-copy` button reuses the `btn-expand` CSS class. This is intentional — same visual style. A separate `.btn-copy` class was named in the button but the SCSS class applied is `btn-expand`. Check if you want distinct styling.

### Assumptions Made

- Chord names passed to `ChordSectionComponent` use the canonical notation from `KEYS` (e.g., `'F♯m'`, `'D♭'`). Non-matching strings score 0 and the component renders nothing.
- The verse section in the copy format is always the progression's own `chords[]` array (the card-level chords, not a derived rotation).

### Known Issues

- `circle-of-fifths.spec.ts` only tests `CircleOfFifthsComponent` — no tests for `ChordSectionComponent` or the `copyChords` method.
- The `copyChords()` function has no user feedback (no toast, no button state change) after copying.

---

## Current State

### What's Working

- [x] `CircleOfFifthsComponent` — full interactive SVG circle, key selection, chord highlighting, diatonic chord table (via `<chord-section>`), progressions with expand/collapse/copy
- [x] `ChordSectionComponent` — standalone exportable, accepts `chords[]` + `language`, auto-detects scale, renders chord grid with numeral/type/role/color
- [x] Bilingual support (`en`/`es`) in both components
- [x] Copy button: collapsed → `"C, G, Am, F"` — expanded → `"Verse: C, G, Am, F; Chorus: Am, F, C, G; Bridge: F, G, Em, Am; Outro: C, G, F, C"`
- [x] Library builds cleanly: `npm run build:lib` → `dist/circle-of-fifths-lib`

### What's Not Working

- No user feedback after clicking Copy (clipboard write is fire-and-forget)
- No tests for `ChordSectionComponent`

### Tests

- [x] Unit tests: 2 passing (`should create`, `renders Spanish content`) — run `npm test`
- [ ] Integration tests: none
- [x] Manual testing: build verified (`npm run build:lib`)

---

## Next Steps

### Immediate (Start Here)

1. **Add copy feedback** — toggle button text to "Copied!" / "¡Copiado!" for ~1.5s after click; requires a `signal<boolean>` per card or a shared timeout. Simplest: one `copiedCard = signal<string | null>(null)` in the component, clear with `setTimeout`.
2. **Fix `btn-copy` CSS class** — the copy button in `circle-of-fifths.html` uses `class="btn-expand"`. Either rename to `btn-copy` and add a rule in the SCSS, or intentionally document it as sharing the style.
3. **Add `ChordSectionComponent` tests** — at minimum: renders nothing for empty input, renders correct key name for `['C', 'G', 'Am', 'F']`, language switching.

### Subsequent

- **Publish to npm** — bump version in `projects/circle-of-fifths-lib/package.json` (currently `0.1.0`), run `npm run build:lib`, then `npm publish dist/circle-of-fifths-lib`
- **Add `language` type export** — consumers importing `ChordSectionComponent` may want the `Language` type; it's currently not exported from `public-api.ts`
- **Expand language support** — `COPY` and `Language` type are the only two places to touch for a new locale
- **Score tie-breaking in `ChordSectionComponent`** — consider preferring major over minor on equal scores, or expose a `preferredType` input

### Blocked On

Nothing — all work is self-contained.

---

## Related Resources

### Documentation

- npm package: https://www.npmjs.com/package/@gblp/circle-of-fifths
- Angular 22 signals: https://angular.dev/guide/signals

### Commands to Run

```bash
# Install deps (if fresh clone)
npm install

# Build library only
npm run build:lib

# Build lib + serve demo app
npm start

# Run tests
npm test

# Build for GitHub Pages
npm run build:gh-pages
```

If you need to find more context:
- `grep -n "copyChords\|btn-copy\|btn-expand" projects/circle-of-fifths-lib/src/lib/circle-of-fifths.html` — find copy button wiring
- `grep -n "ChordSectionComponent\|chord-section" projects/circle-of-fifths-lib/src/lib/circle-of-fifths.ts` — find component declaration and usage
- `grep -n "COPY\b" projects/circle-of-fifths-lib/src/lib/circle-of-fifths.ts` — find all copy string references

---

*This handoff was generated on 2026-07-13. Use it as your starting context in a new session.*
