import { Component, computed, input, signal } from '@angular/core';
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
  chordType: string;
  role: string;
  state: 'tonic' | 'scale-major' | 'scale-minor' | 'scale-diminished';
}

interface Section {
  label: string;
  numerals: string[];
  chords: string[];
}

interface Progression {
  name: string;
  mood: string;
  genre: string;
  numerals: string[];
  chords: string[];
  sections: Section[];
}

type Language = 'en' | 'es';
type LocalizedText = Record<Language, string>;

interface ProgressionDefinition {
  name: LocalizedText;
  mood: LocalizedText;
  genre: LocalizedText;
  numerals: string[];
}

const PROGRESSIONS: Record<'major' | 'minor', ProgressionDefinition[]> = {
  major: [
    {
      name: { en: 'Anthemic', es: 'Épica' },
      mood: { en: '😄 Joyful', es: '😄 Alegre' },
      genre: { en: 'Folk, Rock', es: 'Folk, rock' },
      numerals: ['I', 'IV', 'V', 'I'],
    },
    {
      name: { en: 'Hopeful', es: 'Esperanzadora' },
      mood: { en: '✨ Hopeful', es: '✨ Esperanzadora' },
      genre: { en: 'Pop, Indie', es: 'Pop, indie' },
      numerals: ['I', 'V', 'vi', 'IV'],
    },
    {
      name: { en: 'Melancholic', es: 'Melancólica' },
      mood: { en: '😢 Emotional', es: '😢 Emocional' },
      genre: { en: 'Ballads, Pop', es: 'Baladas, pop' },
      numerals: ['vi', 'IV', 'I', 'V'],
    },
    {
      name: { en: 'Cinematic', es: 'Cinemática' },
      mood: { en: '🎬 Tense', es: '🎬 Tensa' },
      genre: { en: 'Film, Jazz', es: 'Cine, jazz' },
      numerals: ['ii', 'V', 'vii°', 'I'],
    },
    {
      name: { en: 'Nostalgic', es: 'Retro' },
      mood: { en: '🕺 Retro', es: '🕺 Retro' },
      genre: { en: 'Doo-Wop, Pop', es: 'Doo-Wop, pop' },
      numerals: ['I', 'vi', 'IV', 'V'],
    },
    {
      name: { en: 'Dreamy', es: 'Soñadora' },
      mood: { en: '🌸 Floaty', es: '🌸 Etérea' },
      genre: { en: 'J-Pop, Anime', es: 'J-Pop, anime' },
      numerals: ['IV', 'V', 'iii', 'vi'],
    },
    {
      name: { en: 'Gospel', es: 'Gospel' },
      mood: { en: '🙏 Uplifting', es: '🙏 Elevadora' },
      genre: { en: 'Gospel, Soul', es: 'Gospel, soul' },
      numerals: ['I', 'IV', 'ii', 'V'],
    },
    {
      name: { en: 'Bittersweet', es: 'Agridulce' },
      mood: { en: '🍂 Bittersweet', es: '🍂 Agridulce' },
      genre: { en: 'Alt Rock, Indie', es: 'Rock alternativo, indie' },
      numerals: ['I', 'iii', 'IV', 'V'],
    },
  ],
  minor: [
    {
      name: { en: 'Brooding', es: 'Sombría' },
      mood: { en: '🌑 Dark', es: '🌑 Oscura' },
      genre: { en: 'Rock, Metal', es: 'Rock, metal' },
      numerals: ['i', 'VII', 'VI', 'VII'],
    },
    {
      name: { en: 'Haunting', es: 'Inquietante' },
      mood: { en: '👻 Mysterious', es: '👻 Misteriosa' },
      genre: { en: 'Film, Gothic', es: 'Cine, gótico' },
      numerals: ['i', 'iv', 'VII', 'III'],
    },
    {
      name: { en: 'Driving', es: 'Impulsora' },
      mood: { en: '⚡ Urgent', es: '⚡ Urgente' },
      genre: { en: 'Pop, EDM', es: 'Pop, EDM' },
      numerals: ['i', 'VI', 'III', 'VII'],
    },
    {
      name: { en: 'Wistful', es: 'Nostálgica' },
      mood: { en: '🌙 Wistful', es: '🌙 Nostálgica' },
      genre: { en: 'Cinematic', es: 'Cinemática' },
      numerals: ['i', 'v', 'VI', 'VII'],
    },
    {
      name: { en: 'Flamenco', es: 'Flamenco' },
      mood: { en: '🌹 Passionate', es: '🌹 Apasionado' },
      genre: { en: 'Flamenco, World', es: 'Flamenco, mundial' },
      numerals: ['i', 'VII', 'VI', 'iv'],
    },
    {
      name: { en: 'Tragic', es: 'Trágica' },
      mood: { en: '💔 Tragic', es: '💔 Trágica' },
      genre: { en: 'Classical, Drama', es: 'Clásica, drama' },
      numerals: ['i', 'iv', 'v', 'i'],
    },
    {
      name: { en: 'Epic', es: 'Épica' },
      mood: { en: '⚔️ Heroic', es: '⚔️ Heroico' },
      genre: { en: 'Epic, Orchestral', es: 'Épica, orquestal' },
      numerals: ['i', 'III', 'VII', 'VI'],
    },
    {
      name: { en: 'Ethereal', es: 'Etérea' },
      mood: { en: '🌊 Hypnotic', es: '🌊 Hipnótica' },
      genre: { en: 'Ambient, Post-Rock', es: 'Ambient, post-rock' },
      numerals: ['i', 'VI', 'iv', 'VII'],
    },
  ],
};

