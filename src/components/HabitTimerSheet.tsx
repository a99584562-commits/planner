import { useEffect, useState } from 'react'
import { T } from '../tokens'
import { Mono } from '../components'
import { actions, formatTimer, type Habit } from '../store'

type Props = { habit: Habit | null; open: boolean; onClose: () => void }

export function HabitTimerSheet({ habit, open, onClose }: Props) {
  const [running, setRunning] = useState(false)
  const [accumMs, setAccumMs] = useState(0)
  const [startTs, setStartTs] = useState<number | null>(null)
  const [now, setNow] = useState(Date.now())

  useEffect(() => {
    setRunning(false)
    setAccumMs(0)
    setStartTs(null)
    if (open) setNow(Date.now())
  }, [open, habit?.id])

  useEffect(() => {
    if (!running) return
    const id = setInterval(() => setNow(Date.now()), 250)
    return () => clearInterval(id)
  }, [running])

  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  const elapsedMs = accumMs + (running && startTs ? now - startTs : 0)
  const elapsedSec = Math.floor(elapsedMs / 1000)

  function start() {
    setStartTs(Date.now())
    setRunning(true)
  }
  function pause() {
    if (startTs) setAccumMs(prev => prev + (Date.now() - startTs))
    setStartTs(null)
    setRunning(false)
  }
  function reset() {
    setRunning(false)
    setStartTs(null)
    setAccumMs(0)
  }
  function saveAndClose() {
    if (!habit) return onClose()
    if (running && startTs) setAccumMs(prev => prev + (Date.now() - startTs))
    const total = Math.floor((accumMs + (running && startTs ? Date.now() - startTs : 0)) / 1000)
    actions.addTimerEntry(habit.id, total)
    onClose()
  }

  const hue = habit?.hue ?? 60

  return (
    <>
      <div
        onClick={onClose}
        aria-hidden
        style={{
          position: 'fixed', inset: 0, zIndex: 200,
          background: 'rgba(0,0,0,0.75)',
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

            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 11, flexShrink: 0,
                background: `linear-gradient(135deg, oklch(0.5 0.1 ${hue}), oklch(0.3 0.05 ${hue + 20}))`,
                border: '0.5px solid rgba(255,255,255,0.12)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'JetBrains Mono, monospace', fontSize: 13, color: T.ink, fontWeight: 600
              }}>{habit?.name[0]?.toUpperCase()}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <Mono size={9}>таймер</Mono>
                <div style={{
                  fontSize: 17, fontWeight: 600, color: T.ink, letterSpacing: -0.2,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                }}>{habit?.name}</div>
              </div>
              {habit?.target && <Mono>{habit.target}</Mono>}
            </div>

            <div style={{
              marginTop: 24, padding: '32px 12px',
              borderRadius: 18,
              background: running ? 'rgba(220,200,80,0.08)' : 'rgba(0,0,0,0.25)',
              border: '0.5px solid ' + (running ? 'rgba(220,200,80,0.25)' : 'rgba(255,255,255,0.06)'),
              textAlign: 'center',
              transition: 'background 0.3s, border-color 0.3s'
            }}>
              <div style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 56, fontWeight: 500, letterSpacing: -3,
                color: running ? T.accent : T.ink, lineHeight: 1,
                transition: 'color 0.3s'
              }}>
                {formatTimer(elapsedSec)}
              </div>
              <Mono style={{ display: 'block', marginTop: 10 }} size={9}>
                {running ? '● идёт' : elapsedSec > 0 ? 'пауза' : 'готов к старту'}
              </Mono>
            </div>

            <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
              {!running && elapsedSec === 0 && (
                <button onClick={start} style={{
                  flex: 1, height: 48, borderRadius: 999,
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  background: T.accent, color: T.accentInk,
                  fontSize: 14, fontWeight: 700, letterSpacing: -0.1,
                  boxShadow: '0 10px 28px rgba(220,200,80,0.35)'
                }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill={T.accentInk}><path d="M7 5v14l12-7L7 5z" /></svg>
                  Старт
                </button>
              )}
              {running && (
                <button onClick={pause} style={{
                  flex: 1, height: 48, borderRadius: 999,
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  background: 'rgba(255,255,255,0.08)', color: T.ink,
                  border: '0.5px solid rgba(255,255,255,0.15)',
                  fontSize: 14, fontWeight: 600
                }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill={T.ink}><rect x="6" y="5" width="4" height="14"/><rect x="14" y="5" width="4" height="14"/></svg>
                  Пауза
                </button>
              )}
              {!running && elapsedSec > 0 && (
                <>
                  <button onClick={reset} style={{
                    width: 48, height: 48, borderRadius: 999,
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    background: 'rgba(255,255,255,0.04)', color: T.ink2,
                    border: '0.5px solid rgba(255,255,255,0.1)'
                  }} aria-label="Сброс">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                      <path d="M3 12a9 9 0 1 0 3-6.7" /><path d="M3 4v5h5" />
                    </svg>
                  </button>
                  <button onClick={start} style={{
                    flex: 1, height: 48, borderRadius: 999,
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    background: 'rgba(220,200,80,0.12)', color: T.accent,
                    border: '0.5px solid rgba(220,200,80,0.3)',
                    fontSize: 14, fontWeight: 600
                  }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill={T.accent}><path d="M7 5v14l12-7L7 5z" /></svg>
                    Продолжить
                  </button>
                </>
              )}
            </div>

            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
              <button onClick={onClose} style={{
                flex: 1, height: 44, borderRadius: 999,
                background: 'rgba(255,255,255,0.03)',
                border: '0.5px solid rgba(255,255,255,0.08)',
                color: T.ink3, fontSize: 13, fontWeight: 500
              }}>Закрыть</button>
              <button onClick={saveAndClose} disabled={elapsedSec === 0} style={{
                flex: 1, height: 44, borderRadius: 999,
                background: elapsedSec > 0 ? 'rgba(220,200,80,0.15)' : 'rgba(255,255,255,0.03)',
                border: '0.5px solid ' + (elapsedSec > 0 ? 'rgba(220,200,80,0.35)' : 'rgba(255,255,255,0.08)'),
                color: elapsedSec > 0 ? T.accent : T.ink3,
                fontSize: 13, fontWeight: 600,
                opacity: elapsedSec > 0 ? 1 : 0.5
              }}>Сохранить</button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
