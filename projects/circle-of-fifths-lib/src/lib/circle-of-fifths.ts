import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { NgClass } from '@angular/common';
import { ChordDiagram, ChordService } from '@gblp/chord-finder';

import { KEYS, COPY, Language, LocalizedText } from './circle-of-fifths-data';
import { CircleOfFifthsWheel } from './components/circle-of-fifths-wheel/circle-of-fifths-wheel';

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
  nameEn: string;
  name: string;
  mood: string;
  genre: string;
  numerals: string[];
  chords: string[];
  sections: Section[];
  transposeIdx: number;
  spiceLevel: number;
}

interface ProgressionDefinition {
  name: LocalizedText;
  mood: LocalizedText;
  genre: LocalizedText;
  numerals: string[];
}

// Numeral-count varies per progression (3-6) so Verse length isn't uniformly
// 4 across the pool — see deriveSections() for section-length variety too.
const PROGRESSIONS: Record<'major' | 'minor', ProgressionDefinition[]> = {
  major: [
    {
      name: { en: 'Anthemic', es: 'Épica' },
      mood: { en: '😄 Joyful', es: '😄 Alegre' },
      genre: { en: 'Folk, Rock', es: 'Folk, rock' },
      numerals: ['I', 'IV', 'V'],
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
      numerals: ['vi', 'IV', 'I', 'V', 'ii', 'V'],
    },
    {
      name: { en: 'Cinematic', es: 'Cinemática' },
      mood: { en: '🎬 Tense', es: '🎬 Tensa' },
      genre: { en: 'Film, Jazz', es: 'Cine, jazz' },
      numerals: ['ii', 'V', 'I'],
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
      numerals: ['IV', 'V', 'iii', 'vi', 'ii'],
    },
    {
      name: { en: 'Gospel', es: 'Gospel' },
      mood: { en: '🙏 Uplifting', es: '🙏 Elevadora' },
      genre: { en: 'Gospel, Soul', es: 'Gospel, soul' },
      numerals: ['I', 'IV', 'ii', 'V', 'I'],
    },
    {
      name: { en: 'Bittersweet', es: 'Agridulce' },
      mood: { en: '🍂 Bittersweet', es: '🍂 Agridulce' },
      genre: { en: 'Alt Rock, Indie', es: 'Rock alternativo, indie' },
      numerals: ['I', 'iii', 'IV', 'V', 'vi', 'IV'],
    },
    {
      name: { en: 'Anxious', es: 'Ansiosa' },
      mood: { en: '😰 Anxious', es: '😰 Ansiosa' },
      genre: { en: 'Post-Punk, Alt', es: 'Post-punk, alternativo' },
      numerals: ['vi', 'ii', 'V'],
    },
    {
      name: { en: 'Triumphant', es: 'Triunfal' },
      mood: { en: '🏆 Triumphant', es: '🏆 Triunfal' },
      genre: { en: 'Orchestral, Rock', es: 'Orquestal, rock' },
      numerals: ['I', 'V', 'vi', 'iii', 'IV', 'V'],
    },
    {
      name: { en: 'Playful', es: 'Juguetona' },
      mood: { en: '🎈 Playful', es: '🎈 Juguetona' },
      genre: { en: "Children's, Pop", es: 'Infantil, pop' },
      numerals: ['I', 'IV', 'I', 'V'],
    },
    {
      name: { en: 'Sultry', es: 'Sensual' },
      mood: { en: '🌆 Sultry', es: '🌆 Sensual' },
      genre: { en: 'R&B, Neo-Soul', es: 'R&B, neo-soul' },
      numerals: ['ii', 'V', 'I', 'vi', 'ii'],
    },
  ],
  minor: [
    {
      name: { en: 'Brooding', es: 'Sombría' },
      mood: { en: '🌑 Dark', es: '🌑 Oscura' },
      genre: { en: 'Rock, Metal', es: 'Rock, metal' },
      numerals: ['i', 'VII', 'VI'],
    },
    {
      name: { en: 'Haunting', es: 'Inquietante' },
      mood: { en: '👻 Mysterious', es: '👻 Misteriosa' },
      genre: { en: 'Film, Gothic', es: 'Cine, gótico' },
      numerals: ['i', 'iv', 'VII', 'III', 'VII'],
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
      numerals: ['i', 'v', 'VI', 'VII', 'iv', 'VII'],
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
      numerals: ['i', 'iv', 'v'],
    },
    {
      name: { en: 'Epic', es: 'Épica' },
      mood: { en: '⚔️ Heroic', es: '⚔️ Heroico' },
      genre: { en: 'Epic, Orchestral', es: 'Épica, orquestal' },
      numerals: ['i', 'III', 'VII', 'VI', 'iv', 'v'],
    },
    {
      name: { en: 'Ethereal', es: 'Etérea' },
      mood: { en: '🌊 Hypnotic', es: '🌊 Hipnótica' },
      genre: { en: 'Ambient, Post-Rock', es: 'Ambient, post-rock' },
      numerals: ['i', 'VI', 'iv', 'VII', 'i'],
    },
    {
      name: { en: 'Somber', es: 'Lúgubre' },
      mood: { en: '🖤 Somber', es: '🖤 Lúgubre' },
      genre: { en: 'Doom, Ambient', es: 'Doom, ambient' },
      numerals: ['i', 'VI', 'iv'],
    },
    {
      name: { en: 'Restless', es: 'Inquieta' },
      mood: { en: '🌀 Restless', es: '🌀 Inquieta' },
      genre: { en: 'Trip-Hop, Industrial', es: 'Trip-hop, industrial' },
      numerals: ['i', 'iv', 'VII', 'III', 'VI', 'v'],
    },
    {
      name: { en: 'Yearning', es: 'Anhelante' },
      mood: { en: '🕯️ Yearning', es: '🕯️ Anhelante' },
      genre: { en: 'Neo-Classical, Piano', es: 'Neoclásica, piano' },
      numerals: ['i', 'v', 'iv', 'i'],
    },
    {
      name: { en: 'Defiant', es: 'Desafiante' },
      mood: { en: '🔥 Defiant', es: '🔥 Desafiante' },
      genre: { en: 'Punk, Metal', es: 'Punk, metal' },
      numerals: ['i', 'VII', 'iv', 'VI', 'VII'],
    },
  ],
};

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
      { numeral: 'ii°', chord: dimChord(idx),    chordType: copy.diminished, role: copy.roles.supertonic,  state: 'scale-diminished' },
      { numeral: 'III', chord: KEYS[idx].major,  chordType: copy.major,      role: copy.roles.mediant,     state: 'scale-major' },
      { numeral: 'iv',  chord: KEYS[prev].minor, chordType: copy.minor,      role: copy.roles.subdominant, state: 'scale-minor' },
      { numeral: 'v',   chord: KEYS[next].minor, chordType: copy.minor,      role: copy.roles.dominant,    state: 'scale-minor' },
      { numeral: 'VI',  chord: KEYS[prev].major, chordType: copy.major,      role: copy.roles.submediant,  state: 'scale-major' },
      { numeral: 'VII', chord: KEYS[next].major, chordType: copy.major,      role: copy.roles.subtonic,    state: 'scale-major' },
    ];
  }
}

