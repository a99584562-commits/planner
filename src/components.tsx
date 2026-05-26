import type { CSSProperties, ReactNode, MouseEventHandler } from 'react'
import { T } from './tokens'

export const Backdrop = ({ children, style }: { children?: ReactNode; style?: CSSProperties }) => (
  <div style={{
    position: 'absolute', inset: 0, background: T.bgDeep, overflow: 'hidden',
    ...style
  }}>
    <div style={{
      position: 'absolute', top: -80, left: -60, width: 320, height: 320,
      borderRadius: '50%', filter: 'blur(60px)',
      background: 'radial-gradient(circle, oklch(0.55 0.13 65 / 0.55), transparent 70%)'
    }} />
    <div style={{
      position: 'absolute', top: 220, right: -100, width: 360, height: 360,
      borderRadius: '50%', filter: 'blur(70px)',
      background: 'radial-gradient(circle, oklch(0.45 0.12 45 / 0.55), transparent 70%)'
    }} />
    <div style={{
      position: 'absolute', bottom: -120, left: -80, width: 360, height: 360,
      borderRadius: '50%', filter: 'blur(70px)',
      background: 'radial-gradient(circle, oklch(0.42 0.08 220 / 0.45), transparent 70%)'
    }} />
    <div style={{
      position: 'absolute', top: 540, right: 60, width: 220, height: 220,
      borderRadius: '50%', filter: 'blur(60px)',
      background: 'radial-gradient(circle, oklch(0.78 0.16 95 / 0.32), transparent 70%)'
    }} />
    <div style={{
      position: 'absolute', inset: 0,
      backgroundImage: 'repeating-linear-gradient(90deg, rgba(255,255,255,0.022) 0 1px, transparent 1px 32px)',
      mixBlendMode: 'overlay'
    }} />
    <div style={{
      position: 'absolute', inset: 0,
      background: 'radial-gradient(ellipse 120% 80% at 50% 50%, transparent 40%, rgba(0,0,0,0.5) 100%)'
    }} />
    {children}
  </div>
)

type GlassProps = {
  children?: ReactNode
  style?: CSSProperties
  tint?: string
  radius?: number
  pad?: number | string
  hi?: boolean
  onClick?: MouseEventHandler<HTMLDivElement>
}

export const Glass = ({ children, style, tint, radius = 22, pad = 16, hi = true, onClick }: GlassProps) => (
  <div onClick={onClick} style={{
    position: 'relative', borderRadius: radius, padding: pad,
    background: tint || 'rgba(36,30,26,0.32)',
    backdropFilter: 'blur(28px) saturate(160%)',
    WebkitBackdropFilter: 'blur(28px) saturate(160%)',
    border: '0.5px solid rgba(255,255,255,0.11)',
    boxShadow:
      '0 1px 0 rgba(255,255,255,0.08) inset, ' +
      '0 -1px 0 rgba(0,0,0,0.3) inset, ' +
      '0 18px 44px rgba(0,0,0,0.5), ' +
      '0 2px 8px rgba(0,0,0,0.3)',
    color: T.ink,
    cursor: onClick ? 'pointer' : 'default',
    ...style
  }}>
    {hi && <div style={{
      position: 'absolute', top: 0, left: '8%', right: '8%', height: 1,
      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.28), transparent)',
      borderRadius: 999, pointerEvents: 'none'
    }} />}
    {children}
  </div>
)

type PhotoProps = {
  label?: string
  h?: number
  w?: number | string
  radius?: number
  hue?: number
  style?: CSSProperties
}

export const Photo = ({ label, h = 140, w, radius = 18, hue = 30, style }: PhotoProps) => (
  <div style={{
    width: w || '100%', height: h, borderRadius: radius, overflow: 'hidden',
    position: 'relative', flexShrink: 0,
    background: `linear-gradient(135deg, oklch(0.4 0.04 ${hue}) 0%, oklch(0.28 0.03 ${hue + 20}) 100%)`,
    border: '0.5px solid rgba(255,255,255,0.08)',
    ...style
  }}>
    <div style={{
      position: 'absolute', inset: 0,
      backgroundImage: `repeating-linear-gradient(${hue}deg, rgba(255,255,255,0.08) 0 1px, transparent 1px 7px)`
    }} />
    <div style={{
      position: 'absolute', inset: 0,
      background: 'radial-gradient(ellipse 80% 60% at 30% 30%, rgba(255,255,255,0.08), transparent 70%)'
    }} />
    {label && <div style={{
      position: 'absolute', left: 10, bottom: 8,
      fontFamily: 'JetBrains Mono, monospace', fontSize: 8.5, letterSpacing: 0.6,
      color: 'rgba(255,255,255,0.62)', textTransform: 'uppercase'
    }}>{label}</div>}
  </div>
)

type PillProps = { children: ReactNode; accent?: boolean; style?: CSSProperties; onClick?: MouseEventHandler<HTMLDivElement> }

export const Pill = ({ children, accent, style, onClick }: PillProps) => (
  <div onClick={onClick} style={{
    display: 'inline-flex', alignItems: 'center', gap: 6,
    height: 28, padding: '0 12px', borderRadius: 999,
    background: accent ? T.accent : 'rgba(255,255,255,0.08)',
    color: accent ? T.accentInk : T.ink,
    fontSize: 12, fontWeight: 600, letterSpacing: -0.1,
    border: accent ? 'none' : '0.5px solid rgba(255,255,255,0.1)',
    cursor: onClick ? 'pointer' : 'default',
    boxShadow: accent
      ? '0 4px 14px rgba(220,200,80,0.25), inset 0 1px 0 rgba(255,255,255,0.3)'
      : 'none',
    ...style
  }}>{children}</div>
)

export const CheckCircle = ({ done, accent }: { done?: boolean; accent?: string }) => (
  <div style={{
    width: 20, height: 20, borderRadius: 999,
    border: `1.2px solid ${done ? (accent || T.accent) : 'rgba(255,255,255,0.25)'}`,
    background: done ? (accent || T.accent) : 'transparent',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'all 0.15s ease', flexShrink: 0
  }}>
    {done && (
      <svg width="11" height="9" viewBox="0 0 11 9">
        <path d="M1 4.5L4 7.5L10 1.5" stroke={T.accentInk} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </svg>
    )}
  </div>
)

export const SecHead = ({ title, right, n, style }: { title: string; right?: ReactNode; n?: number; style?: CSSProperties }) => (
  <div style={{
    display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
    padding: '0 4px', ...style
  }}>
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
      <div style={{ fontSize: 17, fontWeight: 600, color: T.ink, letterSpacing: -0.3 }}>{title}</div>
      {n !== undefined && (
        <div style={{
          fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: T.ink3,
          position: 'relative', top: -4
        }}>({n})</div>
      )}
    </div>
    {right}
  </div>
)

export const Mono = ({ children, size = 10, style }: { children: ReactNode; size?: number; style?: CSSProperties }) => (
  <span style={{
    fontFamily: 'JetBrains Mono, monospace', fontSize: size,
    letterSpacing: 0.5, textTransform: 'uppercase', color: T.ink3,
    ...style
  }}>{children}</span>
)
