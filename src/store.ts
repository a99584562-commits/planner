import { useSyncExternalStore } from 'react'

export type Category = 'work' | 'personal' | 'health' | 'home'

export type Task = {
  id: string
  title: string
  category: Category
  done: boolean
  hi?: boolean
  createdAt: number
}

export type Habit = {
  id: string
  name: string
  target?: string
  hue: number
  createdAt: number
  history: string[]
}

type State = {
  name: string
  tasks: Task[]
  habits: Habit[]
}

const KEY = 'planner.state.v2'

const HUES = [60, 40, 220, 20, 280]

function load(): State {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      return {
        name: parsed.name ?? 'Артём',
        tasks: Array.isArray(parsed.tasks) ? parsed.tasks : [],
        habits: Array.isArray(parsed.habits) ? parsed.habits : []
      }
    }
  } catch {}
  return { name: 'Артём', tasks: [], habits: [] }
}

let state: State = typeof window === 'undefined' ? { name: 'Артём', tasks: [], habits: [] } : load()
const listeners = new Set<() => void>()

function save() {
  try { localStorage.setItem(KEY, JSON.stringify(state)) } catch {}
}
function emit() { listeners.forEach(l => l()) }
function set(next: State) { state = next; save(); emit() }

function subscribe(l: () => void) {
  listeners.add(l)
  return () => { listeners.delete(l) }
}

export function useStore<T>(selector: (s: State) => T): T {
  return useSyncExternalStore(subscribe, () => selector(state), () => selector(state))
}

export function uid(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36)
}

export function todayIso(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function dayBefore(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number)
  const date = new Date(y, m - 1, d - 1)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

export function streakOf(h: Habit): number {
  if (h.history.length === 0) return 0
  const set = new Set(h.history)
  let cursor = todayIso()
  if (!set.has(cursor)) cursor = dayBefore(cursor)
  let n = 0
  while (set.has(cursor)) {
    n++
    cursor = dayBefore(cursor)
  }
  return n
}

export function bestStreakOf(h: Habit): number {
  if (h.history.length === 0) return 0
  const sorted = [...h.history].sort()
  let best = 1, cur = 1
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i] === dayBefore(dayBefore(sorted[i - 1])) || sorted[i] === sorted[i - 1]) continue
    if (dayBefore(sorted[i]) === sorted[i - 1]) {
      cur++
      best = Math.max(best, cur)
    } else {
      cur = 1
    }
  }
  return best
}

export function patternOf(h: Habit, days: number = 13): string {
  const set = new Set(h.history)
  let cursor = todayIso()
  const arr: string[] = []
  for (let i = 0; i < days; i++) {
    arr.unshift(set.has(cursor) ? '1' : '0')
    cursor = dayBefore(cursor)
  }
  return arr.join('')
}

export function nextHue(habits: Habit[]): number {
  const used = habits.map(h => h.hue)
  for (const h of HUES) if (!used.includes(h)) return h
  return HUES[habits.length % HUES.length]
}

export const HUE_PALETTE = HUES

export const actions = {
  setName(name: string) {
    set({ ...state, name })
  },
  addTask(input: { title: string; category: Category; hi?: boolean }) {
    const title = input.title.trim()
    if (!title) return
    set({
      ...state,
      tasks: [...state.tasks, {
        id: uid(), title, category: input.category, done: false,
        hi: input.hi, createdAt: Date.now()
      }]
    })
  },
  toggleTask(id: string) {
    set({ ...state, tasks: state.tasks.map(t => t.id === id ? { ...t, done: !t.done } : t) })
  },
  deleteTask(id: string) {
    set({ ...state, tasks: state.tasks.filter(t => t.id !== id) })
  },
  addHabit(input: { name: string; target?: string; hue?: number }) {
    const name = input.name.trim()
    if (!name) return
    set({
      ...state,
      habits: [...state.habits, {
        id: uid(), name, target: input.target?.trim() || undefined,
        hue: input.hue ?? nextHue(state.habits),
        createdAt: Date.now(), history: []
      }]
    })
  },
  toggleHabitToday(id: string) {
    const t = todayIso()
    set({
      ...state,
      habits: state.habits.map(h => {
        if (h.id !== id) return h
        const has = h.history.includes(t)
        return { ...h, history: has ? h.history.filter(d => d !== t) : [...h.history, t] }
      })
    })
  },
  deleteHabit(id: string) {
    set({ ...state, habits: state.habits.filter(h => h.id !== id) })
  }
}
