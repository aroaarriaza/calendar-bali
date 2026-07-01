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
  activity: { label: 'Actividad', color: '#FFD166', bg: 'rgba(255,180,40,0.18)',  border: '#E8A820', glow: 'rgba(232,168,32,0.5)'  },
  travel:   { label: 'Viaje',     color: '#06D6C8', bg: 'rgba(6,200,180,0.15)',   border: '#04B8AC', glow: 'rgba(4,184,172,0.5)'   },
  social:   { label: 'Social',    color: '#FF70A6', bg: 'rgba(255,80,140,0.16)',  border: '#E0508A', glow: 'rgba(224,80,138,0.5)'  },
  wellness: { label: 'Bienestar', color: '#70E898', bg: 'rgba(60,220,130,0.15)',  border: '#30C870', glow: 'rgba(48,200,112,0.5)'  },
  football: { label: 'Fútbol',    color: '#FF5757', bg: 'rgba(255,60,60,0.16)',   border: '#E03030', glow: 'rgba(224,48,48,0.5)'   },
}

type Timezone = 'Madrid' | 'Miami' | 'Bali'

const TZ_OFFSETS: Record<Timezone, number> = { Madrid: 2, Miami: -4, Bali: 8 }
const TZ_FLAGS:   Record<Timezone, string>  = { Madrid: '🇪🇸', Miami: '🇺🇸', Bali: '🌴' }

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
  { id: 'seed-1', date: '2026-07-02', title: 'Templo Tanah Lot',  category: 'activity' },
  { id: 'seed-7', date: '2026-07-02', title: '⚽ España-Austria', category: 'football', time: '21:00' },
  { id: 'seed-2', date: '2026-07-03', title: '🎉 Sandbar',        category: 'social' },
  { id: 'seed-3', date: '2026-07-04', title: '🎉 Finns',          category: 'social' },
  { id: 'seed-4', date: '2026-07-11', title: '🎉 Atlas',          category: 'social' },
  { id: 'seed-5', date: '2026-07-13', title: '🌋 Monte Batour',   category: 'activity' },
  { id: 'seed-8', date: '2026-07-19', title: '🏆 Final Mundial',  category: 'football', time: '21:00' },
  { id: 'seed-6', date: '2026-07-22', title: 'Fin reserva villa', category: 'travel' },
]

const WEEKDAYS   = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
const START_OFFSET = 2

function dateStr(day: number) {
  return `2026-07-${String(day).padStart(2, '0')}`
}

const CSS = `
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(14px) scale(0.98); }
    to   { opacity: 1; transform: translateY(0)    scale(1);    }
  }
  @keyframes tropicalFloat {
    0%,100% { transform: translateY(0px)  rotate(-1deg); }
    33%     { transform: translateY(-9px) rotate(2deg);  }
    66%     { transform: translateY(-4px) rotate(-2deg); }
  }
  @keyframes pulseWarm {
    0%,100% { box-shadow: 0 0 0   0  rgba(255,140,60,0.0), 0 6px 24px rgba(0,0,0,0.5); }
    50%     { box-shadow: 0 0 28px 6px rgba(255,120,40,0.25), 0 6px 24px rgba(0,0,0,0.5); }
  }
  @keyframes slideUp {
    from { opacity: 0; transform: translateY(32px) scale(0.96); }
    to   { opacity: 1; transform: translateY(0)    scale(1);    }
  }
  @keyframes backdropIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes shimmerText {
    0%   { background-position: 0%   center; }
    100% { background-position: 200% center; }
  }

  .cal-emoji { animation: tropicalFloat 6s ease-in-out infinite; display: inline-block; }

  .cal-day {
    animation: fadeInUp 0.45s ease both;
    transition: transform 0.28s cubic-bezier(0.34,1.56,0.64,1),
                box-shadow 0.28s ease,
                border-color 0.22s ease,
                background  0.22s ease;
  }
  .cal-day:hover {
    transform: translateY(-7px) scale(1.03);
    box-shadow: 0 20px 48px rgba(0,0,0,0.5),
                0 0 0 1px rgba(255,180,80,0.18),
                inset 0 1px 0 rgba(255,255,255,0.06);
    z-index: 2;
  }
  .cal-today {
    animation: pulseWarm 3s ease-in-out infinite,
               fadeInUp  0.45s ease both !important;
  }

  .cal-event {
    transition: transform 0.15s ease, filter 0.15s ease;
    cursor: pointer;
  }
  .cal-event:hover {
    transform: translateX(4px);
    filter: brightness(1.25) saturate(1.3);
  }

  .cal-tz { transition: all 0.22s cubic-bezier(0.34,1.56,0.64,1); cursor: pointer; }
  .cal-tz:hover { transform: translateY(-3px) scale(1.05); }

  .cal-modal  { animation: slideUp    0.35s cubic-bezier(0.34,1.56,0.64,1); }
  .cal-back   { animation: backdropIn 0.22s ease; }

  .cal-input {
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
    outline: none;
  }
  .cal-input:focus {
    border-color: rgba(255,180,80,0.45) !important;
    box-shadow: 0 0 0 3px rgba(255,160,60,0.1);
  }
  .cal-save { transition: all 0.2s ease; }
  .cal-save:hover {
    filter: brightness(1.1) saturate(1.1);
    transform: translateY(-2px);
    box-shadow: 0 8px 28px rgba(255,160,60,0.45) !important;
  }
  .cal-del { transition: all 0.18s ease; }
  .cal-del:hover { background: rgba(255,70,70,0.14) !important; }
`

