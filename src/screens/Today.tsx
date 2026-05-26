import { useEffect, useMemo, useState } from 'react'
import { T } from '../tokens'
import { Glass, Mono, SecHead, CheckCircle, Pill } from '../components'
import { Icon } from '../icons'
import { actions, useStore, streakOf, todayIso } from '../store'
import { AddTaskSheet } from '../components/AddTaskSheet'

type Tab = 'today' | 'tasks' | 'board' | 'cal' | 'habits'

const MONTHS_GEN = ['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря']
const WEEKDAYS = ['воскресенье','понедельник','вторник','среда','четверг','пятница','суббота']

function useNow() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000)
    return () => clearInterval(id)
  }, [])
  return now
}

function greeting(hour: number): string {
  if (hour >= 5 && hour < 12) return 'Доброе утро'
  if (hour >= 12 && hour < 17) return 'Добрый день'
  if (hour >= 17 && hour < 23) return 'Добрый вечер'
  return 'Доброй ночи'
}

const CAT_LABEL: Record<string, string> = {
  work: 'работа', personal: 'личное', health: 'здоровье', home: 'дом'
}

export function TodayScreen({ go }: { go: (t: Tab) => void }) {
  const name = useStore(s => s.name)
  const tasks = useStore(s => s.tasks)
  const habits = useStore(s => s.habits)
  const now = useNow()
  const [adding, setAdding] = useState(false)

  const today = todayIso()
  const dow = WEEKDAYS[now.getDay()]
  const dateLabel = `${dow} · ${now.getDate()} ${MONTHS_GEN[now.getMonth()]}`

  const total = tasks.length
  const doneCount = tasks.filter(t => t.done).length
  const habitDone = habits.filter(h => h.history.includes(today)).length
  const bestActiveStreak = useMemo(
    () => habits.reduce((m, h) => Math.max(m, streakOf(h)), 0),
    [habits]
  )

  const topTasks = useMemo(
    () => tasks
      .filter(t => !t.done)
      .sort((a, b) => (b.hi ? 1 : 0) - (a.hi ? 1 : 0) || a.createdAt - b.createdAt)
      .slice(0, 3),
    [tasks]
  )

  return (
    <div style={{ padding: '8px 20px 120px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0 4px' }}>
        <div>
          <Mono>{dateLabel}</Mono>
          <div style={{ fontSize: 32, fontWeight: 600, color: T.ink, letterSpacing: -1, marginTop: 4 }}>
            {greeting(now.getHours())},<br/>{name}
          </div>
        </div>
        <div style={{
          width: 40, height: 40, borderRadius: 999,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'linear-gradient(135deg, oklch(0.5 0.08 60), oklch(0.35 0.04 40))',
          border: '0.5px solid rgba(255,255,255,0.15)',
          fontFamily: 'JetBrains Mono, monospace', fontSize: 15, fontWeight: 600,
          color: T.ink
        }}>{name.charAt(0).toUpperCase()}</div>
      </div>

      <Glass style={{ marginTop: 20, padding: 18, textAlign: 'left' }}>
        <Mono size={9}>сейчас</Mono>
        <div style={{
          marginTop: 8, fontSize: 19, color: T.ink, fontWeight: 600, letterSpacing: -0.3
        }}>
          {(() => {
            const h = now.getHours(), m = now.getMinutes()
            const time = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
            if (h >= 5 && h < 12) return `${time} — самое продуктивное время дня`
            if (h >= 12 && h < 17) return `${time} — продолжай разбирать задачи`
            if (h >= 17 && h < 23) return `${time} — закрывай день и подведи итоги`
            return `${time} — отдыхай, день закончен`
          })()}
        </div>
        <Mono style={{ display: 'block', marginTop: 6 }}>
          {total === 0
            ? 'добавь первую задачу'
            : doneCount === total
              ? 'все задачи закрыты'
              : `${total - doneCount} в работе · ${doneCount} закрыто`}
        </Mono>
        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          <Pill accent onClick={() => setAdding(true)}>+ Задача</Pill>
          <Pill onClick={() => go('tasks')}>К списку</Pill>
        </div>
      </Glass>

      <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
        <Glass pad={14} radius={18} style={{ flex: 1 }}>
          <Mono size={9}>задачи</Mono>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 6 }}>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 26, color: T.ink, letterSpacing: -1 }}>
              {total === 0 ? '0' : `${doneCount}/${total}`}
            </div>
          </div>
          <div style={{ marginTop: 6, height: 2, borderRadius: 99, background: 'rgba(255,255,255,0.08)' }}>
            <div style={{
              width: `${total ? (doneCount / total) * 100 : 0}%`,
              height: '100%', borderRadius: 99, background: T.accent
            }} />
          </div>
        </Glass>
        <Glass pad={14} radius={18} style={{ flex: 1 }}>
          <Mono size={9}>привычки</Mono>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 6 }}>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 26, color: T.ink, letterSpacing: -1 }}>
              {habits.length === 0 ? '0' : `${habitDone}/${habits.length}`}
            </div>
          </div>
          <Mono style={{ marginTop: 2, display: 'block' }} size={8}>
            {habits.length === 0 ? 'не задано' : 'на сегодня'}
          </Mono>
        </Glass>
        <Glass pad={14} radius={18} style={{ flex: 1 }}>
          <Mono size={9}>стрик</Mono>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 6 }}>
            <div style={{
              fontFamily: 'JetBrains Mono, monospace', fontSize: 26,
              color: bestActiveStreak > 0 ? T.accent : T.ink, letterSpacing: -1
            }}>{bestActiveStreak}</div>
            <Mono size={9}>дн</Mono>
          </div>
          <Mono style={{ marginTop: 2, display: 'block' }} size={8}>
            {bestActiveStreak > 0 ? 'лучший активный' : 'ещё нет'}
          </Mono>
        </Glass>
      </div>

      <div style={{ marginTop: 26 }}>
        <SecHead
          title="Задачи на сегодня"
          n={topTasks.length}
          right={
            total > 0
              ? <Pill style={{ height: 22, fontSize: 10 }} onClick={() => go('tasks')}>все</Pill>
              : undefined
          }
        />
      </div>

      {topTasks.length === 0 ? (
        <Glass style={{ marginTop: 14, padding: '28px 20px', textAlign: 'center' }}>
          <Mono size={10} style={{ display: 'block' }}>
            {total === 0 ? 'задач ещё нет' : 'всё закрыто'}
          </Mono>
          <div style={{ marginTop: 8, fontSize: 14, color: T.ink2, lineHeight: 1.45 }}>
            {total === 0
              ? 'Добавь первую — она появится здесь'
              : 'Хороший день. Можно отдохнуть.'}
          </div>
        </Glass>
      ) : (
        <Glass pad={0} style={{ marginTop: 14, overflow: 'hidden' }}>
          {topTasks.map((r, i, arr) => (
            <div key={r.id} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '13px 16px',
              background: r.hi ? 'rgba(220,200,80,0.05)' : 'transparent',
              borderBottom: i < arr.length - 1 ? `0.5px solid ${T.hairline}` : 'none'
            }}>
              <button onClick={() => actions.toggleTask(r.id)} style={{ padding: 0, display: 'flex' }}>
                <CheckCircle done={r.done} />
              </button>
              <div
                onClick={() => actions.toggleTask(r.id)}
                style={{
                  flex: 1, minWidth: 0, cursor: 'pointer',
                  fontSize: 14, color: T.ink,
                  letterSpacing: -0.1, fontWeight: 500
                }}>{r.title}</div>
              <Mono size={9}>{CAT_LABEL[r.category]}</Mono>
            </div>
          ))}
        </Glass>
      )}

      {habits.length > 0 && (
        <>
          <div style={{ marginTop: 26 }}>
            <SecHead
              title="Привычки"
              n={habits.length}
              right={<Pill style={{ height: 22, fontSize: 10 }} onClick={() => go('habits')}>все</Pill>}
            />
          </div>
          <Glass pad={0} style={{ marginTop: 14, overflow: 'hidden' }}>
            {habits.slice(0, 3).map((h, i, arr) => {
              const done = h.history.includes(today)
              return (
                <div key={h.id} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '13px 16px',
                  borderBottom: i < arr.length - 1 ? `0.5px solid ${T.hairline}` : 'none'
                }}>
                  <button onClick={() => actions.toggleHabitToday(h.id)} style={{ padding: 0, display: 'flex' }}>
                    <CheckCircle done={done} />
                  </button>
                  <div
                    onClick={() => actions.toggleHabitToday(h.id)}
                    style={{
                      flex: 1, fontSize: 14, color: T.ink,
                      textDecoration: done ? 'line-through' : 'none',
                      opacity: done ? 0.5 : 1,
                      letterSpacing: -0.1, fontWeight: 500, cursor: 'pointer'
                    }}>{h.name}</div>
                  {h.target && <Mono size={9}>{h.target}</Mono>}
                </div>
              )
            })}
          </Glass>
        </>
      )}

      <AddTaskSheet open={adding} onClose={() => setAdding(false)} />
    </div>
  )
}