// Suffix to append per numeral at spice levels 1, 2, 3.
// Minor chords already carry 'm' (e.g. "Dm"), so suffix starts from the number.
// Diminished chords carry '°' which gets replaced entirely.
const SPICE_SUFFIXES: Record<string, readonly [string, string, string]> = {
  'I':    ['maj7', 'maj9',    'maj9'      ],
  'ii':   ['7',    '9',       '11'        ],
  'iii':  ['7',    '7',       '7'         ],
  'IV':   ['maj7', 'maj9',    'maj7♯11'   ],
  'V':    ['7',    '9',       '13'        ],
  'vi':   ['7',    '9',       '11'        ],
  'vii°': ['m7♭5', 'm7♭5',   'm7♭5'      ],
  'i':    ['7',    '9',       '9'         ],
  'iv':   ['7',    '9',       '11'        ],
  'v':    ['7',    '7',       '7'         ],
  'III':  ['maj7', 'maj7',    'maj7'      ],
  'VI':   ['maj7', 'maj9',    'maj9'      ],
  'VII':  ['7',    '9',       '13'        ],
  'ii°':  ['m7♭5', 'm7♭5',   'm7♭5'      ],
};

// Each section type has its own characteristic length (a chorus tends to run
// longer than a bridge) instead of every section being forced to match the
// Verse's length.
const SECTION_LENGTH = { chorus: 6, bridge: 2, outro: 3 } as const;

// Truncates when longer than target, or loops the pattern back to its start
// to fill out a target longer than the source — e.g. a 3-chord loop played
// twice makes a perfectly normal 6-chord chorus.
function resizeToLength(numerals: string[], targetLength: number): string[] {
  if (numerals.length === targetLength) return numerals;
  return Array.from({ length: targetLength }, (_, i) => numerals[i % numerals.length]);
}

function spiceChord(chord: string, numeral: string, level: number): string {
  if (level === 0) return chord;
  const suffixes = SPICE_SUFFIXES[numeral];
  if (!suffixes) return chord;
  const suffix = suffixes[level - 1];
  // Diminished chords: strip '°', then the suffix already starts with 'm'
  return chord.endsWith('°') ? chord.slice(0, -1) + suffix : chord + suffix;
}

