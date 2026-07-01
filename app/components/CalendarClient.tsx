'use client'

import { useState, useEffect } from 'react'

type Category = 'activity' | 'travel' | 'social' | 'wellness' | 'football'

interface Event {
  id: string
  date: string
  time?: string
  title: string
  category: Category
}

const CATEGORIES: Record<Category, { label: string; color: string; bg: string; border: string; glow: string }> = {
  activity: { label: 'Actividad', color: '#f0c878', bg: 'rgba(180,100,30,0.22)', border: '#c07830', glow: 'rgba(192,120,48,0.35)' },
  travel:   { label: 'Viaje',     color: '#90c8f0', bg: 'rgba(60,120,180,0.18)', border: '#5090c0', glow: 'rgba(80,144,192,0.35)' },
  social:   { label: 'Social',    color: '#d0a0f8', bg: 'rgba(120,60,160,0.22)', border: '#9060c0', glow: 'rgba(144,96,192,0.35)' },
  wellness: { label: 'Bienestar', color: '#80d8a8', bg: 'rgba(40,140,80,0.18)',  border: '#50a870', glow: 'rgba(80,168,112,0.35)' },
  football: { label: 'Fútbol',    color: '#ff9a9a', bg: 'rgba(200,40,40,0.18)',  border: '#cc3030', glow: 'rgba(204,48,48,0.35)' },
}

type Timezone = 'Madrid' | 'Miami' | 'Bali'

const TZ_OFFSETS: Record<Timezone, number> = {
  Madrid: 2,
  Miami: -4,
  Bali: 8,
}

const TZ_FLAGS: Record<Timezone, string> = {
  Madrid: '🇪🇸',
  Miami: '🇺🇸',
  Bali: '🌴',
}

function convertTime(time: string, toTz: Timezone): string {
  if (!time) return ''
  const [h, m] = time.split(':').map(Number)
  const diff = TZ_OFFSETS[toTz] - TZ_OFFSETS['Madrid']
  let newH = h + diff
  const suffix = newH >= 24 ? ' +1' : newH < 0 ? ' -1' : ''
  newH = ((newH % 24) + 24) % 24
  return `${String(newH).padStart(2, '0')}:${String(m).padStart(2, '0')}${suffix}`
}

const SEED_EVENTS: Event[] = [
  { id: 'seed-1', date: '2026-07-02', title: 'Templo Tanah Lot', category: 'activity' },
  { id: 'seed-7', date: '2026-07-02', title: '⚽ España-Austria', category: 'football', time: '21:00' },
  { id: 'seed-2', date: '2026-07-03', title: '🎉 Sandbar', category: 'social' },
  { id: 'seed-3', date: '2026-07-04', title: '🎉 Finns', category: 'social' },
  { id: 'seed-4', date: '2026-07-11', title: '🎉 Atlas', category: 'social' },
  { id: 'seed-5', date: '2026-07-13', title: '🌋 Monte Batour', category: 'activity' },
  { id: 'seed-8', date: '2026-07-19', title: '🏆 Final Mundial', category: 'football', time: '21:00' },
  { id: 'seed-6', date: '2026-07-22', title: 'Fin reserva villa', category: 'travel' },
]

const WEEKDAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
const DAYS_IN_JULY = 31
const START_OFFSET = 2

function dateStr(day: number) {
  return `2026-07-${String(day).padStart(2, '0')}`
}