const COPY = {
  en: {
    title: 'Circle of Fifths',
    subtitle: 'Click any major or minor key to highlight its diatonic chords',
    ariaLabel: 'Circle of Fifths',
    clickKey: 'Click a key',
    seeChords: 'to see its chords',
    deselect: '↩ click to deselect',
    tonicLegend: 'Tonic (I / i)',
    majorLegend: 'Major chords (IV, V)',
    minorLegend: 'Minor chords (ii, iii, vi)',
    diminishedLegend: 'Diminished (vii° / ii°)',
    diatonicChords: 'Diatonic Chords',
    commonProgressions: 'Common Progressions in',
    generateProgressions: 'Shuffle',
    chorus: 'Chorus',
    bridge: 'Bridge',
    outro: 'Outro',
    verse: 'Verse',
    copy: 'Copy',
    expand: 'Expand',
    collapse: 'Collapse',
    major: 'Major',
    minor: 'Minor',
    diminished: 'diminished',
    relativeMinor: 'Relative minor',
    relativeMajor: 'Relative major',
    roles: {
      tonic: 'Tonic',
      supertonic: 'Supertonic',
      mediant: 'Mediant',
      subdominant: 'Subdominant',
      dominant: 'Dominant',
      submediant: 'Submediant',
      leadingTone: 'Leading Tone',
      subtonic: 'Subtonic',
    },
  },
  es: {
    title: 'Círculo de quintas',
    subtitle: 'Haz clic en una tonalidad mayor o menor para resaltar sus acordes diatónicos',
    ariaLabel: 'Círculo de quintas',
    clickKey: 'Haz clic en una tonalidad',
    seeChords: 'para ver sus acordes',
    deselect: '↩ haz clic para deseleccionar',
    tonicLegend: 'Tónica (I / i)',
    majorLegend: 'Acordes mayores (IV, V)',
    minorLegend: 'Acordes menores (ii, iii, vi)',
    diminishedLegend: 'Disminuido (vii° / ii°)',
    diatonicChords: 'Acordes diatónicos',
    commonProgressions: 'Progresiones comunes en',
    generateProgressions: 'Generar nuevos',
    chorus: 'Coro',
    bridge: 'Puente',
    outro: 'Final',
    verse: 'Estrofa',
    copy: 'Copiar',
    expand: 'Expandir',
    collapse: 'Colapsar',
    major: 'Mayor',
    minor: 'Menor',
    diminished: 'disminuido',
    relativeMinor: 'Relativa menor',
    relativeMajor: 'Relativa mayor',
    roles: {
      tonic: 'Tónica',
      supertonic: 'Supertónica',
      mediant: 'Mediante',
      subdominant: 'Subdominante',
      dominant: 'Dominante',
      submediant: 'Submediante',
      leadingTone: 'Sensible',
      subtonic: 'Subtónica',
    },
  },
} as const;

const KEYS: CircleKey[] = [
  { index: 0, major: 'C', minor: 'Am', sharps: 0, flats: 0 },
  { index: 1, major: 'G', minor: 'Em', sharps: 1, flats: 0 },
  { index: 2, major: 'D', minor: 'Bm', sharps: 2, flats: 0 },
  { index: 3, major: 'A', minor: 'F♯m', sharps: 3, flats: 0 },
  { index: 4, major: 'E', minor: 'C♯m', sharps: 4, flats: 0 },
  { index: 5, major: 'B', minor: 'G♯m', sharps: 5, flats: 0 },
  { index: 6, major: 'F♯', minor: 'D♯m', sharps: 6, flats: 0 },
  { index: 7, major: 'D♭', minor: 'B♭m', sharps: 0, flats: 5 },
  { index: 8, major: 'A♭', minor: 'Fm', sharps: 0, flats: 4 },
  { index: 9, major: 'E♭', minor: 'Cm', sharps: 0, flats: 3 },
  { index: 10, major: 'B♭', minor: 'Gm', sharps: 0, flats: 2 },
  { index: 11, major: 'F', minor: 'Dm', sharps: 0, flats: 1 },
];

