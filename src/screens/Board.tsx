import { useEffect, useMemo, useState } from 'react'
import { T } from '../tokens'
import { Glass, Photo, Pill, Mono, CheckCircle } from '../components'
import { Icon } from '../icons'
import { actions, useStore, streakOf, hasEntryOn, todayIso } from '../store'
import { AddTaskSheet } from '../components/AddTaskSheet'

const MONTHS_EN = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC']
const WEEKDAYS = ['воскресенье','понедельник','вторник','среда','четверг','пятница','суббота']

function useNow() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000)
    return () => clearInterval(id)
  }, [])
  return now
}

export function BoardScreen() {
  const tasks = useStore(s => s.tasks)
  const habits = useStore(s => s.habits)
  const now = useNow()
  const today = todayIso()
  const [adding, setAdding] = useState(false)

  const dow = WEEKDAYS[now.getDay()]
  const monthEn = MONTHS_EN[now.getMonth()]
  const day = now.getDate()

  const total = tasks.length
  const doneCount = tasks.filter(t => t.done).length
  const topTasks = useMemo(
    () => tasks
      .filter(t => !t.done)
      .sort((a, b) => (b.hi ? 1 : 0) - (a.hi ? 1 : 0) || a.createdAt - b.createdAt)
      .slice(0, 3),
    [tasks]
  )
  const oneDone = tasks.find(t => t.done)

  const bestStreak = useMemo(
    () => habits.reduce((m, h) => Math.max(m, streakOf(h)), 0),
    [habits]
  )

  const habitDotsCount = habits.filter(h => hasEntryOn(h, today)).length
  const habitTotal = habits.length

  const hh = String(now.getHours()).padStart(2, '0')
  const mm = String(now.getMinutes()).padStart(2, '0')
  const isPM = now.getHours() >= 12

  return (
    <div style={{ padding: '8px 20px 120px', position: 'relative' }}>
      <div style={{ padding: '12px 0 4px' }}>
        <Mono>обзор · {dow} {day} {MONTHS_EN[now.getMonth()].toLowerCase()}</Mono>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 4 }}>
          <div style={{ fontSize: 32, fontWeight: 600, color: T.ink, letterSpacing: -1 }}>Сегодня</div>
        </div>
      </div>

      <div style={{
        position: 'relative', height: 720, marginTop: 18,
        borderRadius: 24, overflow: 'hidden',
        background: 'linear-gradient(180deg, oklch(0.11 0.005 60), oklch(0.14 0.008 60))',
        border: '0.5px solid rgba(255,255,255,0.06)'
      }}>
        <div style={{
          position: 'absolute', top: -40, left: -30, width: 240, height: 240,
          borderRadius: '50%', filter: 'blur(50px)', pointerEvents: 'none',
          background: 'radial-gradient(circle, oklch(0.55 0.13 65 / 0.7), transparent 70%)'
        }} />
        <div style={{
          position: 'absolute', top: 180, right: -80, width: 280, height: 280,
          borderRadius: '50%', filter: 'blur(60px)', pointerEvents: 'none',
          background: 'radial-gradient(circle, oklch(0.5 0.14 35 / 0.7), transparent 70%)'
        }} />
        <div style={{
          position: 'absolute', bottom: -60, left: -40, width: 260, height: 260,
          borderRadius: '50%', filter: 'blur(60px)', pointerEvents: 'none',
          background: 'radial-gradient(circle, oklch(0.45 0.09 220 / 0.6), transparent 70%)'
        }} />
        <div style={{
          position: 'absolute', top: 380, left: 60, width: 200, height: 200,
          borderRadius: '50%', filter: 'blur(50px)', pointerEvents: 'none',
          background: 'radial-gradient(circle, oklch(0.78 0.16 95 / 0.35), transparent 70%)'
        }} />
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: 'repeating-linear-gradient(90deg, rgba(255,255,255,0.03) 0 1px, transparent 1px 28px)'
        }} />

        <Photo h={170} w={140} hue={210} radius={18}
          style={{ position: 'absolute', top: 28, right: 32, opacity: 0.95 }} />
        <Photo h={130} w={170} hue={30} radius={18}
          style={{ position: 'absolute', top: 200, left: 60, opacity: 0.9 }} />
        <Photo h={170} w={200} hue={25} radius={18} label="FOCUS"
          style={{ position: 'absolute', bottom: 60, right: 0, opacity: 0.95 }} />

        <Glass style={{ position: 'absolute', top: 24, left: 16, width: 172 }} pad={14} radius={20}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 12 }}>
            <div style={{ fontSize: 16, fontWeight: 600, color: T.ink, letterSpacing: -0.3 }}>Сегодня</div>
            <Mono size={8} style={{ position: 'relative', top: -3 }}>
              ({doneCount}/{total})
            </Mono>
          </div>
          {total === 0 ? (
            <div style={{
              padding: '14px 4px', textAlign: 'center'
            }}>
              <Mono size={8} style={{ display: 'block' }}>пусто</Mono>
              <div style={{ marginTop: 6, fontSize: 11, color: T.ink2, lineHeight: 1.4 }}>
                добавь первую задачу
              </div>
            </div>
          ) : (
            <>
              {topTasks.map((r, i) => (
                <div key={r.id}
                  onClick={() => actions.toggleTask(r.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '8px 10px', marginBottom: 4, borderRadius: 11,
                    background: r.hi && i === 0 ? 'rgba(255,255,255,0.08)' : 'transparent',
                    border: r.hi && i === 0 ? '0.5px solid rgba(255,255,255,0.1)' : '0.5px solid transparent',
                    cursor: 'pointer'
                  }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: 11, fontWeight: 600, letterSpacing: -0.1,
                      color: T.ink,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                    }}>{r.title}</div>
                    {r.hi && i === 0 && (
                      <div style={{
                        fontSize: 9, color: T.accent, marginTop: 1,
                        fontFamily: 'JetBrains Mono, monospace'
                      }}>важно</div>
                    )}
                  </div>
                  <CheckCircle done={false} />
                </div>
              ))}
              {oneDone && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '8px 10px', marginBottom: 4, borderRadius: 11,
                  opacity: 0.45
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: 11, fontWeight: 600, letterSpacing: -0.1,
                      color: T.ink3, textDecoration: 'line-through',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                    }}>{oneDone.title}</div>
                  </div>
                  <CheckCircle done={true} />
                </div>
              )}
            </>
          )}
        </Glass>

        <div style={{ position: 'absolute', top: 196, right: 60, textAlign: 'right' }}>
          <Mono size={9} style={{ color: T.ink2, display: 'block' }}>СЕЙЧАС</Mono>
          <Mono size={9} style={{ color: T.ink2, display: 'block' }}>{hh}:{mm}</Mono>
          <Mono size={8} style={{ color: T.accent, marginTop: 6, display: 'block' }}>
            ● {dow.toUpperCase()}
          </Mono>
        </div>

        <Glass style={{
          position: 'absolute', top: 254, right: 84, width: 56, height: 36,
          display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
        }} pad={0} radius={14} onClick={() => setAdding(true)}>
          <Icon.Plus s={14} c={T.ink2} />
        </Glass>

        <Glass tint="rgba(245,240,230,0.95)" style={{
          position: 'absolute', top: 290, left: 28, width: 78, height: 78,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }} pad={0} radius={18}>
          <svg width="32" height="32" viewBox="0 0 32 32">
            <rect x="6" y="6" width="20" height="20" rx="4" stroke="#1a1a1a" strokeWidth="2.2" fill="none" />
            <path d="M11 17l3.5 3.5L22 12" stroke="#1a1a1a" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </svg>
        </Glass>

        <Glass tint="rgba(18,16,14,0.5)" style={{
          position: 'absolute', top: 246, left: 92, width: 152, height: 156
        }} pad={14} radius={20}>
          <Mono size={8}>энергия</Mono>
          <div style={{ marginTop: 10, fontSize: 18, fontWeight: 600, color: T.ink, letterSpacing: -0.3, lineHeight: 1.15 }}>
            {now.getHours() < 12 ? <>ясное<br/>утро</> : now.getHours() < 17 ? <>дневной<br/>фокус</> : <>спокойный<br/>вечер</>}
          </div>
          <div style={{ position: 'absolute', left: 14, right: 14, bottom: 14, display: 'flex', alignItems: 'flex-end', gap: 3, height: 22 }}>
            {[6, 9, 14, 18, 22, 18, 14, 10, 8, 6].map((h, i) => {
              const peak = now.getHours() < 12 ? 2 : now.getHours() < 17 ? 4 : 7
              return (
                <div key={i} style={{
                  flex: 1, height: h, borderRadius: 2,
                  background: i === peak ? T.accent : 'rgba(255,255,255,0.25)'
                }} />
              )
            })}
          </div>
        </Glass>

        <Pill accent style={{
          position: 'absolute', top: 414, left: 134, height: 28, padding: '0 14px',
          boxShadow: '0 8px 24px rgba(220,200,80,0.35), inset 0 1px 0 rgba(255,255,255,0.4)'
        }}>
          <Icon.Sparkle s={10} c={T.accentInk} />&nbsp;Deep work
        </Pill>

        <Glass tint="rgba(78,52,38,0.62)" style={{
          position: 'absolute', top: 306, right: 18, width: 158
        }} pad={14} radius={20}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
            <div style={{
              fontFamily: 'JetBrains Mono, monospace', fontSize: 32,
              color: T.ink, lineHeight: 1, letterSpacing: -1.5
            }}>{day}</div>
            <Mono size={10} style={{ color: T.ink2 }}>{monthEn}</Mono>
          </div>
          <Mono style={{ display: 'block', marginTop: 2 }} size={8}>
            {dow} · {habitDotsCount}/{habitTotal} привычек
          </Mono>
          <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: 3.5 }}>
            {Array.from({ length: 50 }).map((_, i) => {
              const seed = (day * 13 + i * 17) % 50
              const hi = seed < habitDotsCount * 3 + 2
              return <div key={i} style={{
                width: 7, height: 7, borderRadius: 99,
                background: hi ? T.accent : 'rgba(255,255,255,0.18)'
              }} />
            })}
          </div>
        </Glass>

        <Glass tint="rgba(28,26,24,0.5)" style={{
          position: 'absolute', top: 466, left: 8, width: 222, height: 76,
          display: 'flex', alignItems: 'center', gap: 10, paddingLeft: 14
        }} pad={0} radius={18}>
          <div style={{
            width: 46, height: 46, borderRadius: 999,
            background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.1)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            position: 'relative', flexShrink: 0
          }}>
            <div style={{
              position: 'absolute', top: 5, left: '50%', transform: 'translateX(-50%)',
              width: 6, height: 6, borderRadius: 999, background: T.accent
            }} />
            <Mono size={9} style={{ marginTop: 8 }}>
              {String(60 - now.getSeconds()).padStart(2, '0')}'
            </Mono>
          </div>
          <div>
            <Mono size={8} style={{ display: 'block' }}>сейчас</Mono>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 2 }}>
              <div style={{
                fontFamily: 'JetBrains Mono, monospace', fontSize: 30,
                color: T.ink, letterSpacing: -1.5, lineHeight: 1
              }}>{hh}:{mm}</div>
              <Mono size={9}>{isPM ? 'PM' : 'AM'}</Mono>
            </div>
          </div>
        </Glass>

        <Glass tint="rgba(18,16,14,0.5)" style={{
          position: 'absolute', bottom: 88, right: 16, padding: '10px 12px'
        }} radius={14} pad={0}>
          <Mono size={8} style={{ display: 'block' }}>стрик</Mono>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 2 }}>
            <div style={{
              fontFamily: 'JetBrains Mono, monospace', fontSize: 22,
              color: T.ink, letterSpacing: -1
            }}>{bestStreak}</div>
            <Mono size={8} style={{ color: bestStreak > 0 ? T.accent : T.ink3 }}>дн</Mono>
          </div>
        </Glass>

        <div style={{
          position: 'absolute', bottom: 22, right: 0, left: 0, textAlign: 'center'
        }}>
          <Mono size={9} style={{ color: T.ink3, letterSpacing: 4 }}>D A I L Y   B O A R D</Mono>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginTop: 16, overflowX: 'auto', paddingBottom: 4 }}>
        <Pill accent onClick={() => setAdding(true)}><Icon.Plus s={11} c={T.accentInk} />&nbsp;задача</Pill>
        <Pill>фокус</Pill>
        <Pill>заметки</Pill>
      </div>

      <AddTaskSheet open={adding} onClose={() => setAdding(false)} />
    </div>
  )
}
