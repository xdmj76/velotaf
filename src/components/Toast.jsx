import { useEffect, useState } from 'react';
import { AlertCircle, X, CheckCircle } from 'lucide-react';

export default function Toast({ message, type = 'error', onClose, duration = 4000 }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Allow animation to finish
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!isVisible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: '1.5rem',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 2000,
        width: 'calc(100% - 2rem)',
        maxWidth: '400px',
        animation: 'slideDown 0.3s ease-out',
      }}
    >
      <div
        className="glass-panel"
        style={{
          padding: '1rem',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          borderLeft: `4px solid ${type === 'error' ? 'var(--danger)' : 'var(--accent-primary)'}`,
        }}
      >
        {type === 'error' ? (
          <AlertCircle size={20} color="var(--danger)" />
        ) : (
          <CheckCircle size={20} color="var(--accent-primary)" />
        )}
        <p style={{ flex: 1, fontSize: '0.875rem', fontWeight: 500 }}>{message}</p>
        <button onClick={() => setIsVisible(false)} style={{ opacity: 0.5 }}>
          <X size={18} />
        </button>
      </div>
      <style>{`
        @keyframes slideDown {
          from { transform: translate(-50%, -20px); opacity: 0; }
          to { transform: translate(-50%, 0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
