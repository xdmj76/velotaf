import { useState, useEffect } from 'react';
import {
  Home,
  Calendar as CalendarIcon,
  Settings as SettingsIcon,
  List as ListIcon,
} from 'lucide-react';
import HomeView from './views/Home';
import CalendarView from './views/Calendar';
import SettingsView from './views/Settings';
import HistoryView from './views/History';
import AuthView from './views/Auth';
import Toast from './components/Toast';
import ConfirmDialog from './components/ConfirmDialog';
import { useCommuteData } from './hooks/useCommuteData';
import { supabase } from './lib/supabase';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

function App() {
  const [currentTab, setCurrentTab] = useState('home');
  const [session, setSession] = useState(null);
  const commuteData = useCommuteData(session);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (!commuteData.isLoaded) {
    return null;
  }

  if (!session) {
    return <AuthView />;
  }

  const renderView = () => {
    switch (currentTab) {
      case 'home':
        return <HomeView commuteData={commuteData} onNavigate={(tab) => setCurrentTab(tab)} />;
      case 'list':
        return <HistoryView commuteData={commuteData} />;
      case 'calendar':
        return <CalendarView commuteData={commuteData} />;
      case 'settings':
        return <SettingsView commuteData={commuteData} />;
      default:
        return <HomeView commuteData={commuteData} onNavigate={(tab) => setCurrentTab(tab)} />;
    }
  };

  return (
    <div className="app-container">
      {commuteData.notification && (
        <Toast
          message={commuteData.notification.message}
          type={commuteData.notification.type}
          onClose={commuteData.clearNotification}
        />
      )}

      <ConfirmDialog
        isOpen={commuteData.confirmModal.isOpen}
        title="Supprimer la journée ?"
        message={`Voulez-vous vraiment retirer la journée du ${commuteData.confirmModal.dateStr ? format(new Date(commuteData.confirmModal.dateStr), 'EEEE d MMMM', { locale: fr }) : ''} ?`}
        onConfirm={commuteData.handleConfirmDelete}
        onCancel={commuteData.handleCancelDelete}
      />

      <main className="main-content">{renderView()}</main>

      <nav
        className="glass-panel"
        style={{
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          padding: '0.75rem 0 calc(0.75rem + var(--safe-area-bottom))',
          zIndex: 1000,
          borderTop: '1px solid var(--border-color)',
          width: '100%',
        }}
      >
        <NavItem
          icon={<Home size={26} />}
          label="Aujourd'hui"
          isActive={currentTab === 'home'}
          onClick={() => setCurrentTab('home')}
        />
        <NavItem
          icon={<ListIcon size={26} />}
          label="Historique"
          isActive={currentTab === 'list'}
          onClick={() => setCurrentTab('list')}
        />
        <NavItem
          icon={<CalendarIcon size={26} />}
          label="Calendrier"
          isActive={currentTab === 'calendar'}
          onClick={() => setCurrentTab('calendar')}
        />
        <NavItem
          icon={<SettingsIcon size={26} />}
          label="Réglages"
          isActive={currentTab === 'settings'}
          onClick={() => setCurrentTab('settings')}
        />
      </nav>
    </div>
  );
}

function NavItem({ icon, label, isActive, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
        transition: 'all 0.2s ease',
        transform: isActive ? 'translateY(-2px)' : 'none',
      }}
    >
      <div style={{ marginBottom: '4px' }}>{icon}</div>
      <span style={{ fontSize: '0.75rem', fontWeight: isActive ? 600 : 400 }}>{label}</span>
    </button>
  );
}

export default App;
