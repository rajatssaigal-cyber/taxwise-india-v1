/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { create } from 'zustand';
import { TaxStore, TaxAnalysisResult, UserProfile } from '../types';

export const useTaxStore = create<TaxStore>((set) => ({
  summary: null,
  isLoading: false,
  error: null,
  financialYear: '2024-25',
  user: null,
  setSummary: (summary: TaxAnalysisResult | null) => set({ summary }),
  setLoading: (isLoading: boolean) => set({ isLoading }),
  setError: (error: string | null) => set({ error }),
  setFinancialYear: (financialYear: string) => set({ financialYear }),
  setUser: (user: UserProfile | null) => set({ user }),
}));
