/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface TaxAnalysisResult {
  summary: {
    totalIncome: number;
    taxLiabilityOld: number;
    taxLiabilityNew: number;
    balanceTax: number;
    incomeSources: {
      salary: number;
      stcg: number;
      ltcg: number;
      dividends: number;
      other: number;
    };
  };
  itrGuidance: {
    formType: string;
    reason: string;
    deadline: string;
  };
  advanceTaxSchedule: {
    dueDate: string;
    percentage: number;
    amount: number;
  }[];
  detailedBreakdown: {
    title: string;
    description: string;
    amount?: number;
  }[];
  recommendations: string[];
  foreignAssets?: {
    detected: boolean;
    details: string;
    scheduleFA?: {
      countryName: string;
      institutionName: string;
      assetType: string;
      initialValue: number;
      peakValue: number;
      closingValue: number;
    }[];
  };
}

export interface UserProfile {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
}

export interface TaxStore {
  summary: TaxAnalysisResult | null;
  isLoading: boolean;
  error: string | null;
  financialYear: string;
  user: UserProfile | null;
  setSummary: (summary: TaxAnalysisResult | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setFinancialYear: (year: string) => void;
  setUser: (user: UserProfile | null) => void;
}
