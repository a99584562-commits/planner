import { useEffect, useRef, useState } from 'react'
import { T } from '../tokens'
import { Mono } from '../components'
import { Icon } from '../icons'
import { actions, type Category } from '../store'

const CATS: { k: Category; label: string }[] = [
  { k: 'work',     label: 'Работа' },
  { k: 'personal', label: 'Личное' },
  { k: 'health',   label: 'Здоровье' },
  { k: 'home',     label: 'Дом' }
]

export function AddTaskSheet({ open, onClose, defaultCategory }: {
  open: boolean
  onClose: () => void
  defaultCategory?: Category
}) {
  const [text, setText] = useState('')
  const [cat, setCat] = useState<Category>(defaultCategory ?? 'work')
  const [hi, setHi] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      setText('')
      setCat(defaultCategory ?? 'work')
      setHi(false)
      const t = setTimeout(() => inputRef.current?.focus(), 350)
      return () => clearTimeout(t)
    }
  }, [open, defaultCategory])

  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  function submit() {
    actions.addTask({ title: text, category: cat, hi })
    onClose()
  }

  return (
    <>
      <div
        onClick={onClose}
        aria-hidden
        style={{
          position: 'fixed', inset: 0, zIndex: 200,
          background: 'rgba(0,0,0,0.65)',
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
        <div style={{
          padding: '12px 12px max(20px, env(safe-area-inset-bottom))'
        }}>
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

            <Mono>новая задача</Mono>

            <input
              ref={inputRef}
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') submit() }}
              placeholder="Что нужно сделать?"
              autoComplete="off"
              autoCorrect="off"
              style={{
                marginTop: 10, width: '100%',
                background: 'transparent', border: 'none', outline: 'none',
                fontSize: 17, fontWeight: 500, letterSpacing: -0.2,
                color: T.ink,
                paddingBottom: 12,
                borderBottom: '0.5px solid rgba(255,255,255,0.1)'
              }}
            />

            <Mono style={{ display: 'block', marginTop: 16, marginBottom: 8 }}>категория</Mono>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {CATS.map(c => {
                const a = c.k === cat
                return (
                  <button key={c.k} onClick={() => setCat(c.k)} style={{
                    height: 32, padding: '0 14px', borderRadius: 999,
                    background: a ? T.accent : 'rgba(255,255,255,0.06)',
                    color: a ? T.accentInk : T.ink2,
                    fontSize: 12, fontWeight: 600, letterSpacing: -0.1,
                    border: '0.5px solid ' + (a ? 'transparent' : 'rgba(255,255,255,0.1)'),
                    transition: 'all 0.2s'
                  }}>{c.label}</button>
                )
              })}
            </div>

            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              marginTop: 14, padding: '10px 12px',
              borderRadius: 14,
              background: hi ? 'rgba(220,200,80,0.08)' : 'rgba(255,255,255,0.03)',
              border: '0.5px solid ' + (hi ? 'rgba(220,200,80,0.3)' : 'rgba(255,255,255,0.07)'),
              cursor: 'pointer'
            }} onClick={() => setHi(!hi)}>
              <div style={{
                width: 18, height: 18, borderRadius: 5,
                background: hi ? T.accent : 'transparent',
                border: '1.2px solid ' + (hi ? T.accent : 'rgba(255,255,255,0.25)'),
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.15s'
              }}>
                {hi && (
                  <svg width="11" height="9" viewBox="0 0 11 9">
                    <path d="M1 4.5L4 7.5L10 1.5" stroke={T.accentInk} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                  </svg>
                )}
              </div>
              <div style={{ flex: 1, fontSize: 13, color: T.ink, fontWeight: 500 }}>Приоритет</div>
              <Mono size={9}>важно</Mono>
            </div>

            <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
              <button onClick={onClose} style={{
                flex: 1, height: 44, borderRadius: 999,
                background: 'rgba(255,255,255,0.04)',
                border: '0.5px solid rgba(255,255,255,0.1)',
                color: T.ink2, fontSize: 13, fontWeight: 600
              }}>Отмена</button>
              <button onClick={submit} disabled={!text.trim()} style={{
                flex: 1, height: 44, borderRadius: 999,
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                background: T.accent, color: T.accentInk,
                fontSize: 13, fontWeight: 700, letterSpacing: -0.1,
                opacity: text.trim() ? 1 : 0.4,
                boxShadow: text.trim() ? '0 8px 22px rgba(220,200,80,0.3)' : 'none',
                transition: 'all 0.2s'
              }}>
                <Icon.Plus s={13} c={T.accentInk} />
                Добавить
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
