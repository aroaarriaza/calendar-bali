'use client'

import { useState, useEffect } from 'react'

type Category = 'activity' | 'travel' | 'social' | 'wellness' | 'work'

interface Event {
  id: string
  date: string
  time?: string
  title: string
  category: Category
}

const CATEGORIES: Record<Category, { label: string; color: string; bg: string; border: string }> = {
  activity: { label: 'Actividad', color: '#e8b870', bg: 'rgba(180,100,30,0.25)', border: '#c07830' },
  travel:   { label: 'Viaje',     color: '#90c0e8', bg: 'rgba(60,120,180,0.2)',   border: '#5090c0' },
  social:   { label: 'Social',    color: '#c090e8', bg: 'rgba(120,60,160,0.25)',  border: '#9060c0' },
  wellness: { label: 'Bienestar', color: '#80d0a0', bg: 'rgba(40,140,80,0.2)',    border: '#50a870' },
  work:     { label: 'Trabajo',   color: '#e09090', bg: 'rgba(180,60,60,0.2)',    border: '#b05050' },
}

const SEED_EVENTS: Event[] = [
  { id: 'seed-1', date: '2026-07-02', title: 'Templo Tanah Lot', category: 'activity' },
  { id: 'seed-2', date: '2026-07-03', title: '🎉 Sandbar', category: 'social' },
  { id: 'seed-3', date: '2026-07-04', title: '🎉 Finns', category: 'social' },
  { id: 'seed-4', date: '2026-07-11', title: '🎉 Atlas', category: 'social' },
  { id: 'seed-5', date: '2026-07-13', title: '🌋 Monte Batour', category: 'activity' },
  { id: 'seed-6', date: '2026-07-22', title: 'Fin reserva villa', category: 'work' },
]

const WEEKDAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
const DAYS_IN_JULY = 31
const START_OFFSET = 2 // 1 julio 2026 = miércoles

function dateStr(day: number) {
  return `2026-07-${String(day).padStart(2, '0')}`
}

