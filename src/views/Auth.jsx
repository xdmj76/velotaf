import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Mail, Lock, Loader2, ArrowRight } from 'lucide-react';

export default function AuthView() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [mode, setMode] = useState('magic'); // 'magic', 'login', or 'signup'

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      let result;
      const authOptions = {
        email,
        options: {
          emailRedirectTo: window.location.href.split('#')[0],
        },
      };

      if (mode === 'magic') {
        result = await supabase.auth.signInWithOtp(authOptions);
        if (result.error) throw result.error;
        setMessage({ type: 'success', text: 'Lien de connexion envoyé ! Vérifiez vos emails.' });
      } else if (mode === 'login') {
        result = await supabase.auth.signInWithPassword({
          email,
          password,
          options: authOptions.options,
        });
        if (result.error) throw result.error;
      } else {
        result = await supabase.auth.signUp({
          email,
          password,
          options: authOptions.options,
        });
        if (result.error) throw result.error;
        setMessage({
          type: 'success',
          text: 'Inscription réussie ! Vérifiez vos emails pour confirmer.',
        });
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: '1.5rem',
        gap: '2rem',
      }}
    >
      <header style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--accent-primary)' }}>
          Velotaf
        </h1>
        <p style={{ opacity: 0.8, fontSize: '1.1rem' }}>Synchronisez vos trajets dans le cloud</p>
      </header>

      <div className="card glass-panel" style={{ padding: '2rem' }}>
        <div
          style={{
            display: 'flex',
            gap: '1rem',
            marginBottom: '2rem',
            borderBottom: '1px solid var(--border-color)',
            paddingBottom: '0.5rem',
          }}
        >
          <button
            onClick={() => {
              setMode('login');
              setMessage(null);
            }}
            style={{
              background: 'none',
              color: mode === 'login' ? 'var(--accent-primary)' : 'var(--text-secondary)',
              fontWeight: mode === 'login' ? 600 : 400,
              padding: '0.5rem 0',
              borderBottom: mode === 'login' ? '2px solid var(--accent-primary)' : 'none',
            }}
          >
            Connexion
          </button>
          <button
            onClick={() => {
              setMode('magic');
              setMessage(null);
            }}
            style={{
              background: 'none',
              color: mode === 'magic' ? 'var(--accent-primary)' : 'var(--text-secondary)',
              fontWeight: mode === 'magic' ? 600 : 400,
              padding: '0.5rem 0',
              borderBottom: mode === 'magic' ? '2px solid var(--accent-primary)' : 'none',
            }}
          >
            Lien magique
          </button>
          <button
            onClick={() => {
              setMode('signup');
              setMessage(null);
            }}
            style={{
              background: 'none',
              color: mode === 'signup' ? 'var(--accent-primary)' : 'var(--text-secondary)',
              fontWeight: mode === 'signup' ? 600 : 400,
              padding: '0.5rem 0',
              borderBottom: mode === 'signup' ? '2px solid var(--accent-primary)' : 'none',
            }}
          >
            S'inscrire
          </button>
        </div>

        <form
          onSubmit={handleAuth}
          style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Email</label>
            <div style={{ position: 'relative' }}>
              <Mail
                size={18}
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  opacity: 0.5,
                }}
              />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre@email.com"
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem 0.75rem 2.5rem',
                  borderRadius: '10px',
                  border: '1px solid var(--border-color)',
                  background: 'rgba(255, 255, 255, 0.05)',
                  color: 'white',
                }}
              />
            </div>
          </div>

          {mode !== 'magic' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Mot de passe</label>
              <div style={{ position: 'relative' }}>
                <Lock
                  size={18}
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    opacity: 0.5,
                  }}
                />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem 0.75rem 2.5rem',
                    borderRadius: '10px',
                    border: '1px solid var(--border-color)',
                    background: 'rgba(255, 255, 255, 0.05)',
                    color: 'white',
                  }}
                />
              </div>
            </div>
          )}

          {message && (
            <div
              style={{
                padding: '0.75rem',
                borderRadius: '8px',
                fontSize: '0.875rem',
                backgroundColor:
                  message.type === 'error' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                color: message.type === 'error' ? '#ef4444' : '#10b981',
                border: `1px solid ${message.type === 'error' ? '#ef4444' : '#10b981'}44`,
              }}
            >
              {message.text}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: '1rem',
              padding: '1rem',
              borderRadius: '12px',
              backgroundColor: 'var(--accent-primary)',
              color: 'white',
              fontWeight: 600,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '0.5rem',
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>
                {mode === 'magic'
                  ? 'Envoyer le lien'
                  : mode === 'login'
                    ? 'Se connecter'
                    : 'Créer un compte'}
                <ArrowRight size={20} />
              </>
            )}
          </button>
        </form>
      </div>

      <footer
        style={{
          textAlign: 'center',
          opacity: 0.5,
          fontSize: '0.875rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
        }}
      >
        <div>Vos données resteront accessibles même hors ligne.</div>
        <div style={{ fontSize: '0.65rem' }}>
          v{import.meta.env.APP_VERSION} — commit {import.meta.env.GIT_COMMIT}
        </div>
      </footer>
    </div>
  );
}
