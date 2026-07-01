import { Component } from '@angular/core';
import { CircleOfFifthsComponent } from '@gblp/circle-of-fifths';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CircleOfFifthsComponent],
  template: `<the-chords-circle-of-fifths />`,
})
export class App {}