export default function CalendarClient() {
  const [events, setEvents] = useState<Event[]>([])
  const [modal, setModal] = useState<{ date: string; event?: Event } | null>(null)
  const [form, setForm] = useState({ title: '', time: '', category: 'activity' as Category })

  useEffect(() => {
    const saved = localStorage.getItem('bali-events')
    const seedIds = new Set(SEED_EVENTS.map(e => e.id))
    const existing: Event[] = saved ? JSON.parse(saved) : []
    // Los seed events siempre se actualizan con la versión del código
    const userEvents = existing.filter(e => !seedIds.has(e.id))
    const merged = [...SEED_EVENTS, ...userEvents]
    setEvents(merged)
    localStorage.setItem('bali-events', JSON.stringify(merged))
  }, [])

  const persist = (evts: Event[]) => {
    setEvents(evts)
    localStorage.setItem('bali-events', JSON.stringify(evts))
  }

  const openAdd = (date: string) => {
    setForm({ title: '', time: '', category: 'activity' })
    setModal({ date })
  }

  const openEdit = (ev: Event, e: React.MouseEvent) => {
    e.stopPropagation()
    setForm({ title: ev.title, time: ev.time || '', category: ev.category })
    setModal({ date: ev.date, event: ev })
  }

  const handleSave = () => {
    if (!form.title.trim() || !modal) return
    if (modal.event) {
      persist(events.map(e => e.id === modal.event!.id ? { ...e, ...form } : e))
    } else {
      persist([...events, { id: Date.now().toString(), date: modal.date, ...form }])
    }
    setModal(null)
  }

  const handleDelete = () => {
    if (!modal?.event) return
    persist(events.filter(e => e.id !== modal.event!.id))
    setModal(null)
  }

  const eventsForDay = (day: number) =>
    events
      .filter(e => e.date === dateStr(day))
      .sort((a, b) => (a.time || '').localeCompare(b.time || ''))

  const today = new Date()
  const isToday = (day: number) =>
    today.getFullYear() === 2026 && today.getMonth() === 6 && today.getDate() === day

  const cells = [
    ...Array(START_OFFSET).fill(null),
    ...Array.from({ length: DAYS_IN_JULY }, (_, i) => i + 1),
  ]

  return (
    <div style={{ background: '#1a0f0a', minHeight: '100vh', padding: '32px 16px',
      backgroundImage: 'radial-gradient(ellipse at 20% 50%, rgba(180,100,30,0.12) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(200,140,60,0.08) 0%, transparent 50%)' }}>

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <div style={{ fontSize: '2.5rem', marginBottom: 8 }}>🌴</div>
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(2rem, 5vw, 3rem)', color: '#e8c87a', letterSpacing: '0.05em', lineHeight: 1 }}>
          Julio 2026
        </h1>
        <div style={{ fontSize: '0.8rem', color: '#8a7060', letterSpacing: '0.25em', textTransform: 'uppercase', marginTop: 6 }}>
          Bali, Indonesia
        </div>
      </div>

      {/* Días de semana */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6, maxWidth: 1100, margin: '0 auto 6px' }}>
        {WEEKDAYS.map((d, i) => (
          <div key={d} style={{ textAlign: 'center', fontSize: '0.7rem', fontWeight: 500, letterSpacing: '0.12em',
            textTransform: 'uppercase', color: i >= 5 ? '#e8a060' : '#b8956a', padding: '8px 0' }}>
            {d}
          </div>
        ))}
      </div>

      {/* Grid del calendario */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6, maxWidth: 1100, margin: '0 auto' }}>
        {cells.map((day, idx) => {
          if (!day) return <div key={`empty-${idx}`} />

          const isWeekend = idx % 7 >= 5
          const dayEvents = eventsForDay(day)
          const todayMark = isToday(day)

          return (
            <div
              key={day}
              onClick={() => openAdd(dateStr(day))}
              style={{
                background: todayMark ? '#2a1a08' : '#251510',
                border: `1px solid ${todayMark ? '#e8c87a' : dayEvents.length ? '#6a3d20' : '#3a2015'}`,
                borderRadius: 10,
                minHeight: 110,
                padding: 10,
                cursor: 'pointer',
              }}
            >
              <div style={{
                fontSize: '0.85rem', fontWeight: 500, marginBottom: 6, lineHeight: 1,
                color: isWeekend ? '#e8a060' : '#c0a080',
                ...(todayMark ? {
                  background: '#e8c87a', color: '#1a0f0a', borderRadius: '50%',
                  width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center',
                } : {}),
              }}>
                {day}
              </div>

              {dayEvents.map(ev => {
                const cat = CATEGORIES[ev.category]
                return (
                  <div
                    key={ev.id}
                    onClick={e => openEdit(ev, e)}
                    style={{
                      fontSize: '0.68rem', lineHeight: 1.3, padding: '3px 6px', borderRadius: 5, marginBottom: 3,
                      background: cat.bg, color: cat.color, borderLeft: `2px solid ${cat.border}`, cursor: 'pointer',
                    }}
                  >
                    {ev.time && <span style={{ opacity: 0.7, fontSize: '0.62rem', marginRight: 3 }}>{ev.time}</span>}
                    {ev.title}
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>

      {/* Leyenda */}
      <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', marginTop: 28 }}>
        {Object.entries(CATEGORIES).map(([key, cat]) => (
          <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.72rem', color: '#8a7060' }}>
            <div style={{ width: 10, height: 10, borderRadius: 3, background: cat.border }} />
            {cat.label}
          </div>
        ))}
      </div>

      {/* Modal */}
      {modal && (
        <div
          onClick={() => setModal(null)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex',
            alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 16 }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ background: '#251510', border: '1px solid #6a3d20', borderRadius: 14,
              padding: 24, width: '100%', maxWidth: 400 }}
          >
            <div style={{ fontSize: '0.75rem', color: '#8a7060', letterSpacing: '0.1em',
              textTransform: 'uppercase', marginBottom: 16 }}>
              {modal.event ? 'Editar evento' : 'Nuevo evento'} · {modal.date.slice(8)} julio
            </div>

            <input
              autoFocus
              placeholder="Título del evento"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              onKeyDown={e => e.key === 'Enter' && handleSave()}
              style={{ width: '100%', background: '#1a0f0a', border: '1px solid #3a2015', borderRadius: 8,
                padding: '10px 12px', color: '#e8c87a', fontSize: '0.95rem', marginBottom: 10,
                outline: 'none', boxSizing: 'border-box' }}
            />

            <input
              type="time"
              value={form.time}
              onChange={e => setForm(f => ({ ...f, time: e.target.value }))}
              style={{ width: '100%', background: '#1a0f0a', border: '1px solid #3a2015', borderRadius: 8,
                padding: '10px 12px', color: '#c0a080', fontSize: '0.9rem', marginBottom: 10,
                outline: 'none', boxSizing: 'border-box' }}
            />

            <select
              value={form.category}
              onChange={e => setForm(f => ({ ...f, category: e.target.value as Category }))}
              style={{ width: '100%', background: '#1a0f0a', border: '1px solid #3a2015', borderRadius: 8,
                padding: '10px 12px', color: '#c0a080', fontSize: '0.9rem', marginBottom: 20,
                outline: 'none', boxSizing: 'border-box' }}
            >
              {Object.entries(CATEGORIES).map(([key, cat]) => (
                <option key={key} value={key}>{cat.label}</option>
              ))}
            </select>

            <div style={{ display: 'flex', gap: 10 }}>
              {modal.event && (
                <button onClick={handleDelete}
                  style={{ flex: 1, padding: 10, borderRadius: 8, border: '1px solid #6a2020',
                    background: 'transparent', color: '#e09090', fontSize: '0.85rem', cursor: 'pointer' }}>
                  Eliminar
                </button>
              )}
              <button onClick={() => setModal(null)}
                style={{ flex: 1, padding: 10, borderRadius: 8, border: '1px solid #3a2015',
                  background: 'transparent', color: '#8a7060', fontSize: '0.85rem', cursor: 'pointer' }}>
                Cancelar
              </button>
              <button onClick={handleSave}
                style={{ flex: 2, padding: 10, borderRadius: 8, border: 'none',
                  background: '#e8c87a', color: '#1a0f0a', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
