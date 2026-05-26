import type { CSSProperties } from 'react'

type IconProps = { s?: number; c?: string; fill?: boolean; dir?: 'right' | 'left' | 'up' | 'down'; style?: CSSProperties }

export const Icon = {
  Plus: ({ s = 14, c = 'currentColor' }: IconProps) => (
    <svg width={s} height={s} viewBox="0 0 14 14"><path d="M7 2v10M2 7h10" stroke={c} strokeWidth="1.6" strokeLinecap="round" /></svg>
  ),
  Chevron: ({ s = 12, c = 'currentColor', dir = 'right' }: IconProps) => {
    const rot = { right: 0, left: 180, down: 90, up: -90 }[dir]
    return (
      <svg width={s} height={s} viewBox="0 0 12 12" style={{ transform: `rotate(${rot}deg)` }}>
        <path d="M4 2l4 4-4 4" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </svg>
    )
  },
  Search: ({ s = 16, c = 'currentColor' }: IconProps) => (
    <svg width={s} height={s} viewBox="0 0 16 16">
      <circle cx="7" cy="7" r="5" stroke={c} strokeWidth="1.5" fill="none" />
      <path d="M11 11l3 3" stroke={c} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  Bell: ({ s = 16, c = 'currentColor' }: IconProps) => (
    <svg width={s} height={s} viewBox="0 0 16 16" fill="none">
      <path d="M3.5 12V7a4.5 4.5 0 019 0v5M2 12h12M6.5 14a1.5 1.5 0 003 0" stroke={c} strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  ),
  Sparkle: ({ s = 14, c = 'currentColor' }: IconProps) => (
    <svg width={s} height={s} viewBox="0 0 14 14" fill="none">
      <path d="M7 1l1.2 3.8L12 6l-3.8 1.2L7 11l-1.2-3.8L2 6l3.8-1.2L7 1z" fill={c} />
    </svg>
  ),
  Home: ({ s = 18, c = 'currentColor', fill }: IconProps) => (
    <svg width={s} height={s} viewBox="0 0 18 18" fill={fill ? c : 'none'}>
      <path d="M2 8l7-6 7 6v8a1 1 0 01-1 1H3a1 1 0 01-1-1V8z" stroke={c} strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  ),
  List: ({ s = 18, c = 'currentColor' }: IconProps) => (
    <svg width={s} height={s} viewBox="0 0 18 18" fill="none">
      <circle cx="3" cy="4.5" r="1" fill={c} />
      <circle cx="3" cy="9" r="1" fill={c} />
      <circle cx="3" cy="13.5" r="1" fill={c} />
      <path d="M6.5 4.5H15M6.5 9H15M6.5 13.5H15" stroke={c} strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  ),
  Cal: ({ s = 18, c = 'currentColor', fill }: IconProps) => (
    <svg width={s} height={s} viewBox="0 0 18 18" fill="none">
      <rect x="2" y="3.5" width="14" height="12.5" rx="2" stroke={c} strokeWidth="1.4" />
      <path d="M2 7h14M6 2v3M12 2v3" stroke={c} strokeWidth="1.4" strokeLinecap="round" />
      {fill && <circle cx="9" cy="11" r="1.2" fill={c} />}
    </svg>
  ),
  Grid: ({ s = 18, c = 'currentColor', fill }: IconProps) => (
    <svg width={s} height={s} viewBox="0 0 18 18" fill="none">
      <rect x="2" y="2" width="6.5" height="6.5" rx="1.5" stroke={c} strokeWidth="1.4" fill={fill ? c : 'none'} />
      <rect x="9.5" y="2" width="6.5" height="6.5" rx="1.5" stroke={c} strokeWidth="1.4" />
      <rect x="2" y="9.5" width="6.5" height="6.5" rx="1.5" stroke={c} strokeWidth="1.4" />
      <rect x="9.5" y="9.5" width="6.5" height="6.5" rx="1.5" stroke={c} strokeWidth="1.4" />
    </svg>
  ),
  Briefcase: ({ s = 16, c = 'currentColor' }: IconProps) => (
    <svg width={s} height={s} viewBox="0 0 16 16" fill="none">
      <rect x="1.5" y="5" width="13" height="9" rx="1.5" stroke={c} strokeWidth="1.3" />
      <path d="M6 5V3.5a1 1 0 011-1h2a1 1 0 011 1V5M1.5 9h13" stroke={c} strokeWidth="1.3" />
    </svg>
  ),
  Heart: ({ s = 16, c = 'currentColor' }: IconProps) => (
    <svg width={s} height={s} viewBox="0 0 16 16" fill="none">
      <path d="M8 13.5S2 10 2 6a3 3 0 016-1 3 3 0 016 1c0 4-6 7.5-6 7.5z" stroke={c} strokeWidth="1.3" strokeLinejoin="round" />
    </svg>
  ),
  Pulse: ({ s = 16, c = 'currentColor' }: IconProps) => (
    <svg width={s} height={s} viewBox="0 0 16 16" fill="none">
      <path d="M1 8h3.5L6 4l2 8 2-6 1.5 2H15" stroke={c} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  Flame: ({ s = 18, c = 'currentColor', fill }: IconProps) => (
    <svg width={s} height={s} viewBox="0 0 18 18" fill="none">
      <path d="M9 1s4 4 4 8a4 4 0 01-8 0c0-2 1.5-3 1.5-3S6 7 9 4c0 0 0 2-1 3" stroke={c} strokeWidth="1.4" strokeLinejoin="round" fill={fill ? c : 'none'} />
    </svg>
  )
}