export default function CalendarClient() {
  const [events,   setEvents]   = useState<Event[]>([])
  const [modal,    setModal]    = useState<{ date: string; event?: Event } | null>(null)
  const [form,     setForm]     = useState({ title: '', time: '', category: 'activity' as Category })
  const [timezone, setTimezone] = useState<Timezone>('Madrid')

  useEffect(() => {
    const saved   = localStorage.getItem('bali-events')
    const seedIds = new Set(SEED_EVENTS.map(e => e.id))
    const existing: Event[] = saved ? JSON.parse(saved) : []
    const merged = [...SEED_EVENTS, ...existing.filter(e => !seedIds.has(e.id))]
    setEvents(merged)
    localStorage.setItem('bali-events', JSON.stringify(merged))
  }, [])

  const persist = (evts: Event[]) => {
    setEvents(evts)
    localStorage.setItem('bali-events', JSON.stringify(evts))
  }

  const openAdd  = (date: string) => { setForm({ title: '', time: '', category: 'activity' }); setModal({ date }) }
  const openEdit = (ev: Event, e: React.MouseEvent) => {
    e.stopPropagation()
    setForm({ title: ev.title, time: ev.time || '', category: ev.category })
    setModal({ date: ev.date, event: ev })
  }
  const handleSave = () => {
    if (!form.title.trim() || !modal) return
    if (modal.event) persist(events.map(e => e.id === modal.event!.id ? { ...e, ...form } : e))
    else persist([...events, { id: Date.now().toString(), date: modal.date, ...form }])
    setModal(null)
  }
  const handleDelete = () => {
    if (!modal?.event) return
    persist(events.filter(e => e.id !== modal.event!.id))
    setModal(null)
  }

  const eventsForDay = (day: number) =>
    events.filter(e => e.date === dateStr(day)).sort((a, b) => (a.time || '').localeCompare(b.time || ''))

  const today   = new Date()
  const isToday = (day: number) =>
    today.getFullYear() === 2026 && today.getMonth() === 6 && today.getDate() === day

  const cells = [...Array(START_OFFSET).fill(null), ...Array.from({ length: 31 }, (_, i) => i + 1)]

  return (
    <>
      <style>{CSS}</style>

      {/* ── Fondo ── */}
      <div style={{
        minHeight: '100vh',
        padding: '48px 16px 60px',
        background: '#060e18',
        backgroundImage: `
          radial-gradient(ellipse 90% 55% at 50%  -5%,  rgba(220,90,20,0.32)  0%, transparent 65%),
          radial-gradient(ellipse 60% 50% at 100% 40%,  rgba(4,180,160,0.16)  0%, transparent 55%),
          radial-gradient(ellipse 55% 65% at 0%   70%,  rgba(160,30,180,0.12) 0%, transparent 55%),
          radial-gradient(ellipse 80% 35% at 50%  105%, rgba(10,60,120,0.28)  0%, transparent 50%)
        `,
      }}>

        {/* ── Header ── */}
        <div style={{ textAlign: 'center', marginBottom: 44 }}>
          <div style={{ marginBottom: 18, letterSpacing: '0.6em', fontSize: '1.5rem' }}>
            <span className="cal-emoji" style={{ display: 'inline-block', animationDelay: '0s' }}>🌺</span>
            {' '}
            <span className="cal-emoji" style={{ display: 'inline-block', animationDelay: '0.4s', animationDuration: '5s' }}>🌴</span>
            {' '}
            <span className="cal-emoji" style={{ display: 'inline-block', animationDelay: '0.8s', animationDuration: '7s' }}>🌊</span>
          </div>

          <h1 style={{
            fontFamily: 'Georgia, "Times New Roman", serif',
            fontSize: 'clamp(2.6rem, 6vw, 4.8rem)',
            letterSpacing: '0.08em',
            lineHeight: 1,
            marginBottom: 10,
            background: 'linear-gradient(135deg, #FF9F50 0%, #FFD166 35%, #FFF0A0 55%, #FFB830 80%, #FF7040 100%)',
            backgroundSize: '200% auto',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            filter: 'drop-shadow(0 2px 20px rgba(255,160,60,0.25))',
          }}>
            Julio 2026
          </h1>

          <div style={{
            fontSize: '0.7rem',
            color: 'rgba(255,180,100,0.4)',
            letterSpacing: '0.4em',
            textTransform: 'uppercase',
          }}>
            Bali · Indonesia
          </div>
        </div>

        {/* ── Selector zona horaria ── */}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 44 }}>
          {(['Miami', 'Madrid', 'Bali'] as Timezone[]).map(tz => {
            const active = timezone === tz
            return (
              <button
                key={tz}
                className="cal-tz"
                onClick={() => setTimezone(tz)}
                style={{
                  padding: '8px 22px',
                  borderRadius: 28,
                  fontSize: '0.78rem',
                  letterSpacing: '0.05em',
                  fontWeight: active ? 600 : 400,
                  border: active
                    ? '1px solid rgba(255,180,80,0.6)'
                    : '1px solid rgba(255,255,255,0.07)',
                  background: active
                    ? 'linear-gradient(135deg, rgba(255,160,60,0.22), rgba(220,100,20,0.10))'
                    : 'rgba(255,255,255,0.025)',
                  color: active ? '#FFD166' : 'rgba(200,150,80,0.45)',
                  boxShadow: active ? '0 0 20px rgba(255,150,50,0.15)' : 'none',
                }}
              >
                {TZ_FLAGS[tz]} {tz}
              </button>
            )
          })}
        </div>

        {/* ── Cabecera días ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6, maxWidth: 1100, margin: '0 auto 8px' }}>
          {WEEKDAYS.map((d, i) => (
            <div key={d} style={{
              textAlign: 'center',
              fontSize: '0.6rem',
              fontWeight: 700,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: i >= 5 ? 'rgba(255,130,100,0.55)' : 'rgba(220,170,100,0.35)',
              padding: '8px 0',
            }}>
              {d}
            </div>
          ))}
        </div>

        {/* ── Grid ── */}
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
                    ? 'linear-gradient(135deg, rgba(255,140,40,0.14), rgba(220,80,20,0.07))'
                    : dayEvents.length
                      ? 'rgba(255,200,100,0.04)'
                      : 'rgba(255,255,255,0.018)',
                  border: `1px solid ${
                    todayMark
                      ? 'rgba(255,160,60,0.6)'
                      : dayEvents.length
                        ? 'rgba(255,160,60,0.18)'
                        : 'rgba(255,255,255,0.055)'
                  }`,
                  borderRadius: 14,
                  minHeight: 112,
                  padding: '10px 10px 8px',
                  cursor: 'pointer',
                  position: 'relative',
                  animationDelay: `${(idx % 37) * 0.018}s`,
                }}
              >
                {/* Número del día */}
                <div style={{
                  fontSize: '0.8rem',
                  fontWeight: todayMark ? 700 : 400,
                  marginBottom: 7,
                  lineHeight: 1,
                  color: todayMark
                    ? '#FFD166'
                    : isWeekend
                      ? 'rgba(255,130,100,0.7)'
                      : 'rgba(220,170,110,0.45)',
                  ...(todayMark ? { textShadow: '0 0 12px rgba(255,200,60,0.6)' } : {}),
                }}>
                  {day}
                </div>

                {/* Eventos */}
                {dayEvents.map(ev => {
                  const cat = CATEGORIES[ev.category]
                  return (
                    <div
                      key={ev.id}
                      className="cal-event"
                      onClick={e => openEdit(ev, e)}
                      style={{
                        fontSize: '0.65rem',
                        lineHeight: 1.35,
                        padding: '4px 7px',
                        borderRadius: 7,
                        marginBottom: 3,
                        background: cat.bg,
                        color: cat.color,
                        borderLeft: `2px solid ${cat.border}`,
                        boxShadow: `0 2px 12px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.04)`,
                      }}
                    >
                      {ev.time && (
                        <span style={{ opacity: 0.65, fontSize: '0.58rem', marginRight: 4, fontWeight: 600 }}>
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

        {/* ── Leyenda ── */}
        <div style={{
          display: 'flex', gap: 22, justifyContent: 'center',
          flexWrap: 'wrap', marginTop: 40,
        }}>
          {Object.entries(CATEGORIES).map(([key, cat]) => (
            <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: '0.68rem', color: 'rgba(200,150,80,0.45)' }}>
              <div style={{
                width: 8, height: 8, borderRadius: 3,
                background: cat.border,
                boxShadow: `0 0 10px ${cat.glow}`,
              }} />
              {cat.label}
            </div>
          ))}
        </div>

      </div>

      {/* ── Modal ── */}
      {modal && (
        <div
          className="cal-back"
          onClick={() => setModal(null)}
          style={{
            position: 'fixed', inset: 0, zIndex: 50,
            background: 'rgba(4,8,16,0.88)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
          }}
        >
          <div
            className="cal-modal"
            onClick={e => e.stopPropagation()}
            style={{
              background: 'linear-gradient(160deg, #0e1e2e, #08121c)',
              border: '1px solid rgba(255,180,80,0.2)',
              borderRadius: 22,
              padding: 30,
              width: '100%',
              maxWidth: 400,
              boxShadow: '0 40px 100px rgba(0,0,0,0.75), 0 0 0 1px rgba(255,255,255,0.04), inset 0 1px 0 rgba(255,255,255,0.05)',
            }}
          >
            {/* Label */}
            <div style={{
              fontSize: '0.67rem', letterSpacing: '0.2em', textTransform: 'uppercase',
              color: 'rgba(255,180,80,0.5)', marginBottom: 22,
              display: 'flex', alignItems: 'center', gap: 9,
            }}>
              <span style={{
                width: 6, height: 6, borderRadius: '50%', display: 'inline-block',
                background: '#FFD166', boxShadow: '0 0 10px rgba(255,200,80,0.9)',
              }} />
              {modal.event ? 'Editar evento' : 'Nuevo evento'} · {modal.date.slice(8)} julio
            </div>

            {/* Inputs */}
            {([
              { placeholder: 'Título del evento',      value: form.title, key: 'title', color: '#FFD166', onKey: true },
              { placeholder: 'Hora Madrid (ej. 21:00)', value: form.time,  key: 'time',  color: '#90D8C8', onKey: false },
            ] as const).map(field => (
              <input
                key={field.key}
                autoFocus={field.key === 'title'}
                className="cal-input"
                placeholder={field.placeholder}
                value={field.value}
                inputMode={field.key === 'time' ? 'numeric' : undefined}
                onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
                onKeyDown={field.onKey ? e => e.key === 'Enter' && handleSave() : undefined}
                style={{
                  width: '100%', boxSizing: 'border-box',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 12, padding: '12px 15px',
                  color: field.color, fontSize: '0.9rem', marginBottom: 10,
                }}
              />
            ))}

            {/* Select */}
            <select
              value={form.category}
              onChange={e => setForm(f => ({ ...f, category: e.target.value as Category }))}
              style={{
                width: '100%', boxSizing: 'border-box',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 12, padding: '12px 15px',
                color: '#C8A878', fontSize: '0.9rem', marginBottom: 26,
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
                <button className="cal-del" onClick={handleDelete} style={{
                  flex: 1, padding: '12px', borderRadius: 12,
                  border: '1px solid rgba(255,80,80,0.25)',
                  background: 'rgba(255,60,60,0.06)',
                  color: '#FF8080', fontSize: '0.82rem', cursor: 'pointer',
                }}>
                  Eliminar
                </button>
              )}
              <button onClick={() => setModal(null)} style={{
                flex: 1, padding: '12px', borderRadius: 12,
                border: '1px solid rgba(255,255,255,0.07)',
                background: 'transparent',
                color: 'rgba(200,160,100,0.5)', fontSize: '0.82rem', cursor: 'pointer',
              }}>
                Cancelar
              </button>
              <button className="cal-save" onClick={handleSave} style={{
                flex: 2, padding: '12px', borderRadius: 12, border: 'none',
                background: 'linear-gradient(135deg, #FF9F50, #FFD166)',
                color: '#1a0a00', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer',
                boxShadow: '0 4px 20px rgba(255,160,60,0.35)',
              }}>
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