const CSS = `
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50%       { transform: translateY(-8px); }
  }
  @keyframes pulseGold {
    0%, 100% { box-shadow: 0 0 0 0 rgba(232,200,122,0.0), 0 4px 20px rgba(0,0,0,0.4); }
    50%       { box-shadow: 0 0 18px 4px rgba(232,200,122,0.2), 0 4px 20px rgba(0,0,0,0.4); }
  }
  @keyframes slideUp {
    from { opacity: 0; transform: translateY(28px) scale(0.97); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }
  @keyframes backdropIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }

  .cal-emoji  { animation: float 5s ease-in-out infinite; display: inline-block; }
  .cal-day    {
    animation: fadeInUp 0.5s ease both;
    transition: transform 0.25s cubic-bezier(0.34,1.56,0.64,1),
                box-shadow 0.25s ease,
                border-color 0.2s ease,
                background 0.2s ease;
  }
  .cal-day:hover {
    transform: translateY(-5px) scale(1.02);
    box-shadow: 0 16px 40px rgba(0,0,0,0.55), 0 0 0 1px rgba(232,200,122,0.12);
    z-index: 2;
  }
  .cal-today  { animation: pulseGold 3s ease-in-out infinite, fadeInUp 0.5s ease both !important; }
  .cal-event  { transition: transform 0.15s ease, filter 0.15s ease; }
  .cal-event:hover { transform: translateX(3px); filter: brightness(1.2); }
  .cal-tz     { transition: all 0.2s cubic-bezier(0.34,1.56,0.64,1); }
  .cal-tz:hover { transform: translateY(-2px); }
  .cal-modal  { animation: slideUp 0.32s cubic-bezier(0.34,1.56,0.64,1); }
  .cal-back   { animation: backdropIn 0.2s ease; }
  .cal-input  { transition: border-color 0.2s ease, box-shadow 0.2s ease; }
  .cal-input:focus {
    border-color: rgba(232,200,122,0.4) !important;
    box-shadow: 0 0 0 3px rgba(232,200,122,0.08);
    outline: none;
  }
  .cal-save:hover  { filter: brightness(1.1); transform: translateY(-1px); box-shadow: 0 6px 20px rgba(232,200,122,0.4) !important; }
  .cal-save   { transition: all 0.2s ease; }
`

