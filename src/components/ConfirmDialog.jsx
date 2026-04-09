import { AlertTriangle } from 'lucide-react';

export default function ConfirmDialog({ isOpen, title, message, onConfirm, onCancel }) {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
        zIndex: 3000,
        animation: 'fadeIn 0.2s ease-out',
      }}
    >
      <div
        className="glass-panel"
        style={{
          maxWidth: '400px',
          width: '100%',
          padding: '2rem',
          borderRadius: '20px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1.25rem',
          animation: 'zoomIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      >
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '0.25rem',
          }}
        >
          <AlertTriangle size={32} color="var(--danger)" />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>{title}</h2>
          <p style={{ fontSize: '1rem', opacity: 0.8, margin: 0, lineHeight: 1.5 }}>{message}</p>
        </div>

        <div style={{ display: 'flex', gap: '1rem', width: '100%', marginTop: '0.5rem' }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1,
              padding: '0.875rem',
              borderRadius: '12px',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--border-color)',
              fontWeight: 600,
              color: 'var(--text-primary)',
              transition: 'background 0.2s',
            }}
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            style={{
              flex: 1,
              padding: '0.875rem',
              borderRadius: '12px',
              backgroundColor: 'var(--danger)',
              color: 'white',
              fontWeight: 600,
              boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
              transition: 'transform 0.2s',
            }}
          >
            Supprimer
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes zoomIn {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