function dimChord(idx: number): string {
  // The diminished chord root is the minor key two steps clockwise (idx+2)
  return KEYS[(idx + 2) % 12].minor.replace(/m$/, '°');
}

function buildChordRows(idx: number, type: 'major' | 'minor', copy: (typeof COPY)[Language]): ChordRow[] {
  const prev = (idx - 1 + 12) % 12;
  const next = (idx + 1) % 12;
  if (type === 'major') {
    return [
      { numeral: 'I',    chord: KEYS[idx].major,  chordType: copy.major,      role: copy.roles.tonic,       state: 'tonic' },
      { numeral: 'ii',   chord: KEYS[prev].minor, chordType: copy.minor,      role: copy.roles.supertonic,  state: 'scale-minor' },
      { numeral: 'iii',  chord: KEYS[next].minor, chordType: copy.minor,      role: copy.roles.mediant,     state: 'scale-minor' },
      { numeral: 'IV',   chord: KEYS[prev].major, chordType: copy.major,      role: copy.roles.subdominant, state: 'scale-major' },
      { numeral: 'V',    chord: KEYS[next].major, chordType: copy.major,      role: copy.roles.dominant,    state: 'scale-major' },
      { numeral: 'vi',   chord: KEYS[idx].minor,  chordType: copy.minor,      role: copy.roles.submediant,  state: 'scale-minor' },
      { numeral: 'vii°', chord: dimChord(idx),    chordType: copy.diminished, role: copy.roles.leadingTone, state: 'scale-diminished' },
    ];
  } else {
    return [
      { numeral: 'i',   chord: KEYS[idx].minor,  chordType: copy.minor,      role: copy.roles.tonic,       state: 'tonic' },
      { numeral: 'iv',  chord: KEYS[prev].minor, chordType: copy.minor,      role: copy.roles.subdominant, state: 'scale-minor' },
      { numeral: 'v',   chord: KEYS[next].minor, chordType: copy.minor,      role: copy.roles.dominant,    state: 'scale-minor' },
      { numeral: 'III', chord: KEYS[idx].major,  chordType: copy.major,      role: copy.roles.mediant,     state: 'scale-major' },
      { numeral: 'VI',  chord: KEYS[prev].major, chordType: copy.major,      role: copy.roles.submediant,  state: 'scale-major' },
      { numeral: 'VII', chord: KEYS[next].major, chordType: copy.major,      role: copy.roles.subtonic,    state: 'scale-major' },
      { numeral: 'ii°', chord: dimChord(idx),    chordType: copy.diminished, role: copy.roles.supertonic,  state: 'scale-diminished' },
    ];
  }
}

@Component({
  selector: 'chord-section',
  standalone: true,
  imports: [NgClass],
  templateUrl: './chord-section.component.html',
  styleUrl: './chord-section.component.scss',
})
export class ChordSectionComponent {
  readonly chords = input<string[]>([]);
  readonly language = input<Language>('en');
  readonly text = computed(() => COPY[this.language()]);

  readonly match = computed(() => {
    const input = this.chords();
    if (!input.length) return null;
    const inputSet = new Set(input);
    let best: { idx: number; type: 'major' | 'minor'; score: number } | null = null;
    for (let idx = 0; idx < 12; idx++) {
      for (const type of ['major', 'minor'] as const) {
        // chord names are language-independent; COPY.en is a dummy for label fields
        const score = buildChordRows(idx, type, COPY.en).filter((r) => inputSet.has(r.chord)).length;
        if (!best || score > best.score) best = { idx, type, score };
      }
    }
    return best && best.score > 0 ? best : null;
  });

  readonly rows = computed(() => {
    const m = this.match();
    if (!m) return [];
    return buildChordRows(m.idx, m.type, this.text());
  });

  readonly info = computed(() => {
    const m = this.match();
    if (!m) return null;
    const copy = this.text();
    const key = KEYS[m.idx];
    return {
      fullName: `${m.type === 'major' ? key.major : key.minor} ${m.type === 'major' ? copy.major : copy.minor}`,
      relativeKey: m.type === 'major'
        ? `${copy.relativeMinor}: ${key.minor}`
        : `${copy.relativeMajor}: ${key.major}`,
    };
  });
}

