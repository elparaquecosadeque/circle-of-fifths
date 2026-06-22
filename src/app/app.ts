import { Component } from '@angular/core';
import { CircleOfFifthsComponent } from './circle-of-fifths/circle-of-fifths.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CircleOfFifthsComponent],
  template: `<app-circle-of-fifths />`,
})
export class App {}
