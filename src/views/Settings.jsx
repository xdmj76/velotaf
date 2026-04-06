import { format } from 'date-fns';
import { Download, CalendarDays, Info } from 'lucide-react';

export default function SettingsView({ commuteData }) {
  
  const handleExport = () => {
    const { start, end } = commuteData.getPeriodForDate(new Date());
    let dates = [...commuteData.commutedDays].sort();
    
    dates = dates.filter(dateStr => {
      const d = new Date(dateStr);
      return d >= start && d <= end;
    });
    
    if (dates.length === 0) {
      alert("Aucune donnée sur cette période !");
      return;
    }
    
    let csvContent = "Date,Jour de vélotaf\n";
    dates.forEach(dateStr => {
      // Pour une compatibilité tableur FR simple
      csvContent += `${dateStr};Oui\n`;
    });
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `velotaf_${format(start, 'yyyy')}-${format(end, 'yyyy')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const months = [
    { value: 0, label: "Janvier" },
    { value: 1, label: "Février" },
    { value: 2, label: "Mars" },
    { value: 3, label: "Avril" },
    { value: 4, label: "Mai" },
    { value: 5, label: "Juin" },
    { value: 6, label: "Juillet" },
    { value: 7, label: "Août" },
    { value: 8, label: "Septembre" },
    { value: 9, label: "Octobre" },
    { value: 10, label: "Novembre" },
    { value: 11, label: "Décembre" }
  ];

  const currentSettings = commuteData.settings;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
      <header style={{ marginBottom: '2rem', marginTop: '1rem' }}>
        <h1 style={{ fontSize: '2rem' }}>Réglages</h1>
        <p style={{ fontSize: '1.1rem' }}>Configuration et export</p>
      </header>

      <div className="card glass-panel">
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.125rem' }}>
          <CalendarDays size={20} color="var(--accent-primary)" />
          Année de référence
        </h2>
        <p style={{ fontSize: '0.875rem' }}>
          Choisissez le mois de début pour le calcul du résumé et de l'export. Ex: si vous choisissez "Septembre", une année sera calculée de Septembre courant à Août.
        </p>
        
        <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label style={{ fontWeight: 500, fontSize: '0.875rem' }}>Mois de début d'année</label>
          <select 
            value={currentSettings.periodStartMonth}
            onChange={(e) => commuteData.updateSetting('periodStartMonth', parseInt(e.target.value))}
            style={{ 
              padding: '0.75rem', 
              borderRadius: '8px', 
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-primary)',
              color: 'var(--text-primary)',
              fontSize: '1rem',
              width: '100%'
            }}
          >
            {months.map(m => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="card glass-panel" style={{ marginTop: '1rem' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.125rem' }}>
          <Download size={20} color="var(--accent-primary)" />
          Exportation CSV (Tableur)
        </h2>
        <p style={{ fontSize: '0.875rem' }}>
          Générez un fichier pour Excel, LibreOffice ou Numbers contenant vos jours pour l'année de référence choisie.
        </p>
        
        <button 
          onClick={handleExport}
          style={{
            marginTop: '1.5rem',
            width: '100%',
            padding: '1rem',
            backgroundColor: 'var(--accent-primary)',
            color: 'white',
            borderRadius: '12px',
            fontSize: '1rem',
            fontWeight: 600,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '0.5rem',
            boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.2)'
          }}
        >
          <Download size={20} />
          Télécharger l'export (.csv)
        </button>
      </div>

      <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center', opacity: 0.5, fontSize: '0.75rem', gap: '0.5rem' }}>
        <Info size={14} />
        <span>Données stockées localement (100% privé)</span>
      </div>
    </div>
  );
}
