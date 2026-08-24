import { Component, computed, input, output } from '@angular/core';
import { NgClass } from '@angular/common';

import { CircleKey, COPY, KEYS, Language } from '../../circle-of-fifths-data';

@Component({
  selector: 'circle-of-fifths-wheel',
  standalone: true,
  imports: [NgClass],
  templateUrl: './circle-of-fifths-wheel.html',
  styleUrl: './circle-of-fifths-wheel.scss',
  host: { '[class.readonly]': '!interactive()' },
})
export class CircleOfFifthsWheel {
  readonly language = input<Language>('en');
  readonly selectedIndex = input<number | null>(null);
  readonly selectedType = input<'major' | 'minor' | null>(null);
  readonly interactive = input(true);

  readonly keySelected = output<{ index: number; type: 'major' | 'minor' }>();

  readonly text = computed(() => COPY[this.language()]);
  readonly keys = KEYS;

  readonly CX = 300;
  readonly CY = 300;
  readonly KEY_SIG = { inner: 250, outer: 288 };
  readonly MAJOR = { inner: 172, outer: 250 };
  readonly MINOR = { inner: 102, outer: 172 };

  private get slice() {
    const idx = this.selectedIndex();
    if (idx === null) return null;
    return {
      prev: (idx - 1 + 12) % 12,
      curr: idx,
      next: (idx + 1) % 12,
    };
  }

  onKeyClick(index: number, type: 'major' | 'minor'): void {
    if (!this.interactive()) return;
    this.keySelected.emit({ index, type });
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
    const cx = this.CX,
      cy = this.CY;
    const x1 = cx + outerR * Math.cos(s),
      y1 = cy + outerR * Math.sin(s);
    const x2 = cx + outerR * Math.cos(e),
      y2 = cy + outerR * Math.sin(e);
    const x3 = cx + innerR * Math.cos(e),
      y3 = cy + innerR * Math.sin(e);
    const x4 = cx + innerR * Math.cos(s),
      y4 = cy + innerR * Math.sin(s);
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

  getAccidentalText(key: CircleKey): string {
    if (key.sharps > 0) return `${key.sharps}♯`;
    if (key.flats > 0) return `${key.flats}♭`;
    return '—';
  }

  get selectedInfo() {
    const idx = this.selectedIndex();
    const type = this.selectedType();
    if (idx === null || type === null) return null;
    const key = KEYS[idx];
    const copy = this.text();
    const scale = type === 'major' ? copy.major : copy.minor;
    return {
      name: type === 'major' ? key.major : key.minor,
      scale,
      fullName: `${type === 'major' ? key.major : key.minor} ${scale}`,
      relativeKey:
        type === 'major'
          ? `${copy.relativeMinor}: ${key.minor}`
          : `${copy.relativeMajor}: ${key.major}`,
    };
  }
}