export default function CalendarClient() {
  const [events, setEvents]   = useState<Event[]>([])
  const [modal, setModal]     = useState<{ date: string; event?: Event } | null>(null)
  const [form, setForm]       = useState({ title: '', time: '', category: 'activity' as Category })
  const [timezone, setTimezone] = useState<Timezone>('Madrid')

  useEffect(() => {
    const saved = localStorage.getItem('bali-events')
    const seedIds = new Set(SEED_EVENTS.map(e => e.id))
    const existing: Event[] = saved ? JSON.parse(saved) : []
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

  const today    = new Date()
  const isToday  = (day: number) =>
    today.getFullYear() === 2026 && today.getMonth() === 6 && today.getDate() === day

  const cells = [
    ...Array(START_OFFSET).fill(null),
    ...Array.from({ length: DAYS_IN_JULY }, (_, i) => i + 1),
  ]

  return (
    <>
      <style>{CSS}</style>

      <div style={{
        background: 'linear-gradient(160deg, #0c0704 0%, #180c07 45%, #0e0806 100%)',
        minHeight: '100vh',
        padding: '44px 16px 52px',
      }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div className="cal-emoji" style={{ fontSize: '3.2rem', marginBottom: 14 }}>🌴</div>
          <h1 style={{
            fontFamily: 'Georgia, "Times New Roman", serif',
            fontSize: 'clamp(2.2rem, 5vw, 3.6rem)',
            letterSpacing: '0.06em',
            lineHeight: 1,
            marginBottom: 10,
            background: 'linear-gradient(135deg, #f5dfa0 0%, #e8c87a 45%, #b8903a 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            Julio 2026
          </h1>
          <div style={{
            fontSize: '0.72rem',
            color: 'rgba(138,106,72,0.6)',
            letterSpacing: '0.32em',
            textTransform: 'uppercase',
          }}>
            Bali · Indonesia
          </div>
        </div>

        {/* Selector zona horaria */}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 40 }}>
          {(['Miami', 'Madrid', 'Bali'] as Timezone[]).map(tz => {
            const active = timezone === tz
            return (
              <button
                key={tz}
                className="cal-tz"
                onClick={() => setTimezone(tz)}
                style={{
                  padding: '8px 20px',
                  borderRadius: 24,
                  cursor: 'pointer',
                  fontSize: '0.78rem',
                  letterSpacing: '0.04em',
                  fontWeight: active ? 600 : 400,
                  border: active ? '1px solid rgba(232,200,122,0.55)' : '1px solid rgba(255,255,255,0.06)',
                  background: active
                    ? 'linear-gradient(135deg, rgba(232,200,122,0.16), rgba(180,130,50,0.08))'
                    : 'rgba(255,255,255,0.02)',
                  color: active ? '#e8c87a' : 'rgba(138,106,72,0.55)',
                  boxShadow: active ? '0 0 16px rgba(232,200,122,0.1)' : 'none',
                }}
              >
                {TZ_FLAGS[tz]} {tz}
              </button>
            )
          })}
        </div>

        {/* Cabeceras días */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6, maxWidth: 1100, margin: '0 auto 8px' }}>
          {WEEKDAYS.map((d, i) => (
            <div key={d} style={{
              textAlign: 'center',
              fontSize: '0.62rem',
              fontWeight: 600,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: i >= 5 ? 'rgba(232,160,96,0.55)' : 'rgba(184,149,106,0.38)',
              padding: '8px 0',
            }}>
              {d}
            </div>
          ))}
        </div>

        {/* Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6, maxWidth: 1100, margin: '0 auto' }}>
          {cells.map((day, idx) => {
            if (!day) return <div key={`empty-${idx}`} />

            const isWeekend = idx % 7 >= 5
            const dayEvents = eventsForDay(day)
            const todayMark = isToday(day)

            return (
              <div
                key={day}
                className={todayMark ? 'cal-day cal-today' : 'cal-day'}
                onClick={() => openAdd(dateStr(day))}
                style={{
                  background: todayMark
                    ? 'linear-gradient(135deg, rgba(232,200,122,0.09), rgba(180,120,30,0.05))'
                    : dayEvents.length
                      ? 'rgba(255,255,255,0.028)'
                      : 'rgba(255,255,255,0.016)',
                  border: `1px solid ${
                    todayMark
                      ? 'rgba(232,200,122,0.55)'
                      : dayEvents.length
                        ? 'rgba(160,90,30,0.28)'
                        : 'rgba(255,255,255,0.045)'
                  }`,
                  borderRadius: 12,
                  minHeight: 110,
                  padding: '10px 10px 8px',
                  cursor: 'pointer',
                  position: 'relative',
                  animationDelay: `${(idx % 35) * 0.02}s`,
                }}
              >
                <div style={{
                  fontSize: '0.8rem',
                  fontWeight: todayMark ? 700 : 400,
                  marginBottom: 7,
                  lineHeight: 1,
                  color: isWeekend ? 'rgba(232,160,96,0.75)' : 'rgba(192,160,120,0.5)',
                  ...(todayMark ? {
                    background: 'linear-gradient(135deg, #e8c87a, #c8a050)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    fontSize: '0.85rem',
                  } : {}),
                }}>
                  {day}
                </div>

                {dayEvents.map(ev => {
                  const cat = CATEGORIES[ev.category]
                  return (
                    <div
                      key={ev.id}
                      className="cal-event"
                      onClick={e => openEdit(ev, e)}
                      style={{
                        fontSize: '0.66rem',
                        lineHeight: 1.35,
                        padding: '4px 7px',
                        borderRadius: 6,
                        marginBottom: 3,
                        background: cat.bg,
                        color: cat.color,
                        borderLeft: `2px solid ${cat.border}`,
                        boxShadow: `0 2px 10px rgba(0,0,0,0.25), inset 0 0 0 1px rgba(255,255,255,0.04)`,
                        cursor: 'pointer',
                      }}
                    >
                      {ev.time && (
                        <span style={{ opacity: 0.6, fontSize: '0.59rem', marginRight: 4, fontWeight: 600, letterSpacing: '0.03em' }}>
                          {convertTime(ev.time, timezone)}
                        </span>
                      )}
                      {ev.title}
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>

        {/* Leyenda */}
        <div style={{ display: 'flex', gap: 20, justifyContent: 'center', flexWrap: 'wrap', marginTop: 36 }}>
          {Object.entries(CATEGORIES).map(([key, cat]) => (
            <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: '0.68rem', color: 'rgba(138,106,72,0.55)' }}>
              <div style={{
                width: 8, height: 8, borderRadius: 3,
                background: cat.border,
                boxShadow: `0 0 8px ${cat.glow}`,
              }} />
              {cat.label}
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {modal && (
        <div
          className="cal-back"
          onClick={() => setModal(null)}
          style={{
            position: 'fixed', inset: 0, zIndex: 50,
            background: 'rgba(0,0,0,0.82)',
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
          }}
        >
          <div
            className="cal-modal"
            onClick={e => e.stopPropagation()}
            style={{
              background: 'linear-gradient(160deg, #231208, #180d06)',
              border: '1px solid rgba(232,200,122,0.18)',
              borderRadius: 20,
              padding: 28,
              width: '100%',
              maxWidth: 400,
              boxShadow: '0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.03)',
            }}
          >
            {/* Título modal */}
            <div style={{
              fontSize: '0.68rem', color: 'rgba(138,106,72,0.7)',
              letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 22,
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <span style={{
                width: 5, height: 5, borderRadius: '50%',
                background: '#e8c87a',
                boxShadow: '0 0 8px rgba(232,200,122,0.8)',
                display: 'inline-block',
              }} />
              {modal.event ? 'Editar evento' : 'Nuevo evento'} · {modal.date.slice(8)} julio
            </div>

            {/* Input título */}
            <input
              autoFocus
              className="cal-input"
              placeholder="Título del evento"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              onKeyDown={e => e.key === 'Enter' && handleSave()}
              style={{
                width: '100%', boxSizing: 'border-box',
                background: 'rgba(0,0,0,0.35)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: 11, padding: '12px 14px',
                color: '#e8c87a', fontSize: '0.92rem', marginBottom: 10,
              }}
            />

            {/* Input hora */}
            <input
              className="cal-input"
              type="text"
              inputMode="numeric"
              placeholder="Hora Madrid (ej. 21:00)"
              value={form.time}
              onChange={e => setForm(f => ({ ...f, time: e.target.value }))}
              style={{
                width: '100%', boxSizing: 'border-box',
                background: 'rgba(0,0,0,0.35)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: 11, padding: '12px 14px',
                color: '#c8a878', fontSize: '0.9rem', marginBottom: 10,
              }}
            />

            {/* Select categoría */}
            <select
              value={form.category}
              onChange={e => setForm(f => ({ ...f, category: e.target.value as Category }))}
              style={{
                width: '100%', boxSizing: 'border-box',
                background: 'rgba(0,0,0,0.35)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: 11, padding: '12px 14px',
                color: '#c8a878', fontSize: '0.9rem', marginBottom: 24,
                outline: 'none',
              }}
            >
              {Object.entries(CATEGORIES).map(([key, cat]) => (
                <option key={key} value={key}>{cat.label}</option>
              ))}
            </select>

            {/* Botones */}
            <div style={{ display: 'flex', gap: 10 }}>
              {modal.event && (
                <button
                  onClick={handleDelete}
                  style={{
                    flex: 1, padding: '11px', borderRadius: 11,
                    border: '1px solid rgba(200,60,60,0.25)',
                    background: 'rgba(200,60,60,0.07)',
                    color: '#e09090', fontSize: '0.82rem', cursor: 'pointer',
                  }}
                >
                  Eliminar
                </button>
              )}
              <button
                onClick={() => setModal(null)}
                style={{
                  flex: 1, padding: '11px', borderRadius: 11,
                  border: '1px solid rgba(255,255,255,0.06)',
                  background: 'transparent',
                  color: 'rgba(138,106,72,0.6)', fontSize: '0.82rem', cursor: 'pointer',
                }}
              >
                Cancelar
              </button>
              <button
                className="cal-save"
                onClick={handleSave}
                style={{
                  flex: 2, padding: '11px', borderRadius: 11, border: 'none',
                  background: 'linear-gradient(135deg, #e8c87a, #c09040)',
                  color: '#1a0c04', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer',
                  boxShadow: '0 4px 18px rgba(232,200,122,0.28)',
                }}
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
