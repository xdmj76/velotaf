import { useState, useEffect } from 'react';
import { setMonth } from 'date-fns';

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
      const storedData = localStorage.getItem(STORAGE_KEY);
      if (storedData) {
        setCommutedDays(new Set(JSON.parse(storedData)));
      }
      
      const storedSettings = localStorage.getItem(SETTINGS_KEY);
      if (storedSettings) {
        setSettings(JSON.parse(storedSettings));
      }
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
    hasCommuted,
    settings,
    updateSetting,
    getPeriodForDate,
    isLoaded
  };
}
