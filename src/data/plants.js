// Each plant has an svgIcon: a self-contained SVG string rendered inline.
// No external URLs, no hotlink issues, works everywhere forever.

const plants = [
  {
    id: 'cherry-bomb-ninebark',
    commonName: 'Cherry Bomb Ninebark',
    botanicalName: "Physocarpus opulifolius 'Jefam'",
    type: 'shrub',
    matureWidth: 5,
    matureHeight: 5,
    bloomTime: ['May', 'June'],
    bloomColor: '#e8b0c0',
    foliageColor: 'deep burgundy-red',
    sunRequirement: 'Full sun',
    waterNeeds: 'Low',
    clayTolerant: true,
    deerResistance: 'high',
    zone: '2-7',
    color: '#7a3055',
    // Rounded mounding shrub, deep burgundy lobed leaves, small pink flower clusters
    svgIcon: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="50" cy="62" rx="42" ry="32" fill="#5a1e3a"/>
      <ellipse cx="50" cy="58" rx="38" ry="30" fill="#7a2d52"/>
      <ellipse cx="30" cy="55" rx="18" ry="22" fill="#6b2447"/>
      <ellipse cx="68" cy="53" rx="18" ry="22" fill="#6b2447"/>
      <ellipse cx="50" cy="44" rx="20" ry="24" fill="#8a3460"/>
      <!-- lobed leaf shapes -->
      <ellipse cx="38" cy="42" rx="9" ry="12" fill="#7a2d52" transform="rotate(-20 38 42)"/>
      <ellipse cx="62" cy="40" rx="9" ry="12" fill="#7a2d52" transform="rotate(20 62 40)"/>
      <ellipse cx="50" cy="34" rx="9" ry="11" fill="#8a3460"/>
      <!-- pink flower clusters at top -->
      <circle cx="38" cy="30" r="5" fill="#e8a0b8"/>
      <circle cx="50" cy="24" r="6" fill="#f0b0c8"/>
      <circle cx="62" cy="30" r="5" fill="#e8a0b8"/>
      <circle cx="44" cy="25" r="3" fill="#f8c8d8"/>
      <circle cx="56" cy="25" r="3" fill="#f8c8d8"/>
    </svg>`,
    notes: 'Dramatic dark burgundy foliage all season. Extremely tough — clay, drought, Zone 6 cold all fine. Illinois native selection.',
  },
  {
    id: 'incrediball-hydrangea',
    commonName: 'Incrediball Hydrangea',
    botanicalName: "Hydrangea arborescens 'Abetwo'",
    type: 'shrub',
    matureWidth: 5,
    matureHeight: 4,
    bloomTime: ['July', 'August', 'September'],
    bloomColor: '#f0efe6',
    foliageColor: 'medium green',
    sunRequirement: 'Part sun',
    waterNeeds: 'Moderate',
    clayTolerant: true,
    deerResistance: 'moderate',
    zone: '3-9',
    color: '#c8c8b8',
    // Rounded shrub, large white snowball blooms, medium green leaves
    svgIcon: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <!-- green foliage base -->
      <ellipse cx="50" cy="68" rx="40" ry="26" fill="#3a6b30"/>
      <ellipse cx="32" cy="60" rx="18" ry="20" fill="#4a7a3a"/>
      <ellipse cx="68" cy="60" rx="18" ry="20" fill="#4a7a3a"/>
      <ellipse cx="50" cy="55" rx="22" ry="20" fill="#558840"/>
      <!-- large white globes -->
      <circle cx="34" cy="42" r="16" fill="#e8e8e0"/>
      <circle cx="34" cy="42" r="16" fill="none" stroke="#d0d0c8" stroke-width="0.5"/>
      <circle cx="66" cy="44" r="14" fill="#ececE4"/>
      <circle cx="50" cy="34" r="17" fill="#f0f0e8"/>
      <!-- petal texture dots on blooms -->
      <circle cx="50" cy="27" r="3" fill="#e0e0d8"/>
      <circle cx="44" cy="30" r="2.5" fill="#e0e0d8"/>
      <circle cx="56" cy="30" r="2.5" fill="#e0e0d8"/>
      <circle cx="42" cy="36" r="2.5" fill="#e8e8e0"/>
      <circle cx="58" cy="36" r="2.5" fill="#e8e8e0"/>
      <circle cx="29" cy="38" r="2.5" fill="#d8d8d0"/>
      <circle cx="39" cy="35" r="2" fill="#d8d8d0"/>
    </svg>`,
    notes: 'Enormous white globes July–September. Cut back hard in early spring. One of the most reliable shrubs for Zone 6.',
  },
  {
    id: 'little-lime-hydrangea',
    commonName: 'Little Lime Hydrangea',
    botanicalName: "Hydrangea paniculata 'Jane'",
    type: 'shrub',
    matureWidth: 4,
    matureHeight: 5,
    bloomTime: ['July', 'August', 'September'],
    bloomColor: '#b8d870',
    foliageColor: 'medium green',
    sunRequirement: 'Full sun',
    waterNeeds: 'Moderate',
    clayTolerant: true,
    deerResistance: 'moderate',
    zone: '3-8',
    color: '#a8c860',
    // Upright shrub, cone-shaped panicle blooms in lime-green
    svgIcon: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <!-- green foliage -->
      <ellipse cx="50" cy="70" rx="36" ry="22" fill="#3a6b30"/>
      <ellipse cx="34" cy="62" rx="16" ry="18" fill="#4a7a3a"/>
      <ellipse cx="66" cy="62" rx="16" ry="18" fill="#4a7a3a"/>
      <!-- panicle cone bloom - lime green aging to pink -->
      <ellipse cx="50" cy="46" rx="14" ry="22" fill="#c8e080"/>
      <ellipse cx="50" cy="46" rx="11" ry="20" fill="#d4e890"/>
      <!-- individual florets on panicle -->
      <ellipse cx="44" cy="38" rx="4" ry="5" fill="#e0f0a0"/>
      <ellipse cx="56" cy="38" rx="4" ry="5" fill="#e0f0a0"/>
      <ellipse cx="50" cy="32" rx="4" ry="5" fill="#e8f8b0"/>
      <ellipse cx="44" cy="48" rx="4" ry="4" fill="#c8dc80" />
      <ellipse cx="56" cy="48" rx="4" ry="4" fill="#c8dc80" />
      <ellipse cx="50" cy="54" rx="5" ry="4" fill="#b8cc70"/>
      <!-- pink tinge at base = fall color -->
      <ellipse cx="50" cy="58" rx="7" ry="4" fill="#e8a0b0" opacity="0.5"/>
    </svg>`,
    notes: 'Compact Limelight. Green blooms age to pink in fall. Prune in early spring.',
  },
  {
    id: 'walker-low-catmint',
    commonName: "Walker's Low Catmint",
    botanicalName: "Nepeta x faassenii 'Walker's Low'",
    type: 'perennial',
    matureWidth: 3,
    matureHeight: 2,
    bloomTime: ['May', 'June', 'July', 'August'],
    bloomColor: '#9880c8',
    foliageColor: 'silver-green',
    sunRequirement: 'Full sun',
    waterNeeds: 'Low',
    clayTolerant: true,
    deerResistance: 'high',
    zone: '3-8',
    color: '#8878b8',
    // Low mounding, silver-green fine foliage, lavender-purple spike flowers
    svgIcon: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <!-- silver-green mounding foliage -->
      <ellipse cx="50" cy="72" rx="44" ry="22" fill="#7a9068"/>
      <ellipse cx="50" cy="66" rx="40" ry="20" fill="#8aa078"/>
      <ellipse cx="28" cy="64" rx="18" ry="16" fill="#9ab088"/>
      <ellipse cx="72" cy="64" rx="18" ry="16" fill="#9ab088"/>
      <ellipse cx="50" cy="60" rx="22" ry="18" fill="#a0b890"/>
      <!-- fine-textured silver highlights -->
      <ellipse cx="38" cy="58" rx="8" ry="5" fill="#b8c8a8" opacity="0.7"/>
      <ellipse cx="62" cy="56" rx="8" ry="5" fill="#b8c8a8" opacity="0.7"/>
      <!-- lavender flower spikes -->
      <rect x="28" y="36" width="5" height="24" rx="2.5" fill="#9070c0"/>
      <rect x="40" y="28" width="5" height="28" rx="2.5" fill="#a080d0"/>
      <rect x="52" y="24" width="5" height="32" rx="2.5" fill="#9878c8"/>
      <rect x="64" y="30" width="5" height="26" rx="2.5" fill="#a080d0"/>
      <rect x="74" y="38" width="4" height="20" rx="2" fill="#9070c0"/>
      <!-- tiny florets on spikes -->
      <circle cx="30" cy="34" r="3" fill="#b098d8"/>
      <circle cx="42" cy="26" r="3" fill="#b098d8"/>
      <circle cx="54" cy="22" r="3.5" fill="#c0a8e0"/>
      <circle cx="66" cy="28" r="3" fill="#b098d8"/>
      <circle cx="76" cy="36" r="2.5" fill="#a888c8"/>
    </svg>`,
    notes: 'Perennial Plant of the Year 2007. Cut back by half after first bloom for a second flush. Thrives in clay once established.',
  },
  {
    id: 'rozanne-geranium',
    commonName: 'Rozanne Geranium',
    botanicalName: "Geranium 'Gerwat'",
    type: 'perennial',
    matureWidth: 3,
    matureHeight: 1.5,
    bloomTime: ['May', 'June', 'July', 'August', 'September', 'October'],
    bloomColor: '#6868b8',
    foliageColor: 'medium green',
    sunRequirement: 'Part sun',
    waterNeeds: 'Moderate',
    clayTolerant: true,
    deerResistance: 'high',
    zone: '4-8',
    color: '#6060a8',
    // Low spreading mat, deeply lobed leaves, violet-blue 5-petal flowers
    svgIcon: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <!-- spreading green mat -->
      <ellipse cx="50" cy="74" rx="44" ry="18" fill="#3a6830"/>
      <ellipse cx="50" cy="68" rx="40" ry="18" fill="#4a7838"/>
      <!-- lobed leaves scattered -->
      <ellipse cx="24" cy="64" rx="12" ry="9" fill="#558840" transform="rotate(-15 24 64)"/>
      <ellipse cx="76" cy="62" rx="12" ry="9" fill="#558840" transform="rotate(15 76 62)"/>
      <ellipse cx="50" cy="62" rx="13" ry="9" fill="#608848"/>
      <ellipse cx="36" cy="60" rx="10" ry="8" fill="#508040" transform="rotate(-10 36 60)"/>
      <ellipse cx="64" cy="60" rx="10" ry="8" fill="#508040" transform="rotate(10 64 60)"/>
      <!-- violet-blue 5-petal flowers -->
      <g transform="translate(26,44)">
        <circle cx="0" cy="-8" r="5" fill="#7878c8"/>
        <circle cx="7.6" cy="-2.5" r="5" fill="#7878c8"/>
        <circle cx="4.7" cy="6.5" r="5" fill="#7878c8"/>
        <circle cx="-4.7" cy="6.5" r="5" fill="#7878c8"/>
        <circle cx="-7.6" cy="-2.5" r="5" fill="#7878c8"/>
        <circle cx="0" cy="0" r="3.5" fill="#f8f0a0"/>
      </g>
      <g transform="translate(50,36)">
        <circle cx="0" cy="-9" r="5.5" fill="#8080d0"/>
        <circle cx="8.6" cy="-2.8" r="5.5" fill="#8080d0"/>
        <circle cx="5.3" cy="7.3" r="5.5" fill="#8080d0"/>
        <circle cx="-5.3" cy="7.3" r="5.5" fill="#8080d0"/>
        <circle cx="-8.6" cy="-2.8" r="5.5" fill="#8080d0"/>
        <circle cx="0" cy="0" r="4" fill="#f8f0a0"/>
      </g>
      <g transform="translate(74,46)">
        <circle cx="0" cy="-8" r="5" fill="#7070c0"/>
        <circle cx="7.6" cy="-2.5" r="5" fill="#7070c0"/>
        <circle cx="4.7" cy="6.5" r="5" fill="#7070c0"/>
        <circle cx="-4.7" cy="6.5" r="5" fill="#7070c0"/>
        <circle cx="-7.6" cy="-2.5" r="5" fill="#7070c0"/>
        <circle cx="0" cy="0" r="3.5" fill="#f8f0a0"/>
      </g>
    </svg>`,
    notes: 'Perennial Plant of the Year 2008. Blooms May through hard frost — longest season of any geranium. Low spreading mat.',
  },
  {
    id: 'black-eyed-susan',
    commonName: 'Goldsturm Black-Eyed Susan',
    botanicalName: "Rudbeckia fulgida var. sullivantii 'Goldsturm'",
    type: 'perennial',
    matureWidth: 2,
    matureHeight: 2.5,
    bloomTime: ['July', 'August', 'September'],
    bloomColor: '#e8b820',
    foliageColor: 'dark green',
    sunRequirement: 'Full sun',
    waterNeeds: 'Low',
    clayTolerant: true,
    deerResistance: 'high',
    zone: '3-9',
    color: '#c89810',
    // Upright clump, dark green leaves, golden daisy flowers with dark brown centers
    svgIcon: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <!-- dark green foliage clump -->
      <ellipse cx="50" cy="74" rx="36" ry="18" fill="#2a5020"/>
      <ellipse cx="32" cy="66" rx="14" ry="20" fill="#306028"/>
      <ellipse cx="68" cy="66" rx="14" ry="20" fill="#306028"/>
      <ellipse cx="50" cy="62" rx="16" ry="20" fill="#387030"/>
      <!-- golden daisy flowers - ray petals + dark center -->
      <g transform="translate(30,38)">
        <ellipse cx="0" cy="-11" rx="3.5" ry="7" fill="#e8b820"/>
        <ellipse cx="7.8" cy="-7.8" rx="3.5" ry="7" fill="#e8b820" transform="rotate(45 7.8 -7.8)"/>
        <ellipse cx="11" cy="0" rx="3.5" ry="7" fill="#e8b820" transform="rotate(90 11 0)"/>
        <ellipse cx="7.8" cy="7.8" rx="3.5" ry="7" fill="#e8b820" transform="rotate(135 7.8 7.8)"/>
        <ellipse cx="0" cy="11" rx="3.5" ry="7" fill="#e8b820" transform="rotate(180 0 11)"/>
        <ellipse cx="-7.8" cy="7.8" rx="3.5" ry="7" fill="#e8b820" transform="rotate(225 -7.8 7.8)"/>
        <ellipse cx="-11" cy="0" rx="3.5" ry="7" fill="#e8b820" transform="rotate(270 -11 0)"/>
        <ellipse cx="-7.8" cy="-7.8" rx="3.5" ry="7" fill="#e8b820" transform="rotate(315 -7.8 -7.8)"/>
        <circle cx="0" cy="0" r="6" fill="#2a1a08"/>
      </g>
      <g transform="translate(60,30)">
        <ellipse cx="0" cy="-12" rx="4" ry="7.5" fill="#f0c030"/>
        <ellipse cx="8.5" cy="-8.5" rx="4" ry="7.5" fill="#f0c030" transform="rotate(45 8.5 -8.5)"/>
        <ellipse cx="12" cy="0" rx="4" ry="7.5" fill="#f0c030" transform="rotate(90 12 0)"/>
        <ellipse cx="8.5" cy="8.5" rx="4" ry="7.5" fill="#f0c030" transform="rotate(135 8.5 8.5)"/>
        <ellipse cx="0" cy="12" rx="4" ry="7.5" fill="#f0c030" transform="rotate(180 0 12)"/>
        <ellipse cx="-8.5" cy="8.5" rx="4" ry="7.5" fill="#f0c030" transform="rotate(225 -8.5 8.5)"/>
        <ellipse cx="-12" cy="0" rx="4" ry="7.5" fill="#f0c030" transform="rotate(270 -12 0)"/>
        <ellipse cx="-8.5" cy="-8.5" rx="4" ry="7.5" fill="#f0c030" transform="rotate(315 -8.5 -8.5)"/>
        <circle cx="0" cy="0" r="7" fill="#1e1208"/>
      </g>
      <!-- stem -->
      <line x1="50" y1="62" x2="60" y2="38" stroke="#387030" stroke-width="1.5"/>
      <line x1="40" y1="62" x2="30" y2="46" stroke="#387030" stroke-width="1.5"/>
    </svg>`,
    notes: 'Midwest workhorse. Extremely clay tolerant. Seed heads feed birds through winter.',
  },
  {
    id: 'karl-foerster-grass',
    commonName: 'Karl Foerster Grass',
    botanicalName: "Calamagrostis x acutiflora 'Karl Foerster'",
    type: 'grass',
    matureWidth: 2,
    matureHeight: 5,
    bloomTime: ['June', 'July'],
    bloomColor: '#c0a858',
    foliageColor: 'green',
    sunRequirement: 'Full sun',
    waterNeeds: 'Moderate',
    clayTolerant: true,
    deerResistance: 'high',
    zone: '4-9',
    color: '#a89040',
    // Strongly upright narrow clump, tall feathery plumes
    svgIcon: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <!-- upright narrow blades from base -->
      <path d="M50 85 Q46 60 42 20" stroke="#4a7030" stroke-width="2" fill="none"/>
      <path d="M50 85 Q48 62 46 28" stroke="#558038" stroke-width="2" fill="none"/>
      <path d="M50 85 Q50 60 50 22" stroke="#4a7030" stroke-width="2.5" fill="none"/>
      <path d="M50 85 Q52 62 54 28" stroke="#558038" stroke-width="2" fill="none"/>
      <path d="M50 85 Q54 60 58 20" stroke="#4a7030" stroke-width="2" fill="none"/>
      <path d="M50 85 Q44 65 38 30" stroke="#608840" stroke-width="1.5" fill="none"/>
      <path d="M50 85 Q56 65 62 30" stroke="#608840" stroke-width="1.5" fill="none"/>
      <!-- outer arching blades -->
      <path d="M48 85 Q36 68 26 42" stroke="#4a7030" stroke-width="1.5" fill="none"/>
      <path d="M52 85 Q64 68 74 42" stroke="#4a7030" stroke-width="1.5" fill="none"/>
      <!-- feathery plumes at top -->
      <path d="M50 22 Q46 14 44 8" stroke="#c0a858" stroke-width="2" fill="none"/>
      <path d="M50 22 Q50 12 50 6" stroke="#c8b060" stroke-width="2.5" fill="none"/>
      <path d="M50 22 Q54 14 56 8" stroke="#c0a858" stroke-width="2" fill="none"/>
      <path d="M48 26 Q42 18 40 12" stroke="#b89850" stroke-width="1.5" fill="none"/>
      <path d="M52 26 Q58 18 60 12" stroke="#b89850" stroke-width="1.5" fill="none"/>
      <!-- plume seed heads -->
      <ellipse cx="44" cy="8" rx="2" ry="4" fill="#c8b060" opacity="0.8"/>
      <ellipse cx="50" cy="5" rx="2.5" ry="5" fill="#d0b868"/>
      <ellipse cx="56" cy="8" rx="2" ry="4" fill="#c8b060" opacity="0.8"/>
      <ellipse cx="40" cy="11" rx="1.5" ry="3" fill="#b89850" opacity="0.7"/>
      <ellipse cx="60" cy="11" rx="1.5" ry="3" fill="#b89850" opacity="0.7"/>
      <!-- base clump -->
      <ellipse cx="50" cy="86" rx="16" ry="6" fill="#3a5828"/>
    </svg>`,
    notes: 'Upright architectural grass. Excellent clay tolerance. Leaves standing through winter for structure and bird habitat.',
  },
  {
    id: 'prairie-dropseed',
    commonName: 'Prairie Dropseed',
    botanicalName: 'Sporobolus heterolepis',
    type: 'grass',
    matureWidth: 2.5,
    matureHeight: 2,
    bloomTime: ['August', 'September'],
    bloomColor: '#b0a878',
    foliageColor: 'bright green',
    sunRequirement: 'Full sun',
    waterNeeds: 'Low',
    clayTolerant: true,
    deerResistance: 'high',
    zone: '3-9',
    color: '#88a848',
    // Fine-textured arching mound, bright green, delicate airy seed heads
    svgIcon: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <!-- fine arching blades — fountain habit -->
      <path d="M50 82 Q30 65 14 48" stroke="#5a8c38" stroke-width="1.2" fill="none"/>
      <path d="M50 82 Q34 62 20 40" stroke="#68a040" stroke-width="1.2" fill="none"/>
      <path d="M50 82 Q38 60 28 36" stroke="#5a8c38" stroke-width="1.2" fill="none"/>
      <path d="M50 82 Q42 58 36 32" stroke="#70a848" stroke-width="1" fill="none"/>
      <path d="M50 82 Q46 58 44 30" stroke="#5a8c38" stroke-width="1" fill="none"/>
      <path d="M50 82 Q50 60 50 28" stroke="#68a040" stroke-width="1.2" fill="none"/>
      <path d="M50 82 Q54 58 56 30" stroke="#5a8c38" stroke-width="1" fill="none"/>
      <path d="M50 82 Q58 58 64 32" stroke="#70a848" stroke-width="1" fill="none"/>
      <path d="M50 82 Q62 60 72 36" stroke="#5a8c38" stroke-width="1.2" fill="none"/>
      <path d="M50 82 Q66 62 80 40" stroke="#68a040" stroke-width="1.2" fill="none"/>
      <path d="M50 82 Q70 65 86 48" stroke="#5a8c38" stroke-width="1.2" fill="none"/>
      <!-- airy seed heads at tips -->
      <circle cx="14" cy="47" r="2" fill="#c0b870" opacity="0.8"/>
      <circle cx="20" cy="39" r="2" fill="#b8b068" opacity="0.8"/>
      <circle cx="28" cy="35" r="1.8" fill="#c0b870" opacity="0.8"/>
      <circle cx="36" cy="31" r="1.8" fill="#b8b068" opacity="0.7"/>
      <circle cx="44" cy="29" r="2" fill="#c0b870" opacity="0.8"/>
      <circle cx="50" cy="27" r="2.2" fill="#c8b878"/>
      <circle cx="56" cy="29" r="2" fill="#c0b870" opacity="0.8"/>
      <circle cx="64" cy="31" r="1.8" fill="#b8b068" opacity="0.7"/>
      <circle cx="72" cy="35" r="1.8" fill="#c0b870" opacity="0.8"/>
      <circle cx="80" cy="39" r="2" fill="#b8b068" opacity="0.8"/>
      <circle cx="86" cy="47" r="2" fill="#c0b870" opacity="0.8"/>
      <!-- base -->
      <ellipse cx="50" cy="83" rx="12" ry="5" fill="#3a6020"/>
    </svg>`,
    notes: 'Illinois native. Fine-textured arching mounds. Fragrant blooms. Brilliant orange in fall.',
  },
  {
    id: 'autumn-fire-sedum',
    commonName: 'Autumn Fire Sedum',
    botanicalName: "Hylotelephium 'Herbstfreude'",
    type: 'perennial',
    matureWidth: 2,
    matureHeight: 2,
    bloomTime: ['August', 'September', 'October'],
    bloomColor: '#c84838',
    foliageColor: 'blue-green',
    sunRequirement: 'Full sun',
    waterNeeds: 'Low',
    clayTolerant: false,
    deerResistance: 'high',
    zone: '3-9',
    color: '#b03828',
    // Upright clump, blue-green fleshy leaves, flat-topped deep red flower clusters
    svgIcon: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <!-- upright succulent stems with fleshy blue-green leaves -->
      <rect x="34" y="44" width="8" height="38" rx="3" fill="#5a8878"/>
      <rect x="46" y="38" width="8" height="44" rx="3" fill="#5a8878"/>
      <rect x="58" y="44" width="8" height="38" rx="3" fill="#5a8878"/>
      <!-- fleshy ovate leaves on stems -->
      <ellipse cx="30" cy="58" rx="10" ry="7" fill="#6a9888" transform="rotate(-20 30 58)"/>
      <ellipse cx="70" cy="56" rx="10" ry="7" fill="#6a9888" transform="rotate(20 70 56)"/>
      <ellipse cx="38" cy="52" rx="9" ry="6" fill="#7aa898"/>
      <ellipse cx="62" cy="52" rx="9" ry="6" fill="#7aa898"/>
      <ellipse cx="50" cy="48" rx="10" ry="6" fill="#7aa898"/>
      <ellipse cx="36" cy="64" rx="8" ry="5" fill="#6a9888"/>
      <ellipse cx="64" cy="64" rx="8" ry="5" fill="#6a9888"/>
      <!-- flat-topped deep red flower clusters (corymbs) -->
      <ellipse cx="38" cy="36" rx="12" ry="7" fill="#c03828"/>
      <ellipse cx="50" cy="30" rx="14" ry="8" fill="#d04030"/>
      <ellipse cx="62" cy="36" rx="12" ry="7" fill="#c03828"/>
      <!-- tiny florets texture -->
      <circle cx="44" cy="33" r="2.5" fill="#e05848"/>
      <circle cx="50" cy="28" r="3" fill="#e86050"/>
      <circle cx="56" cy="33" r="2.5" fill="#e05848"/>
      <circle cx="38" cy="34" r="2" fill="#d04838"/>
      <circle cx="62" cy="34" r="2" fill="#d04838"/>
      <!-- base -->
      <ellipse cx="50" cy="83" rx="18" ry="6" fill="#3a5848"/>
    </svg>`,
    notes: '⚠️ Clay caution — amend with grit and compost. Excellent late-season color and structure.',
  },
]

export default plants
