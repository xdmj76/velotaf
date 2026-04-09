import { useState, useMemo } from 'react';
import {
  format,
  startOfMonth,
  startOfWeek,
  endOfMonth,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  isAfter,
} from 'date-fns';
import { fr } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function CalendarView({ commuteData }) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentDate), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(currentDate), { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [currentDate]);

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
      <header style={{ marginBottom: '1.5rem', marginTop: '1rem' }}>
        <h1 style={{ fontSize: '2rem' }}>Calendrier</h1>
        <p style={{ fontSize: '1.1rem' }}>Gérez vos jours de vélotaf</p>
      </header>

      <div className="card glass-panel" style={{ display: 'flex', flexDirection: 'column' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.5rem',
          }}
        >
          <button
            onClick={prevMonth}
            style={{
              padding: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'var(--bg-primary)',
              color: 'var(--text-primary)',
              borderRadius: '8px',
            }}
          >
            <ChevronLeft size={20} color="var(--text-primary)" />
          </button>
          <h2 style={{ margin: 0, textTransform: 'capitalize', fontSize: '1.25rem' }}>
            {format(currentDate, 'MMMM yyyy', { locale: fr })}
          </h2>
          <button
            onClick={nextMonth}
            style={{
              padding: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'var(--bg-primary)',
              color: 'var(--text-primary)',
              borderRadius: '8px',
            }}
          >
            <ChevronRight size={20} color="var(--text-primary)" />
          </button>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: '0.5rem',
            textAlign: 'center',
            marginBottom: '1rem',
            fontWeight: 600,
            color: 'var(--text-secondary)',
            fontSize: '0.875rem',
          }}
        >
          {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((d) => (
            <div key={d}>{d}</div>
          ))}
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: '0.5rem',
            flex: 1,
            autoRows: '1fr',
          }}
        >
          {days.map((day, i) => {
            const dateStr = format(day, 'yyyy-MM-dd');
            const isCommuted = commuteData.hasCommuted(dateStr);
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isToday = isSameDay(day, new Date());
            const isFuture = isAfter(day, new Date());

            return (
              <button
                key={i}
                onClick={() => !isFuture && commuteData.toggleDay(dateStr)}
                disabled={isFuture}
                style={{
                  aspectRatio: '1',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1rem',
                  fontWeight: isToday ? 700 : 500,
                  transition: 'all 0.2s',
                  transform: isCommuted ? 'scale(1.05)' : 'scale(1)',
                  opacity: isCurrentMonth ? 1 : 0.3,
                  backgroundColor: isCommuted
                    ? 'var(--accent-primary)'
                    : isToday
                      ? 'var(--bg-primary)'
                      : 'transparent',
                  color: isCommuted
                    ? 'white'
                    : isFuture
                      ? 'var(--text-secondary)'
                      : 'var(--text-primary)',
                  border: isToday && !isCommuted ? '2px solid var(--accent-light)' : 'none',
                  cursor: isFuture ? 'not-allowed' : 'pointer',
                }}
              >
                {format(day, 'd')}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