@Component({
  selector: 'chord-section',
  standalone: true,
  imports: [NgClass, ChordDiagram],
  templateUrl: './chord-section.component.html',
  styleUrl: './chord-section.component.scss',
})
export class ChordSectionComponent {
  private readonly chordService = inject(ChordService);

  readonly selectedIndex = input<number | null>(null);
  readonly selectedType = input<'major' | 'minor' | null>(null);
  readonly language = input<Language>('en');
  readonly text = computed(() => COPY[this.language()]);

  // Defaults to expanded so the diagram grid is visible without an extra click.
  readonly diagramsExpanded = signal(true);

  // Per-diagram fret position, keyed by ChordSearchResult.id.
  readonly positionIndices = signal<Record<string, number>>({});

  constructor() {
    // A new key means a new set of diagrams — don't carry stale position
    // choices over from the previous key's chords.
    effect(() => {
      this.selectedIndex();
      this.selectedType();
      this.positionIndices.set({});
    });
  }

  toggleDiagrams(): void {
    this.diagramsExpanded.update((v) => !v);
  }

  positionIndexFor(id: string): number {
    return this.positionIndices()[id] ?? 0;
  }

  stepPosition(id: string, total: number, delta: number): void {
    if (total <= 1) return;
    this.positionIndices.update((m) => ({
      ...m,
      [id]: ((m[id] ?? 0) + delta + total) % total,
    }));
  }

  stepAllPositions(delta: number): void {
    this.positionIndices.update((m) => {
      const next = { ...m };
      for (const result of this.chordDiagrams()) {
        const total = result.positions.length;
        if (total <= 1) continue;
        next[result.id] = ((next[result.id] ?? 0) + delta + total) % total;
      }
      return next;
    });
  }

  readonly rows = computed(() => {
    const idx = this.selectedIndex();
    const type = this.selectedType();
    if (idx === null || type === null) return [];
    return buildChordRows(idx, type, this.text());
  });

  readonly info = computed(() => {
    const idx = this.selectedIndex();
    const type = this.selectedType();
    if (idx === null || type === null) return null;
    const copy = this.text();
    const key = KEYS[idx];
    return {
      fullName: `${type === 'major' ? key.major : key.minor} ${type === 'major' ? copy.major : copy.minor}`,
      relativeKey: type === 'major'
        ? `${copy.relativeMinor}: ${key.minor}`
        : `${copy.relativeMajor}: ${key.major}`,
    };
  });

  readonly chordDiagrams = computed(() => {
    const rows = this.rows();
    if (!rows.length) return [];
    return this.chordService
      .search(rows.map((r) => r.chord).join(','), this.language())
      .filter((r) => !r.error && r.positions.length > 0);
  });
}

@Component({
  selector: 'the-chords-circle-of-fifths',
  standalone: true,
  imports: [ChordSectionComponent, CircleOfFifthsWheel],
  templateUrl: './circle-of-fifths.html',
  styleUrl: './circle-of-fifths.scss',
  host: { '[attr.lang]': 'language()' },
})
export class CircleOfFifthsComponent {
  readonly language = input<Language>('en');
  readonly text = computed(() => COPY[this.language()]);

  // Defaults to C major so the page never starts on an empty "click a key" state —
  // the diatonic chords and progressions sections render immediately on load.
  selectedIndex = signal<number | null>(0);
  selectedType = signal<'major' | 'minor' | null>('major');
  readonly activeProgressionDefs = signal<ProgressionDefinition[] | null>(null);
  readonly expandedCards = signal<Set<string>>(new Set());
  readonly transposeMap = signal<Map<string, number>>(new Map());
  readonly spiceMap = signal<Map<string, number>>(new Map());

  constructor() {
    // Restore selected key from URL hash (format: #{index}-{type})
    const [idxStr, type] = location.hash.slice(1).split('-');
    const idx = Number(idxStr);
    if (!isNaN(idx) && idx >= 0 && idx < 12 && (type === 'major' || type === 'minor')) {
      this.selectedIndex.set(idx);
      this.selectedType.set(type as 'major' | 'minor');
    }
    // Keep URL hash in sync with selected key
    effect(() => {
      const idx = this.selectedIndex();
      const type = this.selectedType();
      const hash = idx !== null && type !== null ? `#${idx}-${type}` : '';
      history.replaceState(null, '', location.pathname + location.search + hash);
    });
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
    this.transposeMap.set(new Map());
    this.spiceMap.set(new Map());
  }

