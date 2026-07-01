# @gblp/circle-of-fifths

Standalone Angular 22 component for exploring keys, diatonic chords, and common progressions with an interactive circle of fifths.

```ts
import { Component } from '@angular/core';
import { CircleOfFifthsComponent } from '@gblp/circle-of-fifths';

@Component({
  imports: [CircleOfFifthsComponent],
  template: '<the-chords-circle-of-fifths />'
})
export class App {}
```

Build the package with `npm run build:lib`. The publishable Angular package is written to `dist/circle-of-fifths-lib`.
