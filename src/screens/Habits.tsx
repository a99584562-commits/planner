import { useMemo, useState } from 'react'
import { T } from '../tokens'
import { Glass, Mono, SecHead, CheckCircle } from '../components'
import { Icon } from '../icons'
import {
  actions,
  useStore,
  streakOf,
  bestStreakOf,
  patternOf,
  timerTotalOn,
  hasEntryOn,
  lastNoteOf,
  formatDurationRu,
  todayIso,
  type Habit
} from '../store'
import { AddHabitSheet } from '../components/AddHabitSheet'
import { HabitTimerSheet } from '../components/HabitTimerSheet'
import { HabitNoteSheet } from '../components/HabitNoteSheet'
import { HabitDetailSheet } from '../components/HabitDetailSheet'

export function HabitsScreen() {
  const habits = useStore(s => s.habits)
  const [adding, setAdding] = useState(false)
  const [timerFor, setTimerFor] = useState<Habit | null>(null)
  const [noteFor, setNoteFor] = useState<Habit | null>(null)
  const [detailFor, setDetailFor] = useState<Habit | null>(null)

  const today = todayIso()
  const doneToday = habits.filter(h => hasEntryOn(h, today)).length
  const best = useMemo(() => habits.reduce((m, h) => Math.max(m, bestStreakOf(h)), 0), [habits])

  const yearCounts = useMemo(() => {
    const counts = new Map<string, number>()
    for (const h of habits) for (const e of h.entries) counts.set(e.date, (counts.get(e.date) || 0) + 1)
    return counts
  }, [habits])

  const isEmpty = habits.length === 0
  const summaryTint = isEmpty ? 'rgba(36,30,26,0.32)' : 'rgba(60,42,30,0.5)'

  const activeDetailHabit = detailFor ? habits.find(h => h.id === detailFor.id) || null : null
  const activeTimerHabit = timerFor ? habits.find(h => h.id === timerFor.id) || null : null
  const activeNoteHabit = noteFor ? habits.find(h => h.id === noteFor.id) || null : null

  return (
    <div style={{ padding: '8px 20px 120px' }}>
      <div style={{ padding: '12px 0 4px' }}>
        <Mono>привычки</Mono>
        <div style={{ fontSize: 32, fontWeight: 600, color: T.ink, letterSpacing: -1, marginTop: 4 }}>Habits</div>
      </div>

      <Glass tint={summaryTint} style={{ marginTop: 18, padding: 16 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <Mono size={9}>выполнено сегодня</Mono>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 6 }}>
              <div style={{
                fontFamily: 'JetBrains Mono, monospace', fontSize: 38,
                color: T.ink, lineHeight: 1, letterSpacing: -1.5
              }}>{doneToday}</div>
              <Mono size={11} style={{ color: T.ink2 }}>/ {Math.max(habits.length, 0)}</Mono>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <Mono size={9}>лучший стрик</Mono>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 6, justifyContent: 'flex-end' }}>
              <div style={{
                fontFamily: 'JetBrains Mono, monospace', fontSize: 24,
                color: best > 0 ? T.accent : T.ink3, lineHeight: 1, letterSpacing: -1
              }}>{best}</div>
              <Mono size={9}>дн</Mono>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 16 }}>
          <Mono size={8} style={{ display: 'block', marginBottom: 6 }}>год · 365 дней</Mono>
          <YearHeatmap counts={yearCounts} maxLevel={Math.max(habits.length, 3)} />
        </div>
      </Glass>

      {isEmpty ? (
        <Glass style={{ marginTop: 18, padding: '38px 20px', textAlign: 'center' }}>
          <Mono size={10} style={{ display: 'block' }}>пусто</Mono>
          <div style={{ marginTop: 8, fontSize: 15, color: T.ink, fontWeight: 600, letterSpacing: -0.2 }}>
            Добавь свою первую привычку
          </div>
          <div style={{ marginTop: 6, fontSize: 12, color: T.ink3, lineHeight: 1.45 }}>
            Галочка, таймер или текстовая заметка — выбери способ фиксации.
          </div>
          <button onClick={() => setAdding(true)} style={{
            marginTop: 16, display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '0 16px', height: 36, borderRadius: 999,
            background: T.accent, color: T.accentInk,
            fontSize: 13, fontWeight: 700, letterSpacing: -0.1,
            boxShadow: '0 8px 22px rgba(220,200,80,0.3)'
          }}>
            <Icon.Plus s={13} c={T.accentInk} />
            Новая привычка
          </button>
        </Glass>
      ) : (
        <>
          <div style={{ marginTop: 22 }}>
            <SecHead title="Сегодня" n={habits.length} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 14 }}>
            {habits.map(h => (
              <HabitCard
                key={h.id}
                h={h}
                onOpenTimer={() => setTimerFor(h)}
                onOpenNote={() => setNoteFor(h)}
                onOpenDetail={() => setDetailFor(h)}
              />
            ))}

            <button onClick={() => setAdding(true)} style={{
              padding: 14, borderRadius: 22, display: 'flex', alignItems: 'center', gap: 10,
              border: '0.5px dashed rgba(255,255,255,0.18)',
              background: 'transparent', width: '100%', textAlign: 'left'
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: 14,
                background: 'rgba(255,255,255,0.04)',
                border: '0.5px dashed rgba(255,255,255,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <Icon.Plus s={16} c={T.ink2} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, color: T.ink2, fontWeight: 500 }}>Новая привычка</div>
                <Mono style={{ marginTop: 2, display: 'block' }} size={9}>галочка · таймер · заметка</Mono>
              </div>
            </button>
          </div>
        </>
      )}

      <AddHabitSheet open={adding} onClose={() => setAdding(false)} />
      <HabitTimerSheet habit={activeTimerHabit} open={!!timerFor} onClose={() => setTimerFor(null)} />
      <HabitNoteSheet habit={activeNoteHabit} open={!!noteFor} onClose={() => setNoteFor(null)} />
      <HabitDetailSheet habit={activeDetailHabit} open={!!detailFor} onClose={() => setDetailFor(null)} />
    </div>
  )
}