  randomizeProgressions(): void {
    const type = this.selectedType();
    if (!type) return;
    // ponytail: sort-shuffle is fine for UI randomness
    this.activeProgressionDefs.set([...PROGRESSIONS[type]].sort(() => Math.random() - 0.5).slice(0, 4));
    this.expandedCards.set(new Set());
    this.transposeMap.set(new Map());
    this.spiceMap.set(new Map());
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

  setTranspose(nameEn: string, targetIdx: number): void {
    this.transposeMap.update((m) => {
      const next = new Map(m);
      targetIdx === this.selectedIndex() ? next.delete(nameEn) : next.set(nameEn, targetIdx);
      return next;
    });
  }

  cycleSpice(nameEn: string): void {
    this.spiceMap.update((m) => {
      const next = new Map(m);
      const nextLevel = ((next.get(nameEn) ?? 0) + 1) % 4;
      nextLevel === 0 ? next.delete(nameEn) : next.set(nameEn, nextLevel);
      return next;
    });
  }

  get transposeKeys(): { idx: number; name: string }[] {
    const type = this.selectedType();
    if (!type) return [];
    return KEYS.map((k) => ({ idx: k.index, name: type === 'major' ? k.major : k.minor }));
  }

  get chordTable(): ChordRow[] {
    const idx = this.selectedIndex();
    const type = this.selectedType();
    if (idx === null || type === null) return [];
    return buildChordRows(idx, type, this.text());
  }

  get selectedInfo(): { fullName: string } | null {
    const idx = this.selectedIndex();
    const type = this.selectedType();
    if (idx === null || type === null) return null;
    const key = KEYS[idx];
    const copy = this.text();
    return { fullName: `${type === 'major' ? key.major : key.minor} ${type === 'major' ? copy.major : copy.minor}` };
  }

  private deriveSections(numerals: string[], lookup: Map<string, string>): Section[] {
    const type = this.selectedType()!;
    const copy = this.text();
    const resolve = (ns: string[]) => ({ numerals: ns, chords: ns.map((n) => lookup.get(n) ?? n) });

    // Chorus: rotate to lift chord (IV for major, VI for minor); else fixed fallback.
    // Resized to its own typical length so it doesn't just mirror the Verse's.
    const chorusPivot = type === 'major' ? 'IV' : 'VI';
    const chorusIdx = numerals.indexOf(chorusPivot);
    const chorusBase = chorusIdx > 0
      ? [...numerals.slice(chorusIdx), ...numerals.slice(0, chorusIdx)]
      : type === 'major' ? ['I', 'IV', 'V', 'I'] : ['i', 'VI', 'III', 'VII'];
    const chorus = resolve(resizeToLength(chorusBase, SECTION_LENGTH.chorus));

    // Bridge: rotate to contrast chord (vi for major, III for minor); else fixed fallback.
    const bridgePivot = type === 'major' ? 'vi' : 'III';
    const bridgeIdx = numerals.indexOf(bridgePivot);
    const bridgeBase = bridgeIdx >= 0
      ? [...numerals.slice(bridgeIdx), ...numerals.slice(0, bridgeIdx)]
      : type === 'major' ? ['vi', 'IV', 'ii', 'V'] : ['III', 'VII', 'VI', 'iv'];
    const bridge = resolve(resizeToLength(bridgeBase, SECTION_LENGTH.bridge));

    // Outro: fixed resolving pattern per mode, sized to its own typical length.
    const outroBase = type === 'major' ? ['I', 'V', 'IV', 'I'] : ['i', 'VII', 'VI', 'i'];
    const outro = resolve(resizeToLength(outroBase, SECTION_LENGTH.outro));

    return [
      { label: copy.chorus, ...chorus },
      { label: copy.bridge, ...bridge },
      { label: copy.outro, ...outro },
    ];
  }

  get progressions(): Progression[] {
    const table = this.chordTable;
    if (!table.length) return [];
    const selIdx = this.selectedIndex()!;
    const transposeMap = this.transposeMap();
    const spiceMap = this.spiceMap();
    const language = this.language();
    const type = this.selectedType() === 'major' ? 'major' : 'minor';
    const defs = this.activeProgressionDefs() ?? PROGRESSIONS[type].slice(0, 4);
    return defs.map((definition) => {
      const targetIdx = transposeMap.get(definition.name.en) ?? selIdx;
      const spiceLevel = spiceMap.get(definition.name.en) ?? 0;
      const baseRows = buildChordRows(targetIdx, type, this.text());
      const lookup = new Map(
        baseRows.map((r) => [r.numeral, spiceChord(r.chord, r.numeral, spiceLevel)]),
      );
      return {
        nameEn: definition.name.en,
        name: definition.name[language],
        mood: definition.mood[language],
        genre: definition.genre[language],
        numerals: definition.numerals,
        chords: definition.numerals.map((n) => lookup.get(n) ?? n),
        sections: this.deriveSections(definition.numerals, lookup),
        transposeIdx: targetIdx,
        spiceLevel,
      };
    });
  }
}
