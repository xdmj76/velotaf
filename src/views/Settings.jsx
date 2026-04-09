import { useState } from 'react';
import { format } from 'date-fns';
import { Download, Upload, CalendarDays, Info, Link as LinkIcon, User, LogOut, Cloud, CloudOff, RefreshCw } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function SettingsView({ commuteData }) {
  const [mergeData, setMergeData] = useState(true);
  const [firstName, setFirstName] = useState(commuteData.user?.user_metadata?.first_name || '');
  const [isUpdating, setIsUpdating] = useState(false);
  
  const handleUpdateName = async () => {
    if (firstName === (commuteData.user?.user_metadata?.first_name || '')) return;
    
    setIsUpdating(true);
    const { error } = await supabase.auth.updateUser({
      data: { first_name: firstName }
    });
    
    if (error) {
      alert("Erreur lors de la mise à jour : " + error.message);
    }
    setIsUpdating(false);
  };
  
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

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const csv = event.target.result;
      const lines = csv.split(/\r?\n/);
      const importedDates = [];

      lines.forEach((line, index) => {
        if (!line.trim()) return;
        // Skip header
        if (index === 0 && (line.toLowerCase().includes('date') || line.toLowerCase().includes('jour'))) return;

        // Split by semicolon or comma
        const [dateStr, value] = line.split(/[;,]/);
        
        if (dateStr && value) {
          const trimmedDate = dateStr.trim();
          const trimmedValue = value.trim();

          // Simple regex to match YYYY-MM-DD
          if (/^\d{4}-\d{2}-\d{2}$/.test(trimmedDate)) {
            // We assume "Oui" or "1" means a commuted day (as per export)
            if (trimmedValue === 'Oui' || trimmedValue === '1') {
              importedDates.push(trimmedDate);
            }
          }
        }
      });

      if (importedDates.length > 0) {
        commuteData.importDays(importedDates, !mergeData);
        alert(`${importedDates.length} jours vélotaf ont été ${mergeData ? 'fusionnés' : 'restaurés (écrasement)'}.`);
      } else {
        alert("Aucune donnée valide n'a été trouvée dans le fichier.");
      }
      
      // Reset input to allow re-importing the same file
      e.target.value = '';
    };
    reader.readAsText(file);
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
        <p style={{ fontSize: '1.1rem' }}>Configuration et compte</p>
      </header>

      <div className="card glass-panel">
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.125rem' }}>
          <User size={20} color="var(--accent-primary)" />
          Compte
        </h2>
        <div style={{ marginTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <p style={{ fontWeight: 600, fontSize: '1rem' }}>{commuteData.user?.email}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem', fontSize: '0.875rem', color: commuteData.syncStatus === 'error' ? 'var(--danger)' : 'var(--text-secondary)' }}>
              {commuteData.syncStatus === 'syncing' ? (
                <><RefreshCw size={14} className="animate-spin" /> Synchronisation...</>
              ) : commuteData.syncStatus === 'error' ? (
                <><CloudOff size={14} /> Erreur de synchronisation</>
              ) : (
                <><Cloud size={14} /> Données à jour</>
              )}
            </div>
          </div>
          <button 
            onClick={() => supabase.auth.signOut()}
            style={{ 
              width: '100%',
              padding: '0.75rem 1rem', 
              borderRadius: '8px', 
              border: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              fontSize: '0.875rem',
              color: 'var(--danger)',
              backgroundColor: 'rgba(239, 68, 68, 0.05)'
            }}
          >
            <LogOut size={16} />
            Déconnexion
          </button>
        </div>

        <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
          <label style={{ fontWeight: 500, fontSize: '0.875rem' }}>Mon Prénom</label>
          <input 
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            onBlur={handleUpdateName}
            onKeyDown={(e) => e.key === 'Enter' && handleUpdateName()}
            placeholder="Votre prénom"
            style={{ 
              width: '100%',
              padding: '0.75rem', 
              borderRadius: '8px', 
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-primary)',
              color: 'var(--text-primary)',
              fontSize: '1rem'
            }}
          />
        </div>
      </div>

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

      <div className="card glass-panel" style={{ marginTop: '1rem' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.125rem' }}>
          <Upload size={20} color="var(--accent-primary)" />
          Importation CSV (Restauration)
        </h2>
        <p style={{ fontSize: '0.875rem' }}>
          Importez un fichier CSV précédemment exporté pour restaurer vos données.
        </p>
        
        <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', backgroundColor: 'var(--bg-primary)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          <input 
            type="checkbox" 
            id="merge-checkbox" 
            checked={mergeData} 
            onChange={(e) => setMergeData(e.target.checked)}
            style={{ width: '1.25rem', height: '1.25rem', cursor: 'pointer', accentColor: 'var(--accent-primary)' }}
          />
          <label htmlFor="merge-checkbox" style={{ cursor: 'pointer', fontSize: '0.875rem' }}>
            Fusionner avec les données existantes (décocher pour tout remplacer)
          </label>
        </div>
        
        <div style={{ marginTop: '1.5rem' }}>
          <input 
            type="file" 
            id="csv-import" 
            accept=".csv" 
            onChange={handleImport} 
            style={{ display: 'none' }} 
          />
          <button 
            onClick={() => document.getElementById('csv-import').click()}
            style={{
              width: '100%',
              padding: '1rem',
              backgroundColor: 'transparent',
              color: 'var(--text-primary)',
              border: '2px dashed var(--accent-primary)',
              borderRadius: '12px',
              fontSize: '1rem',
              fontWeight: 600,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '0.5rem',
              cursor: 'pointer'
            }}
          >
            <Upload size={20} />
            Sélectionner un fichier CSV
          </button>
        </div>
      </div>

      <div className="card glass-panel" style={{ marginTop: '1rem' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.125rem' }}>
          <LinkIcon size={20} color="var(--accent-primary)" />
          Validation automatique
        </h2>
        <p style={{ fontSize: '0.875rem', marginBottom: '1rem' }}>
          Utilisez ce lien (dans vos favoris ou raccourcis) pour ouvrir l'application et valider instantanément la journée d'aujourd'hui :
        </p>
        
        <div style={{
          padding: '0.75rem',
          backgroundColor: 'var(--bg-primary)',
          borderRadius: '8px',
          border: '1px solid var(--accent-light)',
          fontSize: '0.875rem',
          wordBreak: 'break-all',
        }}>
          <code style={{ color: 'var(--text-primary)', userSelect: 'all', fontWeight: 500 }}>
            https://xdmj76.github.io/velotaf/?action=add_today
          </code>
        </div>
      </div>

      <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: 0.5, fontSize: '0.75rem', gap: '0.5rem', paddingBottom: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Info size={14} />
          <span>Données synchronisées dans le cloud</span>
        </div>
        <div style={{ fontSize: '0.65rem' }}>
          v{import.meta.env.APP_VERSION} — commit {import.meta.env.GIT_COMMIT}
        </div>
        <div style={{ 
          fontSize: '0.65rem', 
          marginTop: '0.5rem', 
          padding: '0.5rem', 
          backgroundColor: 'rgba(255, 255, 255, 0.03)', 
          border: '1px dashed rgba(255, 255, 255, 0.1)',
          borderRadius: '4px',
          fontFamily: 'monospace'
        }}>
          Auth Redirect URL (email): {window.location.origin + (import.meta.env.BASE_URL || '/')}
        </div>
      </div>
    </div>
  );
}