@Component({
  selector: 'the-chords-circle-of-fifths',
  standalone: true,
  imports: [NgClass, ChordSectionComponent],
  templateUrl: './circle-of-fifths.html',
  styleUrl: './circle-of-fifths.scss',
  host: { '[attr.lang]': 'language()' },
})
export class CircleOfFifthsComponent {
  readonly language = input<Language>('en');
  readonly text = computed(() => COPY[this.language()]);
  readonly CX = 300;
  readonly CY = 300;

  readonly KEY_SIG = { inner: 250, outer: 288 };
  readonly MAJOR = { inner: 172, outer: 250 };
  readonly MINOR = { inner: 102, outer: 172 };

  readonly keys = KEYS;

  selectedIndex = signal<number | null>(null);
  selectedType = signal<'major' | 'minor' | null>(null);
  readonly activeProgressionDefs = signal<ProgressionDefinition[] | null>(null);
  readonly expandedCards = signal<Set<string>>(new Set());

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
    this.activeProgressionDefs.set(null);
    this.expandedCards.set(new Set());
  }

  randomizeProgressions(): void {
    const type = this.selectedType();
    if (!type) return;
    // ponytail: sort-shuffle is fine for UI randomness
    this.activeProgressionDefs.set([...PROGRESSIONS[type]].sort(() => Math.random() - 0.5).slice(0, 4));
    this.expandedCards.set(new Set());
  }

  toggleCard(name: string): void {
    this.expandedCards.update((set) => {
      const next = new Set(set);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });
  }

  copyChords(prog: { name: string; chords: string[]; sections: { label: string; chords: string[] }[] }): void {
    const text = this.expandedCards().has(prog.name)
      ? [`${this.text().verse}: ${prog.chords.join(', ')}`, ...prog.sections.map((s) => `${s.label}: ${s.chords.join(', ')}`)].join('; ')
      : prog.chords.join(', ');
    navigator.clipboard.writeText(text);
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


  get chordTable(): ChordRow[] {
    const idx = this.selectedIndex();
    const type = this.selectedType();
    if (idx === null || type === null) return [];
    return buildChordRows(idx, type, this.text());
  }

  get chordNames(): string[] {
    return this.chordTable.map((r) => r.chord);
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

  private deriveSections(numerals: string[], lookup: Map<string, string>): Section[] {
    const type = this.selectedType()!;
    const copy = this.text();
    const resolve = (ns: string[]) => ({ numerals: ns, chords: ns.map((n) => lookup.get(n) ?? n) });

    // Chorus: rotate to lift chord (IV for major, VI for minor); else fixed fallback
    const chorusPivot = type === 'major' ? 'IV' : 'VI';
    const chorusIdx = numerals.indexOf(chorusPivot);
    const chorus = chorusIdx > 0
      ? resolve([...numerals.slice(chorusIdx), ...numerals.slice(0, chorusIdx)])
      : resolve(type === 'major' ? ['I', 'IV', 'V', 'I'] : ['i', 'VI', 'III', 'VII']);

    // Bridge: rotate to contrast chord (vi for major, III for minor); else fixed fallback
    const bridgePivot = type === 'major' ? 'vi' : 'III';
    const bridgeIdx = numerals.indexOf(bridgePivot);
    const bridge = bridgeIdx >= 0
      ? resolve([...numerals.slice(bridgeIdx), ...numerals.slice(0, bridgeIdx)])
      : resolve(type === 'major' ? ['vi', 'IV', 'ii', 'V'] : ['III', 'VII', 'VI', 'iv']);

    // Outro: fixed resolving pattern per mode
    const outro = resolve(type === 'major' ? ['I', 'V', 'IV', 'I'] : ['i', 'VII', 'VI', 'i']);

    return [
      { label: copy.chorus, ...chorus },
      { label: copy.bridge, ...bridge },
      { label: copy.outro, ...outro },
    ];
  }

  get progressions(): Progression[] {
    const table = this.chordTable;
    if (!table.length) return [];
    const lookup = new Map(table.map((r) => [r.numeral, r.chord]));
    const language = this.language();
    const type = this.selectedType() === 'major' ? 'major' : 'minor';
    const defs = this.activeProgressionDefs() ?? PROGRESSIONS[type].slice(0, 4);
    return defs.map((definition) => ({
      name: definition.name[language],
      mood: definition.mood[language],
      genre: definition.genre[language],
      numerals: definition.numerals,
      chords: definition.numerals.map((numeral) => lookup.get(numeral) ?? numeral),
      sections: this.deriveSections(definition.numerals, lookup),
    }));
  }
}
