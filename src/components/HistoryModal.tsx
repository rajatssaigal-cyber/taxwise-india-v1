/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Clock, FileText, Loader2, ChevronRight } from 'lucide-react';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { useTaxStore } from '../store/useTaxStore';
import { TaxAnalysisResult } from '../types';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SavedAnalysis extends TaxAnalysisResult {
  id: string;
  createdAt: any;
  financialYear: string;
}

export default function HistoryModal({ isOpen, onClose }: HistoryModalProps) {
  const { user, setSummary } = useTaxStore();
  const [history, setHistory] = useState<SavedAnalysis[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      fetchHistory();
    }
  }, [isOpen, user]);

  const fetchHistory = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const q = query(
        collection(db, 'users', user.uid, 'analyses'),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as SavedAnalysis[];
      setHistory(data);
    } catch (error) {
      console.error('Error fetching history:', error);
      handleFirestoreError(error, OperationType.LIST, `users/${user.uid}/analyses`);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (analysis: SavedAnalysis) => {
    // Reconstruct the TaxAnalysisResult
    const result: TaxAnalysisResult = {
      summary: analysis.summary,
      itrGuidance: analysis.itrGuidance,
      advanceTaxSchedule: analysis.advanceTaxSchedule,
      detailedBreakdown: analysis.detailedBreakdown,
      recommendations: analysis.recommendations,
      foreignAssets: analysis.foreignAssets
    };
    setSummary(result);
    onClose();
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Just now';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-ink/40 dark:bg-slate-950/60 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-white dark:bg-slate-900 shadow-2xl z-50 flex flex-col border-l border-indigo-50 dark:border-slate-800"
          >
            <div className="flex items-center justify-between p-6 border-b border-indigo-50 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center">
                  <Clock className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-ink dark:text-white">Saved Reports</h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Your past tax analyses</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-gray-400 hover:text-ink dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 text-gray-400 dark:text-gray-500">
                  <Loader2 className="w-8 h-8 animate-spin text-indigo-600 dark:text-indigo-400" />
                  <p className="text-sm font-medium">Loading history...</p>
                </div>
              ) : history.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 text-gray-400 dark:text-gray-500 text-center">
                  <div className="w-16 h-16 bg-gray-50 dark:bg-slate-800/50 rounded-2xl flex items-center justify-center">
                    <FileText className="w-8 h-8 text-gray-300 dark:text-gray-600" />
                  </div>
                  <p className="text-sm font-medium">No saved reports yet.<br/>Upload documents to generate one.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {history.map((analysis) => (
                    <motion.button
                      key={analysis.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleSelect(analysis)}
                      className="w-full text-left p-4 rounded-2xl border border-indigo-50 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-500/50 bg-white dark:bg-slate-900 hover:bg-indigo-50/30 dark:hover:bg-indigo-900/20 transition-all group"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <span className="inline-block px-2 py-1 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 text-[10px] font-black tracking-widest uppercase rounded-md mb-2">
                            FY {analysis.financialYear}
                          </span>
                          <h4 className="font-bold text-ink dark:text-white text-sm">Tax Report</h4>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-300 dark:text-gray-600 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" />
                      </div>
                      <div className="flex justify-between items-end">
                        <div className="flex flex-col">
                          <span className="text-[10px] text-gray-400 dark:text-gray-500 font-medium uppercase tracking-wider">Total Income</span>
                          <span className="font-mono font-bold text-ink dark:text-white text-sm">
                            {formatCurrency(analysis.summary.totalIncome)}
                          </span>
                        </div>
                        <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">
                          {formatDate(analysis.createdAt)}
                        </span>
                      </div>
                    </motion.button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
