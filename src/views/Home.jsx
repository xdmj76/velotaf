import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Bike } from 'lucide-react';

export default function HomeView({ commuteData, onNavigate }) {
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const isCommutedToday = commuteData.hasCommuted(todayStr);

  const handleToggle = () => {
    commuteData.toggleDay(todayStr);
  };

  // Calculate stats
  const { start, end } = commuteData.getPeriodForDate(new Date());
  
  let daysInPeriod = 0;
  commuteData.commutedDays.forEach(dateStr => {
    const d = new Date(dateStr);
    if (d >= start && d <= end) {
      daysInPeriod++;
    }
  });

  const user = commuteData.user;
  const userMetadata = user?.user_metadata;
  const firstName = userMetadata?.first_name || userMetadata?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || '';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
      <header style={{ marginBottom: '2rem', marginTop: '1rem' }}>
        <h1 style={{ fontSize: '2rem' }}>
          Bonjour{firstName ? <span style={{ textTransform: 'capitalize' }}> {firstName}</span> : ''},
        </h1>
        <p style={{ fontSize: '1.1rem' }}>Prêt pour pédaler aujourd'hui ?</p>
      </header>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        <button 
          onClick={handleToggle}
          className={isCommutedToday ? 'animate-pop' : ''}
          style={{
            width: '240px',
            height: '240px',
            borderRadius: '50%',
            backgroundColor: isCommutedToday ? 'var(--accent-primary)' : 'var(--bg-secondary)',
            color: isCommutedToday ? 'white' : 'var(--text-primary)',
            border: `8px solid ${isCommutedToday ? 'var(--accent-light)' : 'var(--border-color)'}`,
            boxShadow: isCommutedToday ? '0 10px 25px rgba(16, 185, 129, 0.4)' : '0 10px 25px rgba(0,0,0,0.05)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            position: 'relative',
          }}
        >
          {isCommutedToday && (
            <div style={{
              position: 'absolute',
              top: '-8px', left: '-8px', right: '-8px', bottom: '-8px',
              borderRadius: '50%',
              animation: 'pulse-ring 2s infinite',
              zIndex: -1
            }} />
          )}
          
          <Bike size={64} style={{ marginBottom: '1rem', opacity: isCommutedToday ? 1 : 0.7 }} />
          <span style={{ fontSize: '1.25rem', fontWeight: 600 }}>
            {isCommutedToday ? 'Validé !' : 'Aller/Retour'}
          </span>
          <span style={{ fontSize: '0.875rem', opacity: 0.8, marginTop: '0.5rem', textTransform: 'capitalize' }}>
            {format(new Date(), 'EEEE d MMM', { locale: fr })}
          </span>
        </button>
      </div>

      <div 
        className="card" 
        onClick={() => onNavigate('calendar')}
        style={{ marginTop: '2rem', cursor: 'pointer', transition: 'transform 0.2s', ':hover': { transform: 'translateY(-2px)' } }}
      >
        <h2 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Résumé de la période</h2>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <span style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--accent-primary)', lineHeight: 1 }}>
            {daysInPeriod} <span style={{ fontSize: '1rem', color: 'var(--text-secondary)', fontWeight: 400 }}>jours</span>
          </span>
        </div>
        <p style={{ margin: 0, fontSize: '0.875rem', marginTop: '0.5rem' }}>
          Du {format(start, 'dd/MM/yyyy')} au {format(end, 'dd/MM/yyyy')}
        </p>
      </div>
    </div>
  );
}
