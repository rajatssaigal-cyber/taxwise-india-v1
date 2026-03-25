/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { create } from 'zustand';
import { TaxStore, TaxAnalysisResult, UserProfile } from '../types';

interface ExtendedTaxStore extends TaxStore {
  files: File[];
  setFiles: (files: File[] | ((prev: File[]) => File[])) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

export const useTaxStore = create<ExtendedTaxStore>((set) => ({
  summary: null,
  isLoading: false,
  error: null,
  financialYear: '2025-26',
  user: null,
  files: [],
  theme: 'light',
  setSummary: (summary: TaxAnalysisResult | null) => set({ summary }),
  setLoading: (isLoading: boolean) => set({ isLoading }),
  setError: (error: string | null) => set({ error }),
  setFinancialYear: (financialYear: string) => set({ financialYear }),
  setUser: (user: UserProfile | null) => set({ user }),
  setFiles: (filesOrUpdater) => set((state) => ({
    files: typeof filesOrUpdater === 'function' ? filesOrUpdater(state.files) : filesOrUpdater
  })),
  toggleTheme: () => set((state) => {
    const newTheme = state.theme === 'light' ? 'dark' : 'light';
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    return { theme: newTheme };
  }),
}));
