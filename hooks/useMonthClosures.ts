'use client';

import { useState, useCallback, useMemo } from 'react';
import type { MonthClosureSnapshot } from '@/types/domain';
import { getStorageItem, setStorageItem, STORAGE_KEYS } from './useFinancialData';

export interface UseMonthClosuresResult {
  closures: Record<string, MonthClosureSnapshot>;
  closeMonth: (snapshot: MonthClosureSnapshot) => void;
  isMonthClosed: (monthKey: string) => boolean;
  latestClosure: MonthClosureSnapshot | null;
  previousClosure: MonthClosureSnapshot | null;
  recentClosures: MonthClosureSnapshot[];
  getClosureDelta: () => { flow: number; expenses: number; debt: number } | null;
  monthLabel: (monthKey: string) => string;
}

export function useMonthClosures(selectedDate: Date): UseMonthClosuresResult {
  const [closures, setClosures] = useState<Record<string, MonthClosureSnapshot>>(() => 
    getStorageItem<Record<string, MonthClosureSnapshot>>(STORAGE_KEYS.MONTH_CLOSURES, {})
  );

  const closeMonth = useCallback((snapshot: MonthClosureSnapshot) => {
    const updated = { ...closures, [snapshot.monthKey]: snapshot };
    setStorageItem(STORAGE_KEYS.MONTH_CLOSURES, updated);
    setClosures(updated);
  }, [closures]);

  const isMonthClosed = useCallback((monthKey: string) => !!closures[monthKey], [closures]);

  const sortedKeys = useMemo(() => 
    Object.keys(closures).sort((a, b) => a.localeCompare(b)), 
    [closures]
  );

  const latestClosure = useMemo(() => {
    if (sortedKeys.length === 0) return null;
    return closures[sortedKeys[sortedKeys.length - 1]];
  }, [closures, sortedKeys]);

  const previousClosure = useMemo(() => {
    if (sortedKeys.length < 2) return null;
    return closures[sortedKeys[sortedKeys.length - 2]];
  }, [closures, sortedKeys]);

  const recentClosures = useMemo(() => 
    sortedKeys.slice(-3).reverse().map(key => closures[key]),
    [closures, sortedKeys]
  );

  const getClosureDelta = useCallback(() => {
    if (!latestClosure || !previousClosure) return null;
    return {
      flow: latestClosure.availableFlow - previousClosure.availableFlow,
      expenses: latestClosure.expenses - previousClosure.expenses,
      debt: latestClosure.totalDebt - previousClosure.totalDebt,
    };
  }, [latestClosure, previousClosure]);

  const monthLabel = useCallback((monthKey: string) => {
    const [year, month] = monthKey.split('-').map(Number);
    const MONTH_NAMES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    return `${MONTH_NAMES[month - 1]} ${year}`;
  }, []);

  return {
    closures,
    closeMonth,
    isMonthClosed,
    latestClosure,
    previousClosure,
    recentClosures,
    getClosureDelta,
    monthLabel,
  };
}

// Settings hook for shared preferences
export interface UseSettingsResult {
  variableIncomeDeltaPct: number;
  setVariableIncomeDeltaPct: (value: number) => void;
  liquidityFloorMode: 'auto' | 'manual';
  setLiquidityFloorMode: (mode: 'auto' | 'manual') => void;
  manualLiquidityFloor: number;
  setManualLiquidityFloor: (value: number) => void;
}

export function useSettings(): UseSettingsResult {
  const [variableIncomeDeltaPct, setVariableIncomeDeltaPct] = useState(() => {
    const stored = getStorageItem<number>(STORAGE_KEYS.VARIABLE_INCOME_DELTA, 20);
    return [10, 20, 30].includes(stored) ? stored : 20;
  });

  const [liquidityFloorMode, setLiquidityFloorMode] = useState<'auto' | 'manual'>(() => {
    const mode = getStorageItem<string>(STORAGE_KEYS.LIQUIDITY_FLOOR_MODE, 'auto');
    return mode === 'auto' || mode === 'manual' ? mode : 'auto';
  });

  const [manualLiquidityFloor, setManualLiquidityFloor] = useState(() => {
    const stored = getStorageItem<number>(STORAGE_KEYS.LIQUIDITY_FLOOR_MANUAL, 0);
    return stored;
  });

  const handleSetVariableIncomeDeltaPct = (value: number) => {
    setVariableIncomeDeltaPct(value);
    setStorageItem(STORAGE_KEYS.VARIABLE_INCOME_DELTA, value);
  };

  const handleSetLiquidityFloorMode = (mode: 'auto' | 'manual') => {
    setLiquidityFloorMode(mode);
    setStorageItem(STORAGE_KEYS.LIQUIDITY_FLOOR_MODE, mode);
  };

  const handleSetManualLiquidityFloor = (value: number) => {
    setManualLiquidityFloor(value);
    setStorageItem(STORAGE_KEYS.LIQUIDITY_FLOOR_MANUAL, value);
  };

  return {
    variableIncomeDeltaPct,
    setVariableIncomeDeltaPct: handleSetVariableIncomeDeltaPct,
    liquidityFloorMode,
    setLiquidityFloorMode: handleSetLiquidityFloorMode,
    manualLiquidityFloor,
    setManualLiquidityFloor: handleSetManualLiquidityFloor,
  };
}

// Blocked categories hook
export interface UseBlockedCategoriesResult {
  blockedCategories: string[];
  toggleCategory: (value: string) => void;
  isBlocked: (value: string) => boolean;
}

export function useBlockedCategories(): UseBlockedCategoriesResult {
  const [blockedCategories, setBlockedCategories] = useState<string[]>(() =>
    getStorageItem<string[]>(STORAGE_KEYS.BLOCKED_CUT_CATEGORIES, [])
  );

  const toggleCategory = (value: string) => {
    const updated = blockedCategories.includes(value)
      ? blockedCategories.filter(v => v !== value)
      : [...blockedCategories, value];
    setBlockedCategories(updated);
    setStorageItem(STORAGE_KEYS.BLOCKED_CUT_CATEGORIES, updated);
  };

  const isBlocked = (value: string) => blockedCategories.includes(value);

  return { blockedCategories, toggleCategory, isBlocked };
}