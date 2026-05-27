import { useEffect, useRef, useState } from 'react'
import { T } from '../tokens'
import { Mono } from '../components'
import { actions, type Habit } from '../store'

type Props = { habit: Habit | null; open: boolean; onClose: () => void }

const MONTHS_RU = ['янв','фев','мар','апр','мая','июн','июл','авг','сен','окт','ноя','дек']

function fmtDate(iso: string): string {
  const [, m, d] = iso.split('-').map(Number)
  return `${d} ${MONTHS_RU[m - 1]}`
}

export function HabitNoteSheet({ habit, open, onClose }: Props) {
  const [text, setText] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (open) {
      setText('')
      const t = setTimeout(() => textareaRef.current?.focus(), 350)
      return () => clearTimeout(t)
    }
  }, [open, habit?.id])

  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  function save() {
    if (!habit) return
    actions.addNoteEntry(habit.id, text)
    onClose()
  }

  const hue = habit?.hue ?? 60
  const recent = (habit?.entries || [])
    .filter(e => typeof e.note === 'string' && e.note.length > 0)
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 3)

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
        position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 201,
        transform: open ? 'translateY(0)' : 'translateY(100%)',
        transition: 'transform 0.55s cubic-bezier(0.32,0.72,0,1)',
        maxWidth: 440, margin: '0 auto'
      }} role="dialog" aria-modal="true">
        <div style={{ padding: '12px 12px max(20px, env(safe-area-inset-bottom))' }}>
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

            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 11, flexShrink: 0,
                background: `linear-gradient(135deg, oklch(0.5 0.1 ${hue}), oklch(0.3 0.05 ${hue + 20}))`,
                border: '0.5px solid rgba(255,255,255,0.12)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'JetBrains Mono, monospace', fontSize: 13, color: T.ink, fontWeight: 600
              }}>{habit?.name[0]?.toUpperCase()}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <Mono size={9}>заметка на сегодня</Mono>
                <div style={{
                  fontSize: 17, fontWeight: 600, color: T.ink, letterSpacing: -0.2,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                }}>{habit?.name}</div>
              </div>
              {habit?.target && <Mono>{habit.target}</Mono>}
            </div>

            <textarea
              ref={textareaRef}
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Что сегодня?"
              rows={5}
              style={{
                marginTop: 16, width: '100%',
                padding: 14, borderRadius: 14,
                background: 'rgba(0,0,0,0.25)',
                border: '0.5px solid rgba(255,255,255,0.08)',
                outline: 'none', resize: 'none',
                color: T.ink, fontSize: 14, lineHeight: 1.5,
                fontFamily: 'Inter Tight, system-ui, sans-serif',
                letterSpacing: -0.1
              }}
            />

            {recent.length > 0 && (
              <>
                <Mono style={{ display: 'block', marginTop: 16, marginBottom: 8 }}>последние записи</Mono>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 200, overflowY: 'auto' }}>
                  {recent.map(e => (
                    <div key={e.createdAt} style={{
                      padding: '10px 12px',
                      borderRadius: 12,
                      background: 'rgba(255,255,255,0.025)',
                      border: '0.5px solid rgba(255,255,255,0.05)'
                    }}>
                      <Mono size={8} style={{ display: 'block' }}>{fmtDate(e.date)}</Mono>
                      <div style={{
                        marginTop: 4, fontSize: 13, color: T.ink2, lineHeight: 1.45,
                        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as any,
                        overflow: 'hidden', textOverflow: 'ellipsis'
                      }}>{e.note}</div>
                    </div>
                  ))}
                </div>
              </>
            )}

            <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
              <button onClick={onClose} style={{
                flex: 1, height: 44, borderRadius: 999,
                background: 'rgba(255,255,255,0.04)',
                border: '0.5px solid rgba(255,255,255,0.1)',
                color: T.ink2, fontSize: 13, fontWeight: 600
              }}>Отмена</button>
              <button onClick={save} disabled={!text.trim()} style={{
                flex: 1, height: 44, borderRadius: 999,
                background: T.accent, color: T.accentInk,
                fontSize: 13, fontWeight: 700, letterSpacing: -0.1,
                opacity: text.trim() ? 1 : 0.4,
                boxShadow: text.trim() ? '0 8px 22px rgba(220,200,80,0.3)' : 'none'
              }}>Сохранить</button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
