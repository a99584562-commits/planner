import { useEffect, useMemo } from 'react'
import { T } from '../tokens'
import { Mono } from '../components'
import {
  actions,
  streakOf,
  bestStreakOf,
  formatDurationRu,
  formatTimer,
  type Habit,
  type HabitEntry
} from '../store'

type Props = { habit: Habit | null; open: boolean; onClose: () => void }

const MONTHS_RU = ['янв','фев','мар','апр','мая','июн','июл','авг','сен','окт','ноя','дек']
const DAY_FULL = ['воскресенье','понедельник','вторник','среда','четверг','пятница','суббота']

function fmtDateLong(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  const dow = DAY_FULL[date.getDay()]
  return `${d} ${MONTHS_RU[m - 1]} · ${dow}`
}

export function HabitDetailSheet({ habit, open, onClose }: Props) {
  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  const stats = useMemo(() => {
    if (!habit) return null
    const streak = streakOf(habit)
    const best = bestStreakOf(habit)
    const totalEntries = habit.entries.length
    const totalSec = habit.entries.reduce((a, e) => a + (e.durationSec || 0), 0)
    const noteCount = habit.entries.filter(e => e.note).length
    return { streak, best, totalEntries, totalSec, noteCount }
  }, [habit])

  const entries = useMemo<{ iso: string; items: HabitEntry[] }[]>(() => {
    if (!habit) return []
    const byDate = new Map<string, HabitEntry[]>()
    for (const e of habit.entries) {
      const arr = byDate.get(e.date) || []
      arr.push(e)
      byDate.set(e.date, arr)
    }
    return Array.from(byDate.entries())
      .map(([iso, items]) => ({
        iso,
        items: items.sort((a, b) => b.createdAt - a.createdAt)
      }))
      .sort((a, b) => (a.iso > b.iso ? -1 : 1))
  }, [habit])

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
        position: 'fixed', left: 0, right: 0, top: 0, bottom: 0, zIndex: 201,
        transform: open ? 'translateY(0)' : 'translateY(100%)',
        transition: 'transform 0.55s cubic-bezier(0.32,0.72,0,1)',
        maxWidth: 440, margin: '0 auto',
        display: 'flex', flexDirection: 'column',
        paddingTop: 'max(36px, env(safe-area-inset-top))'
      }} role="dialog" aria-modal="true">
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          margin: '12px 12px max(20px, env(safe-area-inset-bottom))',
          borderRadius: 24, overflow: 'hidden',
          background: 'rgba(20,16,14,0.97)',
          backdropFilter: 'blur(32px) saturate(180%)',
          WebkitBackdropFilter: 'blur(32px) saturate(180%)',
          border: '0.5px solid rgba(255,255,255,0.12)',
          boxShadow:
            '0 1px 0 rgba(255,255,255,0.08) inset, ' +
            '0 -30px 60px rgba(0,0,0,0.6)',
          color: T.ink
        }}>
          <div style={{
            padding: '16px 18px 12px',
            display: 'flex', alignItems: 'center', gap: 12,
            borderBottom: '0.5px solid rgba(255,255,255,0.06)'
          }}>
            <div style={{
              width: 44, height: 44, borderRadius: 13, flexShrink: 0,
              background: `linear-gradient(135deg, oklch(0.5 0.1 ${hue}), oklch(0.3 0.05 ${hue + 20}))`,
              border: '0.5px solid rgba(255,255,255,0.12)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'JetBrains Mono, monospace', fontSize: 15, color: T.ink, fontWeight: 600
            }}>{habit?.name[0]?.toUpperCase()}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: 17, fontWeight: 600, color: T.ink, letterSpacing: -0.2,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
              }}>{habit?.name}</div>
              {habit?.target && <Mono style={{ display: 'block', marginTop: 2 }}>{habit.target}</Mono>}
            </div>
            <button onClick={onClose} style={{
              width: 36, height: 36, borderRadius: 999,
              background: 'rgba(255,255,255,0.05)',
              border: '0.5px solid rgba(255,255,255,0.1)',
              color: T.ink2, display: 'flex', alignItems: 'center', justifyContent: 'center'
            }} aria-label="Закрыть">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                <path d="M6 6l12 12M6 18L18 6" />
              </svg>
            </button>
          </div>

          <div style={{
            flex: 1, overflowY: 'auto',
            padding: '16px 18px'
          }}>
            {stats && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: habit?.type === 'timer' ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
                gap: 8
              }}>
                <div style={{
                  padding: '12px 14px', borderRadius: 14,
                  background: 'rgba(255,255,255,0.03)',
                  border: '0.5px solid rgba(255,255,255,0.06)'
                }}>
                  <Mono size={8}>стрик</Mono>
                  <div style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: 22, color: stats.streak > 0 ? T.accent : T.ink,
                    letterSpacing: -1, marginTop: 4
                  }}>{stats.streak}<span style={{ fontSize: 10, color: T.ink3, marginLeft: 4 }}>дн</span></div>
                </div>
                <div style={{
                  padding: '12px 14px', borderRadius: 14,
                  background: 'rgba(255,255,255,0.03)',
                  border: '0.5px solid rgba(255,255,255,0.06)'
                }}>
                  <Mono size={8}>лучший</Mono>
                  <div style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: 22, color: T.ink, letterSpacing: -1, marginTop: 4
                  }}>{stats.best}<span style={{ fontSize: 10, color: T.ink3, marginLeft: 4 }}>дн</span></div>
                </div>
                {habit?.type === 'timer' ? (
                  <div style={{
                    padding: '12px 14px', borderRadius: 14,
                    background: 'rgba(255,255,255,0.03)',
                    border: '0.5px solid rgba(255,255,255,0.06)',
                    gridColumn: '1 / -1'
                  }}>
                    <Mono size={8}>всего</Mono>
                    <div style={{
                      fontFamily: 'JetBrains Mono, monospace',
                      fontSize: 22, color: T.ink, letterSpacing: -1, marginTop: 4
                    }}>{formatDurationRu(stats.totalSec)}</div>
                  </div>
                ) : (
                  <div style={{
                    padding: '12px 14px', borderRadius: 14,
                    background: 'rgba(255,255,255,0.03)',
                    border: '0.5px solid rgba(255,255,255,0.06)'
                  }}>
                    <Mono size={8}>записей</Mono>
                    <div style={{
                      fontFamily: 'JetBrains Mono, monospace',
                      fontSize: 22, color: T.ink, letterSpacing: -1, marginTop: 4
                    }}>{stats.totalEntries}</div>
                  </div>
                )}
              </div>
            )}

            <Mono style={{ display: 'block', marginTop: 22, marginBottom: 10 }}>история</Mono>

            {entries.length === 0 ? (
              <div style={{
                padding: '32px 20px', textAlign: 'center',
                borderRadius: 16,
                background: 'rgba(255,255,255,0.02)',
                border: '0.5px solid rgba(255,255,255,0.05)'
              }}>
                <Mono size={9} style={{ display: 'block' }}>пусто</Mono>
                <div style={{ marginTop: 8, fontSize: 13, color: T.ink2 }}>
                  отметь привычку — здесь появятся записи
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {entries.map(({ iso, items }) => (
                  <div key={iso} style={{
                    padding: '12px 14px', borderRadius: 14,
                    background: 'rgba(255,255,255,0.025)',
                    border: '0.5px solid rgba(255,255,255,0.05)'
                  }}>
                    <Mono size={9} style={{ display: 'block' }}>{fmtDateLong(iso)}</Mono>
                    <div style={{ marginTop: 6, display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {items.map(e => (
                        <div key={e.createdAt} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            {habit?.type === 'timer' && e.durationSec !== undefined && (
                              <div style={{
                                fontFamily: 'JetBrains Mono, monospace',
                                fontSize: 18, color: T.ink, letterSpacing: -0.5
                              }}>{formatTimer(e.durationSec)} <span style={{ fontSize: 10, color: T.ink3, marginLeft: 4 }}>{formatDurationRu(e.durationSec)}</span></div>
                            )}
                            {habit?.type === 'note' && e.note && (
                              <div style={{
                                fontSize: 14, color: T.ink, lineHeight: 1.55,
                                letterSpacing: -0.1, whiteSpace: 'pre-wrap', wordBreak: 'break-word'
                              }}>{e.note}</div>
                            )}
                            {habit?.type === 'check' && (
                              <div style={{ fontSize: 14, color: T.ink, fontWeight: 500 }}>
                                ✓ выполнено
                              </div>
                            )}
                          </div>
                          <button
                            onClick={() => habit && actions.deleteEntry(habit.id, e.createdAt)}
                            aria-label="Удалить запись"
                            style={{
                              padding: 4, color: 'rgba(255,255,255,0.22)',
                              display: 'flex', alignItems: 'center'
                            }}
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                              <path d="M6 6l12 12M6 18L18 6" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