function HabitCard({
  h, onOpenTimer, onOpenNote, onOpenDetail
}: {
  h: Habit
  onOpenTimer: () => void
  onOpenNote: () => void
  onOpenDetail: () => void
}) {
  const today = todayIso()
  const doneToday = hasEntryOn(h, today)
  const streak = streakOf(h)
  const pattern = patternOf(h, 13)

  const subline: string | null = (() => {
    if (h.type === 'timer') {
      const sec = timerTotalOn(h, today)
      if (sec > 0) return `сегодня · ${formatDurationRu(sec)}`
      return h.target ? h.target : null
    }
    if (h.type === 'note') {
      if (doneToday) {
        const entries = h.entries
          .filter(e => e.date === today && e.note)
          .sort((a, b) => b.createdAt - a.createdAt)
        const txt = entries[0]?.note || ''
        return txt.length > 0 ? `«${txt.slice(0, 42)}${txt.length > 42 ? '…' : ''}»` : null
      }
      const last = lastNoteOf(h)
      if (last) return `последняя · ${last.note!.slice(0, 36)}${last.note!.length > 36 ? '…' : ''}`
      return h.target ? h.target : null
    }
    return h.target ? h.target : null
  })()

  return (
    <Glass pad={0} style={{ padding: 14, display: 'flex', alignItems: 'center', gap: 14 }}>
      <button onClick={onOpenDetail} style={{
        width: 44, height: 44, borderRadius: 14, flexShrink: 0,
        background: `linear-gradient(135deg, oklch(0.5 0.1 ${h.hue}), oklch(0.3 0.05 ${h.hue + 20}))`,
        border: '0.5px solid rgba(255,255,255,0.12)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'JetBrains Mono, monospace', fontSize: 14, color: T.ink, fontWeight: 600
      }}>{h.name[0]?.toUpperCase()}</button>

      <div
        onClick={onOpenDetail}
        style={{ flex: 1, minWidth: 0, cursor: 'pointer' }}
      >
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 }}>
          <div style={{
            fontSize: 15, fontWeight: 600, color: T.ink, letterSpacing: -0.2,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
          }}>{h.name}</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 3, flexShrink: 0 }}>
            <div style={{
              fontFamily: 'JetBrains Mono, monospace', fontSize: 13,
              color: streak > 0 ? T.accent : T.ink3
            }}>{streak}</div>
            <Mono size={8}>дн</Mono>
          </div>
        </div>
        {subline && (
          <div style={{
            marginTop: 2, fontSize: 11,
            color: h.type === 'note' && doneToday ? T.ink2 : T.ink3,
            fontFamily: h.type === 'note' ? 'Inter Tight, system-ui, sans-serif' : 'JetBrains Mono, monospace',
            letterSpacing: h.type === 'note' ? -0.1 : 0.5,
            textTransform: h.type === 'note' ? 'none' as const : 'uppercase' as const,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
          }}>{subline}</div>
        )}
        <div style={{ display: 'flex', gap: 2.5, marginTop: 8 }}>
          {pattern.split('').map((c, j) => (
            <div key={j} style={{
              flex: 1, height: 4, borderRadius: 2,
              background: c === '1' ? T.accent : 'rgba(255,255,255,0.1)'
            }} />
          ))}
        </div>
      </div>

      <HabitActionButton
        h={h}
        onOpenTimer={onOpenTimer}
        onOpenNote={onOpenNote}
      />

      <button
        onClick={() => actions.deleteHabit(h.id)}
        aria-label="Удалить"
        style={{ padding: 4, marginRight: -4, marginLeft: -4, color: 'rgba(255,255,255,0.22)' }}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          <path d="M6 6l12 12M6 18L18 6" />
        </svg>
      </button>
    </Glass>
  )
}

