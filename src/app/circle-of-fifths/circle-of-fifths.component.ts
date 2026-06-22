import { Component, signal } from '@angular/core';
import { NgClass } from '@angular/common';

interface CircleKey {
  index: number;
  major: string;
  minor: string;
  sharps: number;
  flats: number;
}

interface ChordRow {
  numeral: string;
  chord: string;
  chordType: 'major' | 'minor' | 'diminished';
  role: string;
  state: 'tonic' | 'scale-major' | 'scale-minor' | 'scale-diminished';
}

@Component({
  selector: 'app-circle-of-fifths',
  standalone: true,
  imports: [NgClass],
  templateUrl: './circle-of-fifths.component.html',
  styleUrl: './circle-of-fifths.component.scss',
})
export class CircleOfFifthsComponent {
  readonly CX = 300;
  readonly CY = 300;

  readonly KEY_SIG = { inner: 250, outer: 288 };
  readonly MAJOR = { inner: 172, outer: 250 };
  readonly MINOR = { inner: 102, outer: 172 };

  readonly keys: CircleKey[] = [
    { index: 0,  major: 'C',   minor: 'Am',   sharps: 0, flats: 0 },
    { index: 1,  major: 'G',   minor: 'Em',   sharps: 1, flats: 0 },
    { index: 2,  major: 'D',   minor: 'Bm',   sharps: 2, flats: 0 },
    { index: 3,  major: 'A',   minor: 'F♯m',  sharps: 3, flats: 0 },
    { index: 4,  major: 'E',   minor: 'C♯m',  sharps: 4, flats: 0 },
    { index: 5,  major: 'B',   minor: 'G♯m',  sharps: 5, flats: 0 },
    { index: 6,  major: 'F♯',  minor: 'D♯m',  sharps: 6, flats: 0 },
    { index: 7,  major: 'D♭',  minor: 'B♭m',  sharps: 0, flats: 5 },
    { index: 8,  major: 'A♭',  minor: 'Fm',   sharps: 0, flats: 4 },
    { index: 9,  major: 'E♭',  minor: 'Cm',   sharps: 0, flats: 3 },
    { index: 10, major: 'B♭',  minor: 'Gm',   sharps: 0, flats: 2 },
    { index: 11, major: 'F',   minor: 'Dm',   sharps: 0, flats: 1 },
  ];

  selectedIndex = signal<number | null>(null);
  selectedType = signal<'major' | 'minor' | null>(null);

  private get slice() {
    const idx = this.selectedIndex();
    if (idx === null) return null;
    return {
      prev: (idx - 1 + 12) % 12,
      curr: idx,
      next: (idx + 1) % 12,
    };
  }

  selectKey(index: number, type: 'major' | 'minor'): void {
    if (this.selectedIndex() === index && this.selectedType() === type) {
      this.selectedIndex.set(null);
      this.selectedType.set(null);
    } else {
      this.selectedIndex.set(index);
      this.selectedType.set(type);
    }
  }

  getMajorState(index: number): string {
    const s = this.slice;
    if (!s) return '';
    const type = this.selectedType();
    if (index === s.curr) return type === 'major' ? 'tonic' : 'scale-major';
    if (index === s.prev || index === s.next) return 'scale-major';
    return '';
  }

  getMinorState(index: number): string {
    const s = this.slice;
    if (!s) return '';
    const type = this.selectedType();
    const dimIdx = (s.curr + 2) % 12;
    if (index === s.curr) return type === 'minor' ? 'tonic' : 'scale-minor';
    if (index === s.prev || index === s.next) return 'scale-minor';
    if (index === dimIdx) return 'scale-diminished';
    return '';
  }

  getMajorRole(index: number): string {
    const s = this.slice;
    if (!s) return '';
    const type = this.selectedType();
    if (type === 'major') {
      if (index === s.curr) return 'I';
      if (index === s.prev) return 'IV';
      if (index === s.next) return 'V';
    } else {
      if (index === s.curr) return 'III';
      if (index === s.prev) return 'VI';
      if (index === s.next) return 'VII';
    }
    return '';
  }

  getMinorRole(index: number): string {
    const s = this.slice;
    if (!s) return '';
    const type = this.selectedType();
    const dimIdx = (s.curr + 2) % 12;
    if (type === 'major') {
      if (index === s.curr) return 'vi';
      if (index === s.prev) return 'ii';
      if (index === s.next) return 'iii';
      if (index === dimIdx) return 'vii°';
    } else {
      if (index === s.curr) return 'i';
      if (index === s.prev) return 'iv';
      if (index === s.next) return 'v';
      if (index === dimIdx) return 'ii°';
    }
    return '';
  }

