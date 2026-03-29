/**
 * Collab World Design Token System
 *
 * Single source of truth for all brand colors, typography, spacing,
 * animations, and component variants. Import from here — never hardcode
 * Tailwind classes for brand values in components.
 *
 * Usage:
 *   import { brand } from '@/lib/brand'
 *   className={brand.button.primary}
 */

// ─── Color Palette ────────────────────────────────────────────────────────────

export const colors = {
  // Base surfaces
  base: {
    page:        'bg-black',
    surface:     'bg-gray-900/50',
    surfaceAlt:  'bg-gray-900/40',
    surfaceSolid:'bg-zinc-900',
    overlay:     'bg-black/60',
    overlayLight:'bg-black/30',
  },

  // Borders
  border: {
    default:  'border-gray-800',
    muted:    'border-zinc-800',
    hover:    'border-gray-700',
    strong:   'border-gray-600',
    yellow:   'border-yellow-500/50',
    yellowHover:'border-yellow-400/70',
  },

  // Text
  text: {
    primary:   'text-white',
    secondary: 'text-zinc-400',
    tertiary:  'text-zinc-500',
    muted:     'text-zinc-600',
    yellow:    'text-yellow-400',
    blue:      'text-blue-400',
    purple:    'text-purple-400',
    pink:      'text-pink-400',
    green:     'text-green-400',
    red:       'text-red-400',
  },

  // Role accent colors (card backgrounds + borders)
  role: {
    creator:    'border-blue-500/30 bg-blue-500/10 hover:border-blue-500/50',
    influencer: 'border-purple-500/30 bg-purple-500/10 hover:border-purple-500/50',
    brand:      'border-yellow-500/30 bg-yellow-500/10 hover:border-yellow-500/50',
    fan:        'border-pink-500/30 bg-pink-500/10 hover:border-pink-500/50',
  },

  // Step accent pills (how-it-works)
  step: {
    1: 'bg-blue-500/20 text-blue-400',
    2: 'bg-purple-500/20 text-purple-400',
    3: 'bg-pink-500/20 text-pink-400',
    4: 'bg-yellow-500/20 text-yellow-400',
    5: 'bg-green-500/20 text-green-400',
    6: 'bg-red-500/20 text-red-400',
  } as Record<number, string>,

  // Status badge backgrounds + text
  status: {
    active:    { bg: 'bg-green-500/20',  text: 'text-green-400',  border: 'border-green-500/30' },
    voting:    { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/30' },
    upcoming:  { bg: 'bg-blue-500/20',   text: 'text-blue-400',   border: 'border-blue-500/30' },
    completed: { bg: 'bg-zinc-700/40',   text: 'text-zinc-400',   border: 'border-zinc-600/30' },
    archived:  { bg: 'bg-zinc-700/40',   text: 'text-zinc-500',   border: 'border-zinc-600/30' },
    draft:     { bg: 'bg-zinc-800',       text: 'text-zinc-300',   border: 'border-zinc-700' },
    pending:   { bg: 'bg-yellow-900/20', text: 'text-yellow-300', border: 'border-yellow-700' },
    approved:  { bg: 'bg-green-900/20',  text: 'text-green-300',  border: 'border-green-700' },
    rejected:  { bg: 'bg-red-900/20',    text: 'text-red-300',    border: 'border-red-700' },
    winner:    { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/50' },
  } as Record<string, { bg: string; text: string; border: string }>,
} as const

// ─── Typography ───────────────────────────────────────────────────────────────

export const type = {
  // Display headings — use Playfair Display (font-serif)
  hero:    'font-serif font-bold text-5xl sm:text-6xl lg:text-7xl leading-none tracking-tight',
  h1:      'font-serif font-bold text-4xl md:text-5xl leading-tight',
  h2:      'font-serif font-bold text-3xl md:text-4xl leading-tight',
  h3:      'font-serif font-semibold text-2xl leading-snug',
  h4:      'font-serif font-semibold text-xl leading-snug',

  // Body — Inter (font-sans)
  lead:    'text-xl text-zinc-400 leading-relaxed',
  body:    'text-base text-zinc-400 leading-relaxed',
  small:   'text-sm text-zinc-400',
  xs:      'text-xs text-zinc-500',
  label:   'text-sm font-medium text-zinc-300',
  caption: 'text-xs font-medium text-zinc-400 tracking-wide uppercase',

  // Brand accent text
  accent:  'text-yellow-400 font-semibold',
  tagline: 'text-yellow-400 font-semibold text-xl tracking-wide',
} as const

// ─── Buttons ──────────────────────────────────────────────────────────────────

export const button = {
  // White — primary CTA
  primary:
    'bg-white text-black font-bold px-8 py-4 rounded-full hover:bg-zinc-100 transition-all duration-300 hover:-translate-y-0.5 shadow-[0_0_30px_rgba(255,255,255,0.25)] tracking-wide uppercase',

  primaryLg:
    'bg-white text-black font-bold px-12 py-5 rounded-full text-lg hover:bg-zinc-100 transition-all duration-300 hover:-translate-y-1 shadow-[0_0_50px_rgba(255,255,255,0.3)] tracking-wide uppercase',

  // Yellow — high-energy CTA (financial, influencer)
  yellow:
    'bg-yellow-400 text-black font-bold px-8 py-4 rounded-full hover:bg-yellow-300 transition-all duration-300 hover:-translate-y-0.5 shadow-[0_0_30px_rgba(250,204,21,0.35)] tracking-wide uppercase',

  yellowLg:
    'bg-yellow-400 text-black font-bold px-12 py-5 rounded-full text-lg hover:bg-yellow-300 transition-all duration-300 hover:-translate-y-1 shadow-[0_0_50px_rgba(250,204,21,0.4)] tracking-wide uppercase',

  // Outline white
  outline:
    'border-2 border-white/60 bg-transparent text-white font-bold px-8 py-4 rounded-full hover:bg-white hover:text-black transition-all duration-300 hover:-translate-y-0.5 tracking-wide uppercase',

  outlineLg:
    'border-2 border-white/60 bg-transparent text-white font-bold px-12 py-5 rounded-full text-lg hover:bg-white hover:text-black transition-all duration-300 hover:-translate-y-1 tracking-wide uppercase',

  // Outline yellow
  outlineYellow:
    'border-2 border-yellow-400/60 text-yellow-400 font-bold px-8 py-4 rounded-full hover:bg-yellow-400 hover:text-black transition-all duration-300 hover:-translate-y-0.5 tracking-wide uppercase',

  // Ghost / subtle
  ghost:
    'border border-zinc-700 bg-transparent text-white font-semibold px-6 py-3 rounded-xl hover:border-zinc-500 transition-colors',

  // Admin / accent
  admin:
    'bg-indigo-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-indigo-500 transition-colors',

  // Destructive
  danger:
    'bg-red-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-red-500 transition-colors',

  // Small inline
  sm: 'bg-white text-black font-semibold text-sm px-4 py-2 rounded-full hover:bg-zinc-100 transition-all duration-200 hover:-translate-y-0.5',

  smOutline:
    'border border-zinc-600 text-zinc-300 font-semibold text-sm px-4 py-2 rounded-full hover:border-white hover:text-white transition-colors',
} as const

// ─── Cards ────────────────────────────────────────────────────────────────────

export const card = {
  // Standard dark card
  default:
    'bg-gray-900/50 border border-gray-800 rounded-3xl hover:border-gray-700 hover:shadow-2xl transition-all duration-300',

  // Solid card (no opacity)
  solid:
    'bg-zinc-900 border border-zinc-800 rounded-3xl hover:border-zinc-600 hover:shadow-2xl transition-all duration-300',

  // Premium / yellow glow
  premium:
    'bg-gray-900/50 border-2 border-yellow-500/50 rounded-3xl hover:border-yellow-400/70 hover:shadow-2xl transition-all duration-300 shadow-[0_0_40px_rgba(250,204,21,0.15)]',

  // Stat display
  stat:
    'bg-gray-900/50 border border-gray-800 rounded-3xl p-10 hover:shadow-2xl transition-shadow text-center',

  // Leaderboard row
  leaderboard:
    'bg-gray-900/30 border border-gray-800 rounded-2xl hover:border-gray-700 hover:bg-gray-900/60 transition-all duration-200',

  // Spacing presets
  padding: {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-10',
  },
} as const

// ─── Layout ───────────────────────────────────────────────────────────────────

export const layout = {
  page:      'min-h-screen bg-black text-white',
  container: 'max-w-7xl mx-auto px-6',
  section:   'py-24',
  sectionSm: 'py-16',
  divider:   'border-b border-zinc-800',
  centeredHeader: 'text-center mb-14',
} as const

// ─── Animations ───────────────────────────────────────────────────────────────

export const animate = {
  lift:      'hover:-translate-y-1 transition-transform duration-300',
  liftSm:    'hover:-translate-y-0.5 transition-transform duration-200',
  scaleUp:   'group-hover:scale-105 transition-transform duration-500',
  fadeIn:    'animate-in fade-in duration-700',
  slideUp:   'animate-in fade-in slide-in-from-bottom-8 duration-700',
  marquee:   'animate-marquee',
} as const

// ─── Composite helpers (combine tokens for common patterns) ───────────────────

export const brand = {
  colors,
  type,
  button,
  card,
  layout,
  animate,

  // Common section wrapper
  section: (extra = '') =>
    `${layout.container} ${layout.section} ${layout.divider} ${extra}`.trim(),

  // Badge pill (inline status)
  badge: (variant: keyof typeof colors.status) => {
    const s = colors.status[variant]!
    return `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${s.bg} ${s.text} border ${s.border}`
  },

  // Gradient thumbnail fallback
  thumbnailFallback: 'bg-gradient-to-br from-purple-900 via-blue-900 to-zinc-900',

  // Hero overlay
  heroOverlay: 'absolute inset-0 bg-black/60',
  heroGradient: 'absolute inset-0 bg-gradient-to-r from-yellow-500/10 via-transparent to-blue-500/10 pointer-events-none',
} as const

export default brand
