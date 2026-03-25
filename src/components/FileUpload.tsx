/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, FileSpreadsheet, Image as ImageIcon, Loader2, CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import * as XLSX from 'xlsx';
import { analyzeTaxDocuments } from '../lib/gemini';
import { useTaxStore } from '../store/useTaxStore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';

export default function FileUpload() {
  const { setSummary, setLoading, setError, isLoading, financialYear } = useTaxStore();
  const [files, setFiles] = useState<File[]>([]);
  const [processing, setProcessing] = useState(false);
  const [fileErrors, setFileErrors] = useState<string[]>([]);

  const processFile = async (file: File): Promise<{ data: string; mimeType: string }> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const result = e.target?.result;
        if (!result) return reject('Failed to read file');

        if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls') || file.name.endsWith('.csv')) {
          const workbook = XLSX.read(result, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const csv = XLSX.utils.sheet_to_csv(workbook.Sheets[sheetName]);
          resolve({ data: btoa(csv), mimeType: 'text/csv' });
        } else {
          resolve({ data: result as string, mimeType: file.type });
        }
      };
      reader.onerror = () => reject('File reading error');

      if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls') || file.name.endsWith('.csv')) {
        reader.readAsBinaryString(file);
      } else {
        reader.readAsDataURL(file);
      }
    });
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(prev => [...prev, ...acceptedFiles]);
    setFileErrors([]);
  }, []);

  const onDropRejected = useCallback((fileRejections: any[]) => {
    const errors = fileRejections.map(rejection => {
      const file = rejection.file;
      const error = rejection.errors[0];
      if (error.code === 'file-too-large') {
        return `${file.name} is too large (max 10MB).`;
      }
      if (error.code === 'file-invalid-type') {
        return `${file.name} has an unsupported file type.`;
      }
      return `${file.name} could not be uploaded.`;
    });
    setFileErrors(errors);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDropRejected,
    maxSize: 10 * 1024 * 1024, // 10MB
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'text/csv': ['.csv'],
      'image/*': ['.png', '.jpg', '.jpeg']
    }
  });

  const handleAnalyze = async () => {
    if (files.length === 0) return;
    setProcessing(true);
    setLoading(true);
    setError(null);

    try {
      const processedFiles = await Promise.all(files.map(processFile));
      const result = await analyzeTaxDocuments(processedFiles, financialYear);
      
      // Save to Firestore if user is logged in
      const user = useTaxStore.getState().user;
      if (user) {
        try {
          const analysisRef = doc(collection(db, 'users', user.uid, 'analyses'));
          await setDoc(analysisRef, {
            userId: user.uid,
            financialYear,
            summary: result.summary,
            itrGuidance: result.itrGuidance,
            advanceTaxSchedule: result.advanceTaxSchedule,
            detailedBreakdown: result.detailedBreakdown,
            recommendations: result.recommendations,
            ...(result.foreignAssets ? { foreignAssets: result.foreignAssets } : {}),
            createdAt: serverTimestamp()
          });
        } catch (firestoreErr) {
          handleFirestoreError(firestoreErr, OperationType.CREATE, `users/${user.uid}/analyses`);
        }
      }

      setSummary(result);
    } catch (err) {
      console.error('Analysis error:', err);
      setError('Failed to analyze documents. Please try again.');
    } finally {
      setProcessing(false);
      setLoading(false);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white rounded-[2rem] md:rounded-[3rem] p-6 md:p-12 shadow-2xl shadow-indigo-100/50 border border-indigo-50"
      >
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-[1.5rem] md:rounded-[2rem] p-6 md:p-12 flex flex-col items-center justify-center transition-all cursor-pointer ${
            isDragActive ? 'border-indigo-600 bg-indigo-50/50' : 'border-gray-100 hover:border-indigo-200 hover:bg-gray-50/50'
          }`}
        >
          <input {...getInputProps()} />
          <div className="w-12 h-12 md:w-16 md:h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mb-4 md:mb-6">
            <Upload className="w-6 h-6 md:w-8 md:h-8 text-indigo-600" />
          </div>
          <h3 className="text-lg md:text-xl font-bold text-ink mb-2 text-center">Drop your tax documents here</h3>
          <p className="text-xs md:text-sm text-gray-400 font-medium text-center max-w-sm">
            Upload Form 16, Salary Slips, or P&L Statements from brokers (Zerodha, Groww, Upstox, etc.)
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
            <span className="px-2 py-1 bg-gray-100 text-gray-500 rounded-md text-[10px] font-bold uppercase tracking-wider">PDF</span>
            <span className="px-2 py-1 bg-gray-100 text-gray-500 rounded-md text-[10px] font-bold uppercase tracking-wider">Excel / CSV</span>
            <span className="px-2 py-1 bg-gray-100 text-gray-500 rounded-md text-[10px] font-bold uppercase tracking-wider">Images</span>
            <span className="px-2 py-1 bg-indigo-50 text-indigo-600 rounded-md text-[10px] font-bold uppercase tracking-wider">Max 10MB</span>
          </div>
        </div>

        <AnimatePresence>
          {fileErrors.length > 0 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-4 space-y-2 overflow-hidden"
            >
              {fileErrors.map((err, i) => (
                <div key={i} className="flex items-center gap-2 text-xs font-medium text-red-600 bg-red-50 p-3 rounded-xl border border-red-100">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{err}</span>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {files.length > 0 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-8 space-y-3 overflow-hidden"
            >
              <div className="text-[10px] font-black tracking-widest text-gray-400 uppercase mb-4">
                SELECTED FILES ({files.length})
              </div>
              {files.map((file, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <div className="flex items-center gap-3">
                    {file.type.includes('image') ? (
                      <ImageIcon className="w-5 h-5 text-indigo-400" />
                    ) : file.name.includes('xls') || file.name.includes('csv') ? (
                      <FileSpreadsheet className="w-5 h-5 text-green-500" />
                    ) : (
                      <FileText className="w-5 h-5 text-red-400" />
                    )}
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-ink truncate max-w-[200px]">{file.name}</span>
                      <span className="text-[10px] text-gray-400 font-mono">{(file.size / 1024).toFixed(1)} KB</span>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFile(i)}
                    className="p-2 hover:bg-red-50 rounded-xl text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <AlertCircle className="w-4 h-4" />
                  </button>
                </div>
              ))}

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAnalyze}
                disabled={processing}
                className="w-full py-5 bg-indigo-600 text-white rounded-[2rem] font-black text-lg shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center justify-center gap-3 mt-8 disabled:opacity-50"
              >
                {processing ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    ANALYZING...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-6 h-6" />
                    GENERATE TAX REPORT
                  </>
                )}
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 opacity-40">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" />
            <span className="text-[10px] font-black tracking-widest uppercase">DPDP ACT COMPLIANT</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" />
            <span className="text-[10px] font-black tracking-widest uppercase">BANK-GRADE SECURITY</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
