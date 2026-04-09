import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCommuteData } from './useCommuteData';
import { format } from 'date-fns';

// Mock Supabase
vi.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
      getSession: vi.fn(() => Promise.resolve({ data: { session: null } })),
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockReturnThis(),
      upsert: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
    })),
  },
}));

describe('useCommuteData', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    vi.unstubAllGlobals();
  });

  it('initialise avec des données vides par défaut', () => {
    const { result } = renderHook(() => useCommuteData(null));
    expect(result.current.commutedDays.size).toBe(0);
    expect(result.current.isLoaded).toBe(true);
  });

  it('calcule correctement la période de référence (Janvier)', () => {
    const { result } = renderHook(() => useCommuteData(null));

    // settings.periodStartMonth par défaut est 0 (Janvier)
    const testDate = new Date(2026, 5, 15); // Juin 2026
    const { start, end } = result.current.getPeriodForDate(testDate);

    expect(start.getFullYear()).toBe(2026);
    expect(start.getMonth()).toBe(0); // Janvier

    expect(end.getFullYear()).toBe(2026);
    expect(end.getMonth()).toBe(11); // Décembre (31 déc)
  });

  it('calcule correctement la période de référence à cheval sur deux années (Septembre)', async () => {
    const { result } = renderHook(() => useCommuteData(null));

    await act(async () => {
      await result.current.updateSetting('periodStartMonth', 8); // Septembre
    });

    // Si on est en Juin 2026, la période commence en Septembre 2025
    const testDate = new Date(2026, 5, 15);
    const { start, end } = result.current.getPeriodForDate(testDate);

    expect(start.getFullYear()).toBe(2025);
    expect(start.getMonth()).toBe(8); // Septembre

    expect(end.getFullYear()).toBe(2026);
    expect(end.getMonth()).toBe(7); // Août
  });

  it.skip("gère l'action add_today au chargement", () => {
    const todayStr = format(new Date(), 'yyyy-MM-dd');

    // Mock window.location properly BEFORE rendering the hook
    const url = new URL('http://localhost/?action=add_today');
    vi.stubGlobal('location', {
      ...window.location,
      search: url.search,
      href: url.href,
      protocol: 'http:',
      host: 'localhost',
      pathname: '/',
    });

    const { result } = renderHook(() => useCommuteData(null));

    expect(result.current.commutedDays.has(todayStr)).toBe(true);
  });
});
