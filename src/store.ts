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

export type HabitType = 'check' | 'timer' | 'note'

export type HabitEntry = {
  date: string
  createdAt: number
  durationSec?: number
  note?: string
}

export type Habit = {
  id: string
  name: string
  target?: string
  hue: number
  type: HabitType
  createdAt: number
  entries: HabitEntry[]
}

type State = {
  name: string
  tasks: Task[]
  habits: Habit[]
}

const KEY = 'planner.state.v2'

const HUES = [60, 40, 220, 20, 280]

function migrateHabit(raw: any): Habit {
  if (raw.entries && raw.type) return raw as Habit
  const entries: HabitEntry[] = raw.entries
    ? raw.entries
    : Array.isArray(raw.history)
      ? raw.history.map((d: string) => ({ date: d, createdAt: 0 }))
      : []
  return {
    id: raw.id,
    name: raw.name,
    target: raw.target,
    hue: raw.hue,
    type: raw.type ?? 'check',
    createdAt: raw.createdAt ?? 0,
    entries
  }
}

function load(): State {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      return {
        name: parsed.name ?? 'Артём',
        tasks: Array.isArray(parsed.tasks) ? parsed.tasks : [],
        habits: Array.isArray(parsed.habits) ? parsed.habits.map(migrateHabit) : []
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

function uniqueDates(entries: HabitEntry[]): string[] {
  const set = new Set<string>()
  for (const e of entries) set.add(e.date)
  return Array.from(set)
}

export function hasEntryOn(h: Habit, iso: string): boolean {
  return h.entries.some(e => e.date === iso)
}

export function entriesOn(h: Habit, iso: string): HabitEntry[] {
  return h.entries
    .filter(e => e.date === iso)
    .sort((a, b) => a.createdAt - b.createdAt)
}

export function timerTotalOn(h: Habit, iso: string): number {
  return entriesOn(h, iso).reduce((a, e) => a + (e.durationSec || 0), 0)
}

export function lastNoteOf(h: Habit): HabitEntry | null {
  const notes = h.entries
    .filter(e => typeof e.note === 'string' && e.note.length > 0)
    .sort((a, b) => b.createdAt - a.createdAt)
  return notes[0] || null
}

export function streakOf(h: Habit): number {
  const dates = uniqueDates(h.entries)
  if (dates.length === 0) return 0
  const set = new Set(dates)
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
  const dates = uniqueDates(h.entries).sort()
  if (dates.length === 0) return 0
  let best = 1, cur = 1
  for (let i = 1; i < dates.length; i++) {
    if (dayBefore(dates[i]) === dates[i - 1]) {
      cur++
      best = Math.max(best, cur)
    } else {
      cur = 1
    }
  }
  return best
}

export function patternOf(h: Habit, days: number = 13): string {
  const set = new Set(uniqueDates(h.entries))
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

export function formatTimer(sec: number): string {
  const h = Math.floor(sec / 3600)
  const m = Math.floor((sec % 3600) / 60)
  const s = sec % 60
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  return `${m}:${String(s).padStart(2, '0')}`
}

export function formatDurationRu(sec: number): string {
  if (sec < 60) return `${sec} с`
  const m = Math.round(sec / 60)
  if (m < 60) return `${m} мин`
  const h = Math.floor(m / 60)
  const mr = m % 60
  if (mr === 0) return `${h} ч`
  return `${h} ч ${mr} мин`
}

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
  addHabit(input: { name: string; target?: string; hue?: number; type?: HabitType }) {
    const name = input.name.trim()
    if (!name) return
    set({
      ...state,
      habits: [...state.habits, {
        id: uid(),
        name,
        target: input.target?.trim() || undefined,
        hue: input.hue ?? nextHue(state.habits),
        type: input.type ?? 'check',
        createdAt: Date.now(),
        entries: []
      }]
    })
  },
  toggleCheckToday(id: string) {
    const t = todayIso()
    set({
      ...state,
      habits: state.habits.map(h => {
        if (h.id !== id) return h
        const has = hasEntryOn(h, t)
        if (has) return { ...h, entries: h.entries.filter(e => e.date !== t) }
        return { ...h, entries: [...h.entries, { date: t, createdAt: Date.now() }] }
      })
    })
  },
  addTimerEntry(id: string, durationSec: number) {
    if (durationSec <= 0) return
    const t = todayIso()
    set({
      ...state,
      habits: state.habits.map(h =>
        h.id === id
          ? { ...h, entries: [...h.entries, { date: t, createdAt: Date.now(), durationSec }] }
          : h
      )
    })
  },
  addNoteEntry(id: string, note: string) {
    const trimmed = note.trim()
    if (!trimmed) return
    const t = todayIso()
    set({
      ...state,
      habits: state.habits.map(h =>
        h.id === id
          ? { ...h, entries: [...h.entries, { date: t, createdAt: Date.now(), note: trimmed }] }
          : h
      )
    })
  },
  deleteEntry(habitId: string, entryCreatedAt: number) {
    set({
      ...state,
      habits: state.habits.map(h =>
        h.id === habitId
          ? { ...h, entries: h.entries.filter(e => e.createdAt !== entryCreatedAt) }
          : h
      )
    })
  },
  deleteHabit(id: string) {
    set({ ...state, habits: state.habits.filter(h => h.id !== id) })
  }
}
