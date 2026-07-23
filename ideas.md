# Ideas

## 🟢 Low Effort

### 1. Copy Feedback
Flash "Copied!" / "¡Copiado!" for ~1.5s after clicking the Copy button.  
**Implementation:** One `signal<string | null>` (`copiedCard`) on the component, set on click, cleared with `setTimeout`. Template swaps button label reactively.

### 2. Highlight Progression Chords on the Circle
When hovering or selecting a progression card, light up its chord names on the SVG rings.  
**Implementation:** The numeral→chord lookup map already exists in `progressions`. Map chord names back to key indices and feed them into `getMajorState` / `getMinorState`.

### 3. Export `Language` Type from Public API
Consumers importing `ChordSectionComponent` can't type the `language` input without the `Language` type.  
**Implementation:** One-line re-export in `public-api.ts`.

### 4. Keyboard Navigation
Let arrow keys cycle through the 12 keys on the circle without clicking.  
**Implementation:** `(keydown)` host listener; `selectedIndex` increments/decrements with `% 12` wrapping — already used throughout.

### 5. More Languages
Add Portuguese, French, German, etc.  
**Implementation:** `COPY` is a plain object and `Language` is a union type. New locale = new key in `COPY` + union member. No new UI required.

---

## 🟡 Medium Effort

### 6. Chord Player
Play individual chords or a full progression using the Web Audio API (zero dependencies).  
**Implementation:** Stack sine/triangle oscillators per chord tone, short attack/release envelope. Add a ▶ button to each chord card and progression card.

### 7. Relative Key Toggle
One-click switch between a major key and its relative minor (already displayed in the center circle).  
**Implementation:** The relative key is already computed in `selectedInfo.relativeKey`. Add a button that calls `selectKey` with the paired index and opposite type.

### 8. Progression Transposer
Given the current progression (as numerals), render it in any target key the user picks.  
**Implementation:** `buildChordRows` + the numeral lookup already handle the math. Add a key-picker dropdown; re-resolve the same numerals against the new key's lookup map.

### 9. Share URL
Encode selected key, type, and visible progressions into the URL hash so a specific state can be shared.  
**Implementation:** Manual `location.hash` read/write on `selectKey` and `randomizeProgressions`. Format: `#C-major` or `#Am-minor`. No router dependency needed.

### 10. Dark Mode
The component is fully themed via CSS custom properties (`--chords-*`). A dark skin requires only a new token set.  
**Implementation:** Add a `prefers-color-scheme: dark` media query block in the SCSS, or expose a `theme: 'light' | 'dark'` input that toggles a host class.

### 11. Favorite Progressions
Let users heart-mark progressions that persist across sessions.  
**Implementation:** Small ♡ button per card; store an array of progression identifiers in `localStorage`. Favorited progressions surface at the top on next visit.

---

## 🔴 High Effort

### 12. Chord Diagram Overlays
Show guitar fretboard or piano keyboard fingering when clicking a chord card.  
**Implementation:** Requires a chord voicing dataset and a new SVG rendering component. Non-trivial data layer; fingering varies by instrument and voicing preference.

### 13. Freeform Chord Analyzer
A text input where the user types chord names and the matching key is identified live.  
**Implementation:** Needs fuzzy/enharmonic normalization (`Bb` = `B♭`, `F#m` = `F♯m`, `Fmaj7` → `F`), then feeds into the existing `ChordSectionComponent` score algorithm.

### 14. MIDI Export
Export a progression as a downloadable `.mid` file.  
**Implementation:** Pure-JS MIDI byte writer (no library needed but the MIDI spec encoding — variable-length quantities, track chunks, timing — is non-trivial). Produces a standard file playable in any DAW.

### 15. Modes of the Major Scale
Extend the circle to show Dorian, Phrygian, Lydian, Mixolydian, etc. derived from the selected key.  
**Implementation:** New data layer for modal chord sets (each mode reorders the 7 diatonic chords with a different tonic), new UI section below or alongside the current chord table.

### 16. Progression Builder
Drag-and-drop interface to assemble a custom progression from the diatonic chord set, preview it, then copy or export.  
**Implementation:** Drag-and-drop (CDK or pointer events), playback via Web Audio, integration with the existing copy/export pipeline. Largest scope item on this list.
