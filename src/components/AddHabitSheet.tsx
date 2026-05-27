import { useEffect, useRef, useState } from 'react'
import { T } from '../tokens'
import { Mono } from '../components'
import { Icon } from '../icons'
import { actions, HUE_PALETTE, useStore, nextHue, type HabitType } from '../store'

const TYPES: { k: HabitType; label: string; sub: string }[] = [
  { k: 'check', label: 'Галочка', sub: 'отметка о выполнении' },
  { k: 'timer', label: 'Таймер',  sub: 'засекать время' },
  { k: 'note',  label: 'Заметка', sub: 'фиксировать результат' }
]

function TypeIcon({ k, c = 'currentColor' }: { k: HabitType; c?: string }) {
  if (k === 'check') return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M8 12.5l3 3 5-6" />
    </svg>
  )
  if (k === 'timer') return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="13" r="8" />
      <path d="M12 9v4l2.5 2M9 3h6M12 5V3" />
    </svg>
  )
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19l4-1 11-11-3-3L5 15l-1 4z" />
      <path d="M14 6l3 3" />
    </svg>
  )
}

export function AddHabitSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const habits = useStore(s => s.habits)
  const [name, setName] = useState('')
  const [target, setTarget] = useState('')
  const [hue, setHue] = useState<number>(nextHue(habits))
  const [type, setType] = useState<HabitType>('check')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      setName('')
      setTarget('')
      setType('check')
      setHue(nextHue(habits))
      const t = setTimeout(() => inputRef.current?.focus(), 350)
      return () => clearTimeout(t)
    }
  }, [open, habits])

  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  function submit() {
    actions.addHabit({ name, target, hue, type })
    onClose()
  }

  const targetPlaceholder =
    type === 'check' ? 'Цель — например ежедневно' :
    type === 'timer' ? 'Цель — например 30 мин' :
    'Цель — например главу в день'

  return (
    <>
      <div
        onClick={onClose}
        aria-hidden
        style={{
          position: 'fixed', inset: 0, zIndex: 200,
          background: 'rgba(0,0,0,0.65)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
          transition: 'opacity 0.4s cubic-bezier(0.32,0.72,0,1)'
        }}
      />
      <div style={{
        position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 201,
        transform: open ? 'translateY(0)' : 'translateY(100%)',
        transition: 'transform 0.55s cubic-bezier(0.32,0.72,0,1)',
        maxWidth: 440, margin: '0 auto'
      }} role="dialog" aria-modal="true">
        <div style={{ padding: '12px 12px max(20px, env(safe-area-inset-bottom))' }}>
          <div style={{
            position: 'relative',
            borderRadius: 24, padding: 18,
            background: 'rgba(28,22,18,0.95)',
            backdropFilter: 'blur(32px) saturate(180%)',
            WebkitBackdropFilter: 'blur(32px) saturate(180%)',
            border: '0.5px solid rgba(255,255,255,0.12)',
            boxShadow:
              '0 1px 0 rgba(255,255,255,0.08) inset, ' +
              '0 -30px 60px rgba(0,0,0,0.6)',
            color: T.ink
          }}>
            <div style={{
              margin: '0 auto 14px', width: 36, height: 4,
              borderRadius: 99, background: 'rgba(255,255,255,0.18)'
            }} />

            <Mono>новая привычка</Mono>

            <input
              ref={inputRef}
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && name.trim()) submit() }}
              placeholder="Название"
              autoComplete="off"
              autoCorrect="off"
              style={{
                marginTop: 10, width: '100%',
                background: 'transparent', border: 'none', outline: 'none',
                fontSize: 17, fontWeight: 500, letterSpacing: -0.2,
                color: T.ink, paddingBottom: 10,
                borderBottom: '0.5px solid rgba(255,255,255,0.1)'
              }}
            />

            <input
              value={target}
              onChange={e => setTarget(e.target.value)}
              placeholder={targetPlaceholder}
              autoComplete="off"
              autoCorrect="off"
              style={{
                marginTop: 10, width: '100%',
                background: 'transparent', border: 'none', outline: 'none',
                fontSize: 13, fontWeight: 500, letterSpacing: -0.1,
                color: T.ink2, paddingBottom: 10,
                borderBottom: '0.5px solid rgba(255,255,255,0.06)',
                fontFamily: 'JetBrains Mono, monospace'
              }}
            />

            <Mono style={{ display: 'block', marginTop: 16, marginBottom: 8 }}>как фиксируем</Mono>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {TYPES.map(t => {
                const a = t.k === type
                return (
                  <button key={t.k} onClick={() => setType(t.k)} style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '12px 14px', borderRadius: 14,
                    background: a ? 'rgba(220,200,80,0.1)' : 'rgba(255,255,255,0.03)',
                    border: '0.5px solid ' + (a ? 'rgba(220,200,80,0.4)' : 'rgba(255,255,255,0.07)'),
                    textAlign: 'left', transition: 'all 0.2s'
                  }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: 10,
                      background: a ? T.accent : 'rgba(255,255,255,0.06)',
                      color: a ? T.accentInk : T.ink2,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <TypeIcon k={t.k} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: T.ink, letterSpacing: -0.1 }}>{t.label}</div>
                      <Mono style={{ display: 'block', marginTop: 2 }} size={9}>{t.sub}</Mono>
                    </div>
                  </button>
                )
              })}
            </div>

            <Mono style={{ display: 'block', marginTop: 16, marginBottom: 8 }}>цвет</Mono>
            <div style={{ display: 'flex', gap: 8 }}>
              {HUE_PALETTE.map(h => {
                const a = h === hue
                return (
                  <button key={h} onClick={() => setHue(h)} style={{
                    width: 38, height: 38, borderRadius: 12,
                    background: `linear-gradient(135deg, oklch(0.5 0.1 ${h}), oklch(0.3 0.05 ${h + 20}))`,
                    border: '0.5px solid ' + (a ? T.accent : 'rgba(255,255,255,0.12)'),
                    boxShadow: a ? `0 0 0 2px ${T.accent}, 0 6px 14px rgba(220,200,80,0.25)` : 'none',
                    transition: 'all 0.2s'
                  }} />
                )
              })}
            </div>

            <div style={{ display: 'flex', gap: 8, marginTop: 18 }}>
              <button onClick={onClose} style={{
                flex: 1, height: 44, borderRadius: 999,
                background: 'rgba(255,255,255,0.04)',
                border: '0.5px solid rgba(255,255,255,0.1)',
                color: T.ink2, fontSize: 13, fontWeight: 600
              }}>Отмена</button>
              <button onClick={submit} disabled={!name.trim()} style={{
                flex: 1, height: 44, borderRadius: 999,
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                background: T.accent, color: T.accentInk,
                fontSize: 13, fontWeight: 700, letterSpacing: -0.1,
                opacity: name.trim() ? 1 : 0.4,
                boxShadow: name.trim() ? '0 8px 22px rgba(220,200,80,0.3)' : 'none',
                transition: 'all 0.2s'
              }}>
                <Icon.Plus s={13} c={T.accentInk} />
                Добавить
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