  arcPath(innerR: number, outerR: number, index: number, gap = 1.5): string {
    const mid = index * 30 - 90;
    const s = (mid - 15 + gap) * (Math.PI / 180);
    const e = (mid + 15 - gap) * (Math.PI / 180);
    const cx = this.CX, cy = this.CY;
    const x1 = cx + outerR * Math.cos(s), y1 = cy + outerR * Math.sin(s);
    const x2 = cx + outerR * Math.cos(e), y2 = cy + outerR * Math.sin(e);
    const x3 = cx + innerR * Math.cos(e), y3 = cy + innerR * Math.sin(e);
    const x4 = cx + innerR * Math.cos(s), y4 = cy + innerR * Math.sin(s);
    const f = (n: number) => n.toFixed(2);
    return `M${f(x1)} ${f(y1)} A${outerR} ${outerR} 0 0 1 ${f(x2)} ${f(y2)} L${f(x3)} ${f(y3)} A${innerR} ${innerR} 0 0 0 ${f(x4)} ${f(y4)}Z`;
  }

  textPos(midR: number, index: number): { x: number; y: number } {
    const a = (index * 30 - 90) * (Math.PI / 180);
    return {
      x: this.CX + midR * Math.cos(a),
      y: this.CY + midR * Math.sin(a),
    };
  }

  private dimChord(idx: number): string {
    // The diminished chord root is the minor key two steps clockwise (idx+2)
    const minor = this.keys[(idx + 2) % 12].minor;
    return minor.replace(/m$/, '°');
  }

  getAccidentalText(key: CircleKey): string {
    if (key.sharps > 0) return `${key.sharps}♯`;
    if (key.flats > 0) return `${key.flats}♭`;
    return '—';
  }

  get selectedInfo() {
    const idx = this.selectedIndex();
    const type = this.selectedType();
    if (idx === null || type === null) return null;
    const key = this.keys[idx];
    return {
      name: type === 'major' ? key.major : key.minor,
      scale: type === 'major' ? 'Major' : 'Minor',
      fullName: type === 'major' ? `${key.major} Major` : `${key.minor} Minor`,
      relativeKey: type === 'major'
        ? `Relative minor: ${key.minor}`
        : `Relative major: ${key.major}`,
    };
  }

  get chordTable(): ChordRow[] {
    const idx = this.selectedIndex();
    const type = this.selectedType();
    if (idx === null || type === null) return [];

    const prev = (idx - 1 + 12) % 12;
    const next = (idx + 1) % 12;

    if (type === 'major') {
      return [
        { numeral: 'I',   chord: this.keys[idx].major,  chordType: 'major', role: 'Tonic',       state: 'tonic' },
        { numeral: 'ii',  chord: this.keys[prev].minor, chordType: 'minor', role: 'Supertonic',  state: 'scale-minor' },
        { numeral: 'iii', chord: this.keys[next].minor, chordType: 'minor', role: 'Mediant',     state: 'scale-minor' },
        { numeral: 'IV',  chord: this.keys[prev].major, chordType: 'major', role: 'Subdominant', state: 'scale-major' },
        { numeral: 'V',   chord: this.keys[next].major, chordType: 'major', role: 'Dominant',    state: 'scale-major' },
        { numeral: 'vi',   chord: this.keys[idx].minor,  chordType: 'minor', role: 'Submediant',  state: 'scale-minor' },
        { numeral: 'vii°', chord: this.dimChord(idx),    chordType: 'diminished', role: 'Leading Tone', state: 'scale-diminished' },
      ];
    } else {
      return [
        { numeral: 'i',   chord: this.keys[idx].minor,  chordType: 'minor', role: 'Tonic',       state: 'tonic' },
        { numeral: 'iv',  chord: this.keys[prev].minor, chordType: 'minor', role: 'Subdominant', state: 'scale-minor' },
        { numeral: 'v',   chord: this.keys[next].minor, chordType: 'minor', role: 'Dominant',    state: 'scale-minor' },
        { numeral: 'III', chord: this.keys[idx].major,  chordType: 'major', role: 'Mediant',     state: 'scale-major' },
        { numeral: 'VI',  chord: this.keys[prev].major, chordType: 'major', role: 'Submediant',  state: 'scale-major' },
        { numeral: 'VII',  chord: this.keys[next].major, chordType: 'major', role: 'Subtonic',    state: 'scale-major' },
        { numeral: 'ii°',  chord: this.dimChord(idx),    chordType: 'diminished', role: 'Supertonic', state: 'scale-diminished' },
      ];
    }
  }
}
