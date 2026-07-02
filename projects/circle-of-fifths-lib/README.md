# @gblp/circle-of-fifths

Standalone Angular 22 component for exploring keys, diatonic chords, and common progressions with an interactive circle of fifths.

```ts
import { Component } from '@angular/core';
import { CircleOfFifthsComponent } from '@gblp/circle-of-fifths';

@Component({
  imports: [CircleOfFifthsComponent],
  template: `<the-chords-circle-of-fifths [language]="'es'" />`,
})
export class App {}
```

`language` accepts `en` or `es` and defaults to `en`.

Override the component theme from any ancestor with these inherited CSS variables:

```css
--chords-background;
--chords-background-alt;
--chords-surface;
--chords-surface-elevated;
--chords-text;
--chords-muted;
--chords-primary;
--chords-secondary;
--chords-highlight;
--chords-danger;
--chords-border;
--chords-on-primary;
```

Build the package with `npm run build:lib`. The publishable Angular package is written to `dist/circle-of-fifths-lib`.