export function HabitActionButton({
  h, onOpenTimer, onOpenNote
}: {
  h: Habit
  onOpenTimer: () => void
  onOpenNote: () => void
}) {
  const today = todayIso()
  const doneToday = hasEntryOn(h, today)

  if (h.type === 'check') {
    return (
      <button onClick={() => actions.toggleCheckToday(h.id)} style={{ padding: 0, display: 'flex' }}>
        <CheckCircle done={doneToday} />
      </button>
    )
  }

  if (h.type === 'timer') {
    const sec = timerTotalOn(h, today)
    return (
      <button onClick={onOpenTimer} style={{
        display: 'inline-flex', alignItems: 'center', gap: 5,
        padding: '0 10px', height: 32, borderRadius: 999,
        background: doneToday ? 'rgba(220,200,80,0.15)' : 'rgba(255,255,255,0.05)',
        border: '0.5px solid ' + (doneToday ? 'rgba(220,200,80,0.35)' : 'rgba(255,255,255,0.12)'),
        color: doneToday ? T.accent : T.ink2
      }} aria-label="Таймер">
        <svg width="11" height="11" viewBox="0 0 24 24" fill={doneToday ? T.accent : 'none'} stroke={doneToday ? T.accent : T.ink2} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M8 5v14l11-7L8 5z" />
        </svg>
        <span style={{
          fontFamily: 'JetBrains Mono, monospace', fontSize: 11, fontWeight: 500
        }}>{sec > 0 ? formatDurationRu(sec).replace(' ', '') : '0с'}</span>
      </button>
    )
  }

  return (
    <button onClick={onOpenNote} style={{
      width: 32, height: 32, borderRadius: 999,
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      background: doneToday ? 'rgba(220,200,80,0.15)' : 'rgba(255,255,255,0.05)',
      border: '0.5px solid ' + (doneToday ? 'rgba(220,200,80,0.35)' : 'rgba(255,255,255,0.12)'),
      color: doneToday ? T.accent : T.ink2
    }} aria-label="Заметка">
      {doneToday ? (
        <svg width="11" height="9" viewBox="0 0 11 9">
          <path d="M1 4.5L4 7.5L10 1.5" stroke={T.accent} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </svg>
      ) : (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 19l4-1 11-11-3-3L5 15l-1 4z" />
        </svg>
      )}
    </button>
  )
}

function YearHeatmap({ counts, maxLevel }: { counts: Map<string, number>; maxLevel: number }) {
  const cells: number[] = []
  const today = new Date()
  const days = 53 * 5
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    const v = counts.get(iso) || 0
    const lvl = v === 0 ? 0 : v < Math.max(2, maxLevel * 0.4) ? 1 : v < Math.max(3, maxLevel * 0.75) ? 2 : 3
    cells.push(lvl)
  }
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(53, 1fr)', gap: 1.5 }}>
      {cells.map((lvl, i) => {
        const bg = lvl === 0 ? 'rgba(255,255,255,0.06)'
          : lvl === 1 ? 'rgba(255,255,255,0.18)'
          : lvl === 2 ? 'oklch(0.7 0.1 90 / 0.55)'
          : T.accent
        return <div key={i} style={{ aspectRatio: '1', borderRadius: 1.5, background: bg }} />
      })}
    </div>
  )
}
