import { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function SettingsView({ commuteData }) {
  const [mergeData, setMergeData] = useState(true);
  const [firstName, setFirstName] = useState(commuteData.user?.user_metadata?.first_name || '');
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState(null);

  const handleUpdateName = async () => {
    if (firstName === (commuteData.user?.user_metadata?.first_name || '')) return;

    setIsUpdating(true);
    const { error } = await supabase.auth.updateUser({
      data: { first_name: firstName },
    });

    if (error) {
      setError(error.message);
    }
    setIsUpdating(false);
  };

  const handleExportCSV = () => {
    const headers = ['Date', 'Jour'];
    const rows = [...commuteData.commutedDays].sort().map((dateStr) => {
      const d = new Date(dateStr);
      return [dateStr, d.toLocaleDateString('fr-FR', { weekday: 'long' })];
    });

    const csvContent = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `velotaf_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportCSV = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target.result;
      const lines = text.split('\n');
      const dates = [];

      // Skip header, process each line
      for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].split(',');
        if (parts[0] && parts[0].match(/^\d{4}-\d{2}-\d{2}$/)) {
          dates.push(parts[0]);
        }
      }

      if (dates.length > 0) {
        if (
          window.confirm(
            `Importer ${dates.length} jours de vélotaf ?\n${
              mergeData ? "(Fusionner avec l'existant)" : "(Remplacer l'existant)"
            }`
          )
        ) {
          await commuteData.importDays(dates, !mergeData);
          alert('Importation terminée !');
        }
      } else {
        alert('Aucune date valide trouvée dans le fichier.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
      <header style={{ marginBottom: '1.5rem', marginTop: '1rem' }}>
        <h1 style={{ fontSize: '2rem' }}>Réglages</h1>
        <p style={{ fontSize: '1.1rem' }}>Personnalisez votre expérience</p>
      </header>

      <div
        className="card glass-panel"
        style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
      >
        {/* Identité */}
        <div>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--accent-primary)' }}>
            Profil
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontWeight: 500, fontSize: '0.875rem' }}>
              Prénom (Affiché à l'accueil)
            </label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Votre prénom"
              style={{
                padding: '0.75rem',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-primary)',
                color: 'var(--text-primary)',
                fontSize: '1rem',
              }}
            />
          </div>
          {error && (
            <p style={{ color: 'var(--danger)', fontSize: '0.875rem', marginTop: '0.5rem' }}>
              {error}
            </p>
          )}
          <button
            onClick={handleUpdateName}
            disabled={
              isUpdating || firstName === (commuteData.user?.user_metadata?.first_name || '')
            }
            style={{
              marginTop: '1rem',
              padding: '0.75rem',
              borderRadius: '8px',
              backgroundColor: isUpdating ? 'var(--text-secondary)' : 'var(--accent-primary)',
              color: 'white',
              fontWeight: 600,
              width: '100%',
              cursor: isUpdating ? 'not-allowed' : 'pointer',
            }}
          >
            {isUpdating ? 'Mise à jour...' : 'Enregistrer les modifications'}
          </button>
        </div>

        <hr
          style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '0.5rem 0' }}
        />

        {/* Configuration de la période */}
        <div>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--accent-primary)' }}>
            Période de calcul
          </h2>
          <p style={{ fontSize: '0.875rem', marginBottom: '1rem', opacity: 0.8 }}>
            Définissez le mois où commence votre année de déclaration.
          </p>
          <select
            value={commuteData.settings.periodStartMonth}
            onChange={(e) =>
              commuteData.updateSetting('periodStartMonth', parseInt(e.target.value))
            }
            style={{
              padding: '0.75rem',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-primary)',
              color: 'var(--text-primary)',
              fontSize: '1rem',
              width: '100%',
            }}
          >
            <option value="0">Janvier</option>
            <option value="1">Février</option>
            <option value="2">Mars</option>
            <option value="3">Avril</option>
            <option value="4">Mai</option>
            <option value="5">Juin</option>
            <option value="6">Juillet</option>
            <option value="7">Août</option>
            <option value="8">Septembre</option>
            <option value="9">Octobre</option>
            <option value="10">Novembre</option>
            <option value="11">Décembre</option>
          </select>
        </div>

        <hr
          style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '0.5rem 0' }}
        />

        {/* Données */}
        <div>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--accent-primary)' }}>
            Données & Historique
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <button
              onClick={handleExportCSV}
              style={{
                padding: '0.75rem',
                borderRadius: '8px',
                backgroundColor: 'var(--bg-primary)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-color)',
                fontWeight: 600,
                width: '100%',
              }}
            >
              Exporter en CSV (.csv)
            </button>

            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginBottom: '0.5rem',
                }}
              >
                <input
                  type="checkbox"
                  id="mergeData"
                  checked={mergeData}
                  onChange={(e) => setMergeData(e.target.checked)}
                />
                <label htmlFor="mergeData" style={{ fontSize: '0.875rem' }}>
                  Fusionner avec les données existantes
                </label>
              </div>
              <label
                className="btn-primary"
                style={{
                  display: 'block',
                  textAlign: 'center',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  backgroundColor: 'var(--accent-primary)',
                  color: 'white',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Importer un fichier CSV
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleImportCSV}
                  style={{ display: 'none' }}
                />
              </label>
            </div>
          </div>
        </div>

        <hr
          style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '0.5rem 0' }}
        />

        {/* Compte */}
        <div>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--accent-primary)' }}>
            Compte
          </h2>
          <p style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>
            Connecté en tant que : <br />
            <strong>{commuteData.user?.email}</strong>
          </p>
          <button
            onClick={() => supabase.auth.signOut()}
            style={{
              marginTop: '1rem',
              padding: '0.75rem',
              borderRadius: '8px',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              color: 'var(--danger)',
              border: '1px solid var(--danger)',
              fontWeight: 600,
              width: '100%',
            }}
          >
            Se déconnecter
          </button>
        </div>
      </div>

      <div
        style={{
          marginTop: 'auto',
          padding: '2rem 1rem',
          textAlign: 'center',
          opacity: 0.5,
        }}
      >
        <div style={{ fontSize: '0.65rem' }}>
          v{import.meta.env.APP_VERSION} — commit {import.meta.env.GIT_COMMIT}
        </div>
      </div>
    </div>
  );
}
