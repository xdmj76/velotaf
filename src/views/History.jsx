import { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function HistoryView({ commuteData }) {
  // Calcul de base pour l'année courante en fonction de la période qui se chevauche
  const currentCivilYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();
  
  // Par défaut, l'année sélectionnée correspond à l'année de départ de la période actuelle
  const initialYear = currentMonth >= commuteData.settings.periodStartMonth 
    ? currentCivilYear 
    : currentCivilYear - 1;

  const [selectedYear, setSelectedYear] = useState(initialYear);

  const { start, end } = useMemo(() => {
    const sMonth = commuteData.settings.periodStartMonth;
    let start = new Date(selectedYear, sMonth, 1);
    let end = new Date(selectedYear + 1, sMonth, 1);
    end.setDate(0); // Dernier jour du mois précédent
    return { start, end };
  }, [selectedYear, commuteData.settings.periodStartMonth]);

  const datesInPeriod = useMemo(() => {
    let dates = [...commuteData.commutedDays].sort((a, b) => new Date(b) - new Date(a)); // Tri descendant (plus récent en haut)
    return dates.filter(dateStr => {
      const d = new Date(dateStr);
      return d >= start && d <= end;
    });
  }, [commuteData.commutedDays, start, end]);

  // Génération de 7 années glissantes de choix
  const years = Array.from({ length: 7 }, (_, i) => currentCivilYear - 3 + i).reverse();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <header style={{ marginBottom: '1.5rem', marginTop: '1rem' }}>
        <h1 style={{ fontSize: '2rem' }}>Historique</h1>
        <p style={{ fontSize: '1.1rem' }}>Vos jours déclarés en liste</p>
      </header>

      <div className="card glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <label style={{ fontWeight: 500, fontSize: '0.875rem' }}>Période (Année de référence)</label>
          <select 
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            style={{ 
              marginTop: '0.5rem',
              padding: '0.75rem', 
              borderRadius: '8px', 
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-primary)',
              color: 'var(--text-primary)',
              fontSize: '1rem',
              width: '100%'
            }}
          >
            {years.map(y => {
              const startPeriod = new Date(y, commuteData.settings.periodStartMonth, 1);
              const endPeriod = new Date(y + 1, commuteData.settings.periodStartMonth, 1);
              endPeriod.setDate(0);
              
              // Affichage du libellé personnalisé selon les dates
              const label = format(startPeriod, 'yyyy') === format(endPeriod, 'yyyy')
                ? `Année ${format(startPeriod, 'yyyy')}`
                : `${format(startPeriod, 'MMM yyyy', { locale: fr })} - ${format(endPeriod, 'MMM yyyy', { locale: fr })}`;
                
              return (
                <option key={y} value={y} style={{ textTransform: 'capitalize' }}>
                  {label}
                </option>
              );
            })}
          </select>
        </div>
      </div>

      <div className="card glass-panel" style={{ flex: 1, overflowY: 'auto' }}>
        <h2 style={{ fontSize: '1.125rem', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Jours enregistrés</span>
          <span style={{ color: 'var(--accent-primary)', fontSize: '1.5rem', fontWeight: 800 }}>{datesInPeriod.length}</span>
        </h2>
        
        {datesInPeriod.length === 0 ? (
          <p style={{ textAlign: 'center', opacity: 0.5, marginTop: '2rem' }}>Aucune donnée pour cette période</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {datesInPeriod.map(dateStr => (
              <div key={dateStr} style={{ 
                padding: '0.75rem 1rem', 
                backgroundColor: 'var(--bg-primary)', 
                borderRadius: '8px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                border: '1px solid var(--border-color)'
              }}>
                <span style={{ fontWeight: 500, textTransform: 'capitalize' }}>
                  {format(new Date(dateStr), 'EEEE d MMMM yyyy', { locale: fr })}
                </span>
                <button 
                  onClick={() => commuteData.toggleDay(dateStr)}
                  style={{ color: 'var(--danger)', fontSize: '0.875rem', fontWeight: 600 }}
                >
                  Retirer
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
