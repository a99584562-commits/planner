import { useMemo, useState, type ReactNode } from 'react'
import { T } from '../tokens'
import { Glass, Mono, CheckCircle } from '../components'
import { Icon } from '../icons'
import { actions, useStore, type Category, type Task } from '../store'
import { AddTaskSheet } from '../components/AddTaskSheet'

const CATS: { k: Category; label: string; icon: ReactNode }[] = [
  { k: 'work',     label: 'Работа',   icon: <Icon.Briefcase c={T.ink2} /> },
  { k: 'personal', label: 'Личное',   icon: <Icon.Heart c={T.ink2} /> },
  { k: 'health',   label: 'Здоровье', icon: <Icon.Pulse c={T.ink2} /> },
  { k: 'home',     label: 'Дом',      icon: <Icon.Home s={14} c={T.ink2} /> }
]

export function TasksScreen() {
  const tasks = useStore(s => s.tasks)
  const [adding, setAdding] = useState(false)
  const [defaultCat, setDefaultCat] = useState<Category>('work')

  const grouped = useMemo(() => {
    const m: Record<Category, Task[]> = { work: [], personal: [], health: [], home: [] }
    for (const t of tasks) m[t.category].push(t)
    for (const k of Object.keys(m) as Category[]) {
      m[k].sort((a, b) => Number(a.done) - Number(b.done) || (b.hi ? 1 : 0) - (a.hi ? 1 : 0) || a.createdAt - b.createdAt)
    }
    return m
  }, [tasks])

  const total = tasks.length
  const done = tasks.filter(t => t.done).length

  function openSheet(cat: Category) {
    setDefaultCat(cat)
    setAdding(true)
  }

  const isEmpty = total === 0

  return (
    <div style={{ padding: '8px 20px 120px' }}>
      <div style={{ padding: '12px 0 4px' }}>
        <Mono>задачи</Mono>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: 4 }}>
          <div style={{ fontSize: 32, fontWeight: 600, color: T.ink, letterSpacing: -1 }}>Tasks</div>
          {total > 0 && (
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: T.ink3 }}>
              {done}/{total}
            </div>
          )}
        </div>
      </div>

      {!isEmpty && (
        <div style={{ display: 'flex', gap: 4, marginTop: 14 }}>
          {CATS.map(c => {
            const items = grouped[c.k]
            if (items.length === 0) return null
            const d = items.filter(i => i.done).length
            const f = d / items.length
            return (
              <div key={c.k} style={{
                flex: items.length, height: 4, borderRadius: 99,
                background: 'rgba(255,255,255,0.07)', overflow: 'hidden'
              }}>
                <div style={{ width: `${f * 100}%`, height: '100%', background: T.accent, borderRadius: 99 }} />
              </div>
            )
          })}
        </div>
      )}

      <div
        onClick={() => openSheet('work')}
        style={{
          marginTop: isEmpty ? 22 : 18, padding: '14px 16px',
          display: 'flex', alignItems: 'center', gap: 10,
          borderRadius: 22,
          background: 'rgba(36,30,26,0.32)',
          backdropFilter: 'blur(28px) saturate(160%)',
          WebkitBackdropFilter: 'blur(28px) saturate(160%)',
          border: '0.5px solid rgba(255,255,255,0.11)',
          boxShadow:
            '0 1px 0 rgba(255,255,255,0.08) inset, ' +
            '0 18px 44px rgba(0,0,0,0.5)',
          cursor: 'pointer'
        }}>
        <Icon.Plus s={14} c={T.accent} />
        <div style={{ flex: 1, fontSize: 14, color: T.ink2, letterSpacing: -0.1 }}>Добавить задачу</div>
      </div>

      {isEmpty && (
        <Glass style={{ marginTop: 18, padding: '38px 20px', textAlign: 'center' }}>
          <Mono size={10} style={{ display: 'block' }}>пусто</Mono>
          <div style={{ marginTop: 8, fontSize: 15, color: T.ink, fontWeight: 600, letterSpacing: -0.2 }}>
            Здесь будут твои задачи
          </div>
          <div style={{ marginTop: 6, fontSize: 12, color: T.ink3, lineHeight: 1.45 }}>
            Тапни «Добавить задачу» выше и распиши день — работа, личное, здоровье, дом.
          </div>
        </Glass>
      )}

      {CATS.map(c => {
        const items = grouped[c.k]
        if (items.length === 0) return null
        const dn = items.filter(i => i.done).length
        return (
          <div key={c.k} style={{ marginTop: 22 }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '0 4px 10px'
            }}>
              <div style={{ color: T.ink3 }}>{c.icon}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: T.ink2, letterSpacing: -0.1 }}>{c.label}</div>
              <Mono size={9}>({dn}/{items.length})</Mono>
              <div style={{ flex: 1 }} />
              <button onClick={() => openSheet(c.k)} style={{
                color: T.ink3, padding: 4, display: 'flex', alignItems: 'center'
              }} aria-label={`Добавить в ${c.label}`}>
                <Icon.Plus s={13} />
              </button>
            </div>
            <Glass pad={0} style={{ overflow: 'hidden' }}>
              {items.map((it, i) => (
                <TaskRow
                  key={it.id}
                  task={it}
                  isLast={i === items.length - 1}
                />
              ))}
            </Glass>
          </div>
        )
      })}

      <AddTaskSheet open={adding} onClose={() => setAdding(false)} defaultCategory={defaultCat} />
    </div>
  )
}

function TaskRow({ task, isLast }: { task: Task; isLast: boolean }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '13px 16px',
      background: task.hi && !task.done ? 'rgba(220,200,80,0.05)' : 'transparent',
      borderBottom: !isLast ? `0.5px solid ${T.hairline}` : 'none'
    }}>
      <button onClick={() => actions.toggleTask(task.id)} style={{ padding: 0, display: 'flex' }}>
        <CheckCircle done={task.done} />
      </button>
      <div
        onClick={() => actions.toggleTask(task.id)}
        style={{
          flex: 1, minWidth: 0, cursor: 'pointer',
          fontSize: 14,
          color: task.done ? T.ink3 : T.ink,
          textDecoration: task.done ? 'line-through' : 'none',
          letterSpacing: -0.1, fontWeight: 500
        }}>
        {task.title}
      </div>
      {task.hi && !task.done && (
        <div style={{ width: 6, height: 6, borderRadius: 99, background: T.accent }} />
      )}
      <button
        onClick={() => actions.deleteTask(task.id)}
        aria-label="Удалить"
        style={{ padding: 4, marginRight: -4, color: 'rgba(255,255,255,0.25)' }}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          <path d="M6 6l12 12M6 18L18 6" />
        </svg>
      </button>
    </div>
  )
}
