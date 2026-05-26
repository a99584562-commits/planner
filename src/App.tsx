import { useEffect, useState } from 'react'
import { T } from './tokens'
import { Backdrop } from './components'
import { Icon } from './icons'
import { TodayScreen } from './screens/Today'
import { TasksScreen } from './screens/Tasks'
import { CalScreen } from './screens/Cal'
import { BoardScreen } from './screens/Board'
import { HabitsScreen } from './screens/Habits'

type Tab = 'today' | 'tasks' | 'board' | 'cal' | 'habits'

const TABS: { k: Tab; label: string; icon: typeof Icon.Home }[] = [
  { k: 'today',  label: 'Today',  icon: Icon.Home },
  { k: 'tasks',  label: 'Tasks',  icon: Icon.List },
  { k: 'board',  label: 'Board',  icon: Icon.Grid },
  { k: 'cal',    label: 'Cal',    icon: Icon.Cal },
  { k: 'habits', label: 'Habits', icon: Icon.Flame }
]

function BottomNav({ active, onChange }: { active: Tab; onChange: (t: Tab) => void }) {
  return (
    <div style={{
      position: 'fixed',
      left: 16, right: 16,
      bottom: 'max(22px, env(safe-area-inset-bottom))',
      maxWidth: 372, margin: '0 auto',
      borderRadius: 28, overflow: 'hidden',
      background: 'rgba(20,18,16,0.42)',
      backdropFilter: 'blur(32px) saturate(180%)',
      WebkitBackdropFilter: 'blur(32px) saturate(180%)',
      border: '0.5px solid rgba(255,255,255,0.1)',
      boxShadow:
        '0 1px 0 rgba(255,255,255,0.08) inset, ' +
        '0 -1px 0 rgba(0,0,0,0.4) inset, ' +
        '0 18px 40px rgba(0,0,0,0.55)',
      zIndex: 100
    }}>
      <div style={{
        position: 'absolute', top: 0, left: '15%', right: '15%', height: 1,
        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.22), transparent)'
      }} />
      <div style={{ display: 'flex', padding: '10px 8px' }}>
        {TABS.map(t => {
          const a = t.k === active
          const IconC = t.icon
          return (
            <button key={t.k} onClick={() => onChange(t.k)} style={{
              flex: 1, display: 'flex', flexDirection: 'column',
              alignItems: 'center', gap: 4, padding: '8px 0',
              position: 'relative'
            }}>
              {a && (
                <div style={{
                  position: 'absolute', top: 0, left: '30%', right: '30%', height: 2,
                  borderRadius: 99, background: T.accent,
                  boxShadow: `0 0 12px ${T.accent}`
                }} />
              )}
              <div style={{ color: a ? T.accent : T.ink3, transition: 'color 0.2s' }}>
                <IconC s={20} c="currentColor" fill={a} />
              </div>
              <div style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 8.5, letterSpacing: 0.5, textTransform: 'uppercase',
                color: a ? T.ink : T.ink3, transition: 'color 0.2s'
              }}>{t.label}</div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default function App() {
  const [tab, setTab] = useState<Tab>(() => {
    const saved = (typeof window !== 'undefined' && localStorage.getItem('planner-tab')) as Tab | null
    return saved && ['today','tasks','board','cal','habits'].includes(saved) ? saved : 'today'
  })

  useEffect(() => { localStorage.setItem('planner-tab', tab) }, [tab])

  const screen = ({
    today:  <TodayScreen go={setTab} />,
    tasks:  <TasksScreen />,
    cal:    <CalScreen />,
    board:  <BoardScreen />,
    habits: <HabitsScreen />
  })[tab]

  return (
    <div style={{
      position: 'relative',
      minHeight: '100dvh',
      width: '100%',
      maxWidth: 440,
      margin: '0 auto',
      overflowX: 'hidden'
    }}>
      <Backdrop />
      <div style={{
        position: 'relative',
        paddingTop: 'max(36px, env(safe-area-inset-top))'
      }}>
        {screen}
      </div>
      <BottomNav active={tab} onChange={setTab} />
    </div>
  )
}
