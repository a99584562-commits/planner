import { useMemo, useState } from 'react'
import { T } from '../tokens'
import { Glass, Pill, Mono } from '../components'
import { Icon } from '../icons'
import { useStore, todayIso } from '../store'

const MONTHS_RU = ['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь']
const MONTHS_EN = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC']
const WEEKDAYS = ['понедельник','вторник','среда','четверг','пятница','суббота','воскресенье']
const WEEK_LETTERS = ['П', 'В', 'С', 'Ч', 'П', 'С', 'В']
const WEEK_SHORT = ['пн','вт','ср','чт','пт','сб','вс']

function startOffset(year: number, month: number) {
  const dow = new Date(year, month, 1).getDay()
  return (dow + 6) % 7
}

function isoOf(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

function weekNumber(d: Date): number {
  const target = new Date(d.valueOf())
  const dayNr = (d.getDay() + 6) % 7
  target.setDate(target.getDate() - dayNr + 3)
  const firstThursday = new Date(target.getFullYear(), 0, 4)
  const diff = target.getTime() - firstThursday.getTime()
  return 1 + Math.round((diff / 86400000 - 3 + ((firstThursday.getDay() + 6) % 7)) / 7)
}

export function CalScreen() {
  const tasks = useStore(s => s.tasks)
  const habits = useStore(s => s.habits)
  const today = new Date()
  const todayStr = todayIso()

  const [view, setView] = useState({ year: today.getFullYear(), month: today.getMonth() })
  const [selectedIso, setSelectedIso] = useState(todayStr)

  const daysIn = new Date(view.year, view.month + 1, 0).getDate()
  const offset = startOffset(view.year, view.month)
  const cells = Array.from({ length: 42 }, (_, i) => {
    const d = i - offset + 1
    return d >= 1 && d <= daysIn ? d : null
  })

  const dotsByDay = useMemo(() => {
    const m: Record<number, number> = {}
    for (const h of habits) {
      for (const d of h.history) {
        if (d.startsWith(`${view.year}-${String(view.month + 1).padStart(2, '0')}`)) {
          const day = Number(d.slice(8))
          m[day] = (m[day] || 0) + 1
        }
      }
    }
    return m
  }, [habits, view])

  const selectedDay = selectedIso.startsWith(`${view.year}-${String(view.month + 1).padStart(2, '0')}`)
    ? Number(selectedIso.slice(8)) : null

  const selectedDate = new Date(selectedIso + 'T00:00:00')
  const selDow = WEEKDAYS[(selectedDate.getDay() + 6) % 7]
  const wk = weekNumber(selectedDate)

  const weekStart = (() => {
    const d = new Date(selectedDate)
    const dow = (d.getDay() + 6) % 7
    d.setDate(d.getDate() - dow)
    return d
  })()

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart)
    d.setDate(d.getDate() + i)
    const iso = isoOf(d.getFullYear(), d.getMonth(), d.getDate())
    const n = dotsByDay[d.getDate()] && d.getMonth() === view.month ? dotsByDay[d.getDate()] : 0
    return { d: d.getDate(), iso, w: WEEK_SHORT[i], n, isToday: iso === todayStr, fullDate: d }
  })

  function prev() {
    if (view.month === 0) setView({ year: view.year - 1, month: 11 })
    else setView({ year: view.year, month: view.month - 1 })
  }
  function next() {
    if (view.month === 11) setView({ year: view.year + 1, month: 0 })
    else setView({ year: view.year, month: view.month + 1 })
  }
  function goToday() {
    const now = new Date()
    setView({ year: now.getFullYear(), month: now.getMonth() })
    setSelectedIso(todayStr)
  }

  const tasksOnSelected = tasks.filter(t => !t.done).length // tasks are not date-bound yet
  const habitsOnSelected = habits.reduce((a, h) => a + (h.history.includes(selectedIso) ? 1 : 0), 0)

  return (
    <div style={{ padding: '8px 20px 120px' }}>
      <div style={{ padding: '12px 0 4px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div>
          <Mono>{view.year}</Mono>
          <div style={{ fontSize: 32, fontWeight: 600, color: T.ink, letterSpacing: -1, marginTop: 4 }}>
            {MONTHS_RU[view.month]}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <Pill onClick={prev}><Icon.Chevron dir="left" c={T.ink2} /></Pill>
          <Pill accent onClick={goToday}>Сегодня</Pill>
          <Pill onClick={next}><Icon.Chevron dir="right" c={T.ink2} /></Pill>
        </div>
      </div>

      <Glass pad={12} radius={18} style={{ marginTop: 18 }}>
        <Mono style={{ display: 'block', marginBottom: 10, paddingLeft: 4 }}>неделя {wk}</Mono>
        <div style={{ display: 'flex', gap: 6 }}>
          {weekDays.map(wd => {
            const s = wd.iso === selectedIso
            return (
              <div key={wd.iso} onClick={() => setSelectedIso(wd.iso)} style={{
                flex: 1, padding: '10px 0', borderRadius: 12,
                background: s ? T.accent : (wd.isToday ? 'rgba(255,255,255,0.06)' : 'transparent'),
                border: wd.isToday && !s ? '0.5px solid rgba(255,255,255,0.1)' : '0.5px solid transparent',
                textAlign: 'center', cursor: 'pointer'
              }}>
                <Mono size={8} style={{ color: s ? T.accentInk : T.ink3 }}>{wd.w}</Mono>
                <div style={{
                  fontFamily: 'JetBrains Mono, monospace', fontSize: 17,
                  color: s ? T.accentInk : T.ink, fontWeight: s ? 600 : 400, marginTop: 4
                }}>{wd.d}</div>
                <div style={{ display: 'flex', gap: 2, justifyContent: 'center', marginTop: 4, height: 4 }}>
                  {Array.from({ length: Math.min(wd.n, 4) }).map((_, i) => (
                    <div key={i} style={{
                      width: 3, height: 3, borderRadius: 99,
                      background: s ? T.accentInk : T.ink2
                    }} />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </Glass>

      <Glass tint="rgba(60,42,30,0.5)" style={{ marginTop: 14, padding: 16 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <div style={{
              fontFamily: 'JetBrains Mono, monospace', fontSize: 56, fontWeight: 500,
              color: T.ink, lineHeight: 1, letterSpacing: -3
            }}>{selectedDay ? String(selectedDay).padStart(2, '0') : '—'}</div>
            <div>
              <Mono size={12} style={{ color: T.ink2 }}>{MONTHS_EN[view.month]}</Mono>
              <div style={{ fontSize: 11, color: T.ink2, fontWeight: 500, marginTop: 2 }}>{selDow}</div>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <Mono size={8}>привычек</Mono>
            <div style={{
              fontFamily: 'JetBrains Mono, monospace', fontSize: 16,
              color: habitsOnSelected > 0 ? T.accent : T.ink, marginTop: 2
            }}>{habitsOnSelected}/{habits.length}</div>
          </div>
        </div>

        <div style={{
          marginTop: 16, padding: '14px 16px',
          borderRadius: 14,
          background: 'rgba(0,0,0,0.18)',
          border: '0.5px solid rgba(255,255,255,0.06)'
        }}>
          <Mono size={8} style={{ display: 'block' }}>заметка</Mono>
          <div style={{
            marginTop: 6, fontSize: 13, color: T.ink2, lineHeight: 1.5, letterSpacing: -0.1
          }}>
            {selectedIso === todayStr
              ? (tasksOnSelected === 0
                  ? 'Сегодня свободно. Добавь задач или отметь привычки.'
                  : `Открыто задач: ${tasksOnSelected}. Закрой что-нибудь — день станет легче.`)
              : 'Точки на днях — отмеченные привычки. Расписание событий появится позже.'}
          </div>
        </div>
      </Glass>

      <Glass style={{ marginTop: 14, padding: '14px 12px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, marginBottom: 6 }}>
          {WEEK_LETTERS.map((d, i) => (
            <div key={i} style={{
              textAlign: 'center', fontFamily: 'JetBrains Mono, monospace',
              fontSize: 9, color: T.ink3, padding: '4px 0'
            }}>{d}</div>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
          {cells.map((d, i) => {
            if (!d) return <div key={i} style={{ height: 38 }} />
            const iso = isoOf(view.year, view.month, d)
            const isSel = iso === selectedIso
            const isToday = iso === todayStr
            const n = dotsByDay[d] || 0
            return (
              <div key={i} onClick={() => setSelectedIso(iso)} style={{
                height: 38, borderRadius: 10, position: 'relative',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer',
                background: isSel ? T.accent
                  : isToday ? 'rgba(255,255,255,0.05)' : 'transparent',
                border: isToday && !isSel ? '0.5px solid rgba(255,255,255,0.1)' : '0.5px solid transparent'
              }}>
                <div style={{
                  fontFamily: 'JetBrains Mono, monospace', fontSize: 13,
                  color: isSel ? T.accentInk : T.ink, fontWeight: isSel ? 600 : 400
                }}>{d}</div>
                {n > 0 && !isSel && (
                  <div style={{ display: 'flex', gap: 1.5, marginTop: 2 }}>
                    {Array.from({ length: Math.min(n, 4) }).map((_, k) => (
                      <div key={k} style={{ width: 3, height: 3, borderRadius: 99, background: 'rgba(255,255,255,0.45)' }} />
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </Glass>
    </div>
  )
}
