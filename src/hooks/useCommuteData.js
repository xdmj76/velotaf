import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { supabase } from '../lib/supabase';

const STORAGE_KEY = 'velotaf_data';
const SETTINGS_KEY = 'velotaf_settings';

export function useCommuteData(session) {
  const [commutedDays, setCommutedDays] = useState(new Set());
  const [settings, setSettings] = useState({
    periodStartMonth: 0, // Janvier par défaut (0-indexed)
  });
  const [isLoaded, setIsLoaded] = useState(false);
  const [syncStatus, setSyncStatus] = useState('idle'); // 'idle', 'syncing', 'error'
  const [notification, setNotification] = useState(null); // { message: string, type: 'error' | 'success' }
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, dateStr: null });

  const user = session?.user;

  // 1. Initial Load from LocalStorage (fast initial render)
  useEffect(() => {
    try {
      let initialData = new Set();
      const storedData = localStorage.getItem(STORAGE_KEY);
      if (storedData) {
        initialData = new Set(JSON.parse(storedData));
      }

      const storedSettings = localStorage.getItem(SETTINGS_KEY);
      if (storedSettings) {
        setSettings(JSON.parse(storedSettings));
      }

      // Autocheck action=add_today
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('action') === 'add_today') {
        const todayStr = format(new Date(), 'yyyy-MM-dd');
        initialData.add(todayStr);
        const cleanUrl =
          window.location.protocol +
          '//' +
          window.location.host +
          window.location.pathname +
          window.location.hash;
        window.history.replaceState({ path: cleanUrl }, '', cleanUrl);
      }

      setCommutedDays(initialData);
    } catch (e) {
      console.error('Local storage error', e);
    }
    setIsLoaded(true);
  }, []);

  // 2. Fetch from Supabase when user logs in
  useEffect(() => {
    if (!user || !isLoaded) return;

    const fetchCloudData = async () => {
      setSyncStatus('syncing');
      try {
        // Fetch rides
        const { data: rides, error: ridesError } = await supabase
          .from('rides')
          .select('ride_date')
          .eq('user_id', user.id);

        if (ridesError) throw ridesError;

        // Fetch settings
        const { data: settingsData, error: settingsError } = await supabase
          .from('settings')
          .select('period_start_month')
          .eq('user_id', user.id)
          .single();

        if (settingsError && settingsError.code !== 'PGRST116') throw settingsError; // 116 is no rows

        const cloudDates = new Set(rides.map((r) => r.ride_date));

        // Merge strategy: combine cloud and local state (e.g. from ?action=add_today)
        setCommutedDays((prev) => {
          const merged = new Set([...cloudDates, ...prev]);

          // If we have new local dates not in cloud, sync them
          const newLocalDates = Array.from(merged).filter((d) => !cloudDates.has(d));
          if (newLocalDates.length > 0) {
            supabase
              .from('rides')
              .insert(newLocalDates.map((d) => ({ user_id: user.id, ride_date: d })))
              .then(({ error }) => {
                if (error) console.error('Error syncing local action to cloud:', error);
              });
          }

          return merged;
        });

        if (settingsData) {
          setSettings({ periodStartMonth: settingsData.period_start_month });
        } else if (settingsError?.code === 'PGRST116') {
          // If settings are missing in cloud, sync local settings
          supabase
            .from('settings')
            .upsert({
              user_id: user.id,
              period_start_month: settings.periodStartMonth,
            })
            .then(({ error }) => {
              if (error) console.error('Error syncing settings to cloud:', error);
            });
        }
        setSyncStatus('idle');
      } catch (error) {
        console.error('Cloud fetch error', error);
        setSyncStatus('error');
      }
    };

    fetchCloudData();
  }, [user, isLoaded, settings.periodStartMonth]);

  // Local Save
  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...commutedDays]));
  }, [commutedDays, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }, [settings, isLoaded]);

  // Actions
  const executeToggle = async (dateStr, isAdding) => {
    const previousDays = new Set(commutedDays);

    // Optimistic Update
    setCommutedDays((prev) => {
      const next = new Set(prev);
      if (next.has(dateStr)) next.delete(dateStr);
      else next.add(dateStr);
      return next;
    });

    if (user) {
      try {
        let result;
        if (isAdding) {
          result = await supabase.from('rides').insert({ user_id: user.id, ride_date: dateStr });
        } else {
          result = await supabase
            .from('rides')
            .delete()
            .eq('user_id', user.id)
            .eq('ride_date', dateStr);
        }

        if (result.error) throw result.error;
        setSyncStatus('idle');
      } catch (e) {
        console.error('Cloud toggle error', e);
        setSyncStatus('error');
        // Rollback
        setCommutedDays(previousDays);
        setNotification({
          message: isAdding
            ? "Échec de l'ajout (Problème de connexion)"
            : 'Échec de la suppression (Problème de connexion)',
          type: 'error',
        });
      }
    }
  };

  const toggleDay = async (dateStr) => {
    const isAdding = !commutedDays.has(dateStr);

    if (!isAdding) {
      setConfirmModal({ isOpen: true, dateStr });
      return;
    }

    await executeToggle(dateStr, true);
  };

  const handleConfirmDelete = async () => {
    if (confirmModal.dateStr) {
      const dateToToggle = confirmModal.dateStr;
      setConfirmModal({ isOpen: false, dateStr: null });
      await executeToggle(dateToToggle, false);
    }
  };

  const handleCancelDelete = () => {
    setConfirmModal({ isOpen: false, dateStr: null });
  };

  const importDays = async (daysArray, replace = false) => {
    setCommutedDays((prev) => {
      const next = replace ? new Set() : new Set(prev);
      daysArray.forEach((day) => next.add(day));
      return next;
    });

    if (user) {
      try {
        if (replace) {
          await supabase.from('rides').delete().eq('user_id', user.id);
        }
        const ridesToInsert = daysArray.map((day) => ({ user_id: user.id, ride_date: day }));
        await supabase.from('rides').upsert(ridesToInsert);
      } catch (e) {
        console.error('Cloud import error', e);
      }
    }
  };

  const hasCommuted = (dateStr) => commutedDays.has(dateStr);

  const updateSetting = async (key, value) => {
    const previousSettings = { ...settings };
    setSettings((prev) => ({ ...prev, [key]: value }));

    if (user && key === 'periodStartMonth') {
      try {
        const { error } = await supabase.from('settings').upsert({
          user_id: user.id,
          period_start_month: value,
        });
        if (error) throw error;
        setSyncStatus('idle');
      } catch (e) {
        console.error('Cloud setting update error', e);
        // Rollback
        setSettings(previousSettings);
        setSyncStatus('error');
        setNotification({ message: 'Échec de la mise à jour des réglages', type: 'error' });
      }
    }
  };

  const getPeriodForDate = (date) => {
    const currentYear = date.getFullYear();
    const currentMonth = date.getMonth();
    const startYear = currentMonth >= settings.periodStartMonth ? currentYear : currentYear - 1;
    let start = new Date(startYear, settings.periodStartMonth, 1);
    let end = new Date(startYear + 1, settings.periodStartMonth, 1);
    end.setDate(0);
    return { start, end };
  };

  return {
    commutedDays,
    toggleDay,
    handleConfirmDelete,
    handleCancelDelete,
    confirmModal,
    importDays,
    hasCommuted,
    settings,
    updateSetting,
    getPeriodForDate,
    isLoaded,
    syncStatus,
    notification,
    clearNotification: () => setNotification(null),
    user,
  };
}
