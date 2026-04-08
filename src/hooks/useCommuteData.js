import { useState, useEffect } from 'react';
import { setMonth, format } from 'date-fns';

const STORAGE_KEY = 'velotaf_data';
const SETTINGS_KEY = 'velotaf_settings';

export function useCommuteData() {
  const [commutedDays, setCommutedDays] = useState(new Set());
  const [settings, setSettings] = useState({
    periodStartMonth: 0, // Janvier par défaut (0-indexed)
  });
  const [isLoaded, setIsLoaded] = useState(false);

  // Load
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

      // Autocheck si le lien contient ?action=add_today
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('action') === 'add_today') {
        const todayStr = format(new Date(), 'yyyy-MM-dd');
        initialData.add(todayStr);
        
        // Nettoyer l'URL proprement sans recharger
        const cleanUrl = window.location.protocol + "//" + window.location.host + window.location.pathname + window.location.hash;
        window.history.replaceState({ path: cleanUrl }, '', cleanUrl);
      }

      setCommutedDays(initialData);
    } catch (e) {
      console.error("Local storage error", e);
    }
    setIsLoaded(true);
  }, []);

  // Save
  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...commutedDays]));
  }, [commutedDays, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }, [settings, isLoaded]);

  const toggleDay = (dateStr) => {
    setCommutedDays(prev => {
      const next = new Set(prev);
      if (next.has(dateStr)) next.delete(dateStr);
      else next.add(dateStr);
      return next;
    });
  };

  const importDays = (daysArray, replace = false) => {
    setCommutedDays(prev => {
      const next = replace ? new Set() : new Set(prev);
      daysArray.forEach(day => next.add(day));
      return next;
    });
  };

  const hasCommuted = (dateStr) => commutedDays.has(dateStr);
  const updateSetting = (key, value) => setSettings(prev => ({ ...prev, [key]: value }));

  const getPeriodForDate = (date) => {
    const currentYear = date.getFullYear();
    const currentMonth = date.getMonth();
    const startYear = currentMonth >= settings.periodStartMonth ? currentYear : currentYear - 1;
    
    // Début
    let start = new Date(startYear, settings.periodStartMonth, 1);
    
    // Fin (dernier jour du mois précédant le nouveau cycle l'année d'après)
    let end = new Date(startYear + 1, settings.periodStartMonth, 1);
    end.setDate(0); 
    
    return { start, end };
  };

  return {
    commutedDays,
    toggleDay,
    importDays,
    hasCommuted,
    settings,
    updateSetting,
    getPeriodForDate,
    isLoaded
  };
}
