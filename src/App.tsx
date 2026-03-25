/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Navbar from './components/Navbar';
import FileUpload from './components/FileUpload';
import TaxReport from './components/TaxReport';
import ChatBot from './components/ChatBot';
import { useTaxStore } from './store/useTaxStore';
import { auth, googleProvider, signInWithPopup, onAuthStateChanged } from './lib/firebase';
import { Loader2, CheckCircle2, FileText, ArrowRight, Lock, Shield, Server, EyeOff } from 'lucide-react';

export default function App() {
  const { user, setUser, summary, isLoading } = useTaxStore();

  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      setUser({
        uid: result.user.uid,
        displayName: result.user.displayName,
        email: result.user.email,
        photoURL: result.user.photoURL,
      });
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          displayName: firebaseUser.displayName,
          email: firebaseUser.email,
          photoURL: firebaseUser.photoURL,
        });
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, [setUser]);

  return (
    <div className="min-h-screen bg-bg dark:bg-slate-950 selection:bg-indigo-100 selection:text-indigo-900 dark:selection:bg-indigo-900 dark:selection:text-indigo-100 transition-colors duration-300">
      <Navbar />

      <main className="px-4 md:px-8 pt-6 md:pt-12">
        <AnimatePresence mode="wait">
          {!summary ? (
            <motion.div
              key="hero"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col lg:flex-row items-center justify-between gap-8 md:gap-16 py-6 md:py-12"
            >
              {/* Left Side: Editorial Typography */}
              <div className="flex-1 space-y-6 md:space-y-8 text-center lg:text-left">
                <motion.div
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="space-y-2"
                >
                  <span className="text-[10px] font-black tracking-[0.3em] text-indigo-600 dark:text-indigo-400 uppercase">PREMIUM TAX ENGINE</span>
                  <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter text-ink dark:text-white leading-[0.9] md:leading-[0.85] font-sans">
                    Tax Analysis <br />
                    <span className="italic font-serif text-indigo-600 dark:text-indigo-400">Reimagined.</span>
                  </h1>
                </motion.div>
                
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-lg md:text-xl text-gray-500 dark:text-gray-400 max-w-lg mx-auto lg:mx-0 font-medium leading-relaxed"
                >
                  Upload your Form 16 or P&L statement. Our AI-driven engine provides a comprehensive breakdown of your taxes in seconds.
                </motion.p>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 sm:gap-6"
                >
                  <div className="flex -space-x-3">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="w-10 h-10 rounded-full border-2 border-bg dark:border-slate-950 bg-gray-200 dark:bg-gray-800 overflow-hidden">
                        <img src={`https://picsum.photos/seed/user${i}/100/100`} alt="User" referrerPolicy="no-referrer" />
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-ink dark:text-white">Trusted by 10,000+ Investors</span>
                    <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 tracking-widest uppercase">ACROSS INDIA</span>
                  </div>
                </motion.div>
              </div>

              {/* Right Side: Upload Card */}
              <div className="flex-1 w-full max-w-xl">
                {user ? (
                  <FileUpload />
                ) : (
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="bg-white dark:bg-slate-900 rounded-[2rem] md:rounded-[3rem] p-8 md:p-12 shadow-2xl shadow-indigo-100/50 dark:shadow-none border border-indigo-50 dark:border-slate-800 flex flex-col items-center justify-center text-center h-full min-h-[400px]"
                  >
                    <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-900/30 rounded-3xl flex items-center justify-center mb-6">
                      <Lock className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <h3 className="text-2xl md:text-3xl font-black text-ink dark:text-white mb-4 tracking-tight">Secure Upload</h3>
                    <p className="text-gray-500 dark:text-gray-400 font-medium mb-8 max-w-sm leading-relaxed text-sm md:text-base">
                      Your financial data is highly sensitive. Please sign in to securely upload your tax documents. We use bank-grade encryption to protect your privacy.
                    </p>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleLogin}
                      className="w-full py-5 bg-indigo-600 text-white rounded-[2rem] font-black text-lg shadow-xl shadow-indigo-200 dark:shadow-none hover:bg-indigo-700 transition-all flex items-center justify-center gap-3"
                    >
                      <Lock className="w-5 h-5" />
                      SIGN IN TO UPLOAD
                    </motion.button>
                  </motion.div>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="report"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <TaxReport />
            </motion.div>
          )}
        </AnimatePresence>

        {/* How to Use Section */}
        {!summary && (
          <motion.section 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="mt-24 md:mt-32 max-w-6xl mx-auto"
          >
            <div className="text-center mb-12 md:mb-16">
              <span className="text-[10px] font-black tracking-[0.3em] text-indigo-600 dark:text-indigo-400 uppercase">SIMPLE PROCESS</span>
              <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-ink dark:text-white mt-4">
                How TaxWise Works
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
              {/* Step 1 */}
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-black text-2xl">
                  1
                </div>
                <h3 className="text-xl font-bold text-ink dark:text-white">Gather Documents</h3>
                <p className="text-gray-500 dark:text-gray-400 font-medium text-sm leading-relaxed">
                  Download your <strong>Form 16</strong> from your employer, <strong>Salary Slips</strong>, or <strong>Tax P&L Statements</strong> from your broker (Zerodha, Groww, Upstox, etc.).
                </p>
              </div>

              {/* Step 2 */}
              <div className="flex flex-col items-center text-center space-y-4 relative">
                <div className="hidden md:block absolute top-8 left-[-50%] w-full h-[2px] bg-gradient-to-r from-transparent via-indigo-100 dark:via-indigo-900/50 to-transparent -z-10" />
                <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-black text-2xl">
                  2
                </div>
                <h3 className="text-xl font-bold text-ink dark:text-white">Upload & Analyze</h3>
                <p className="text-gray-500 dark:text-gray-400 font-medium text-sm leading-relaxed">
                  Drag and drop your files into the engine. Our AI securely extracts income, deductions, and capital gains in seconds.
                </p>
              </div>

              {/* Step 3 */}
              <div className="flex flex-col items-center text-center space-y-4 relative">
                <div className="hidden md:block absolute top-8 left-[-50%] w-full h-[2px] bg-gradient-to-r from-transparent via-indigo-100 dark:via-indigo-900/50 to-transparent -z-10" />
                <div className="w-16 h-16 bg-indigo-600 dark:bg-indigo-500 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-indigo-200 dark:shadow-none">
                  3
                </div>
                <h3 className="text-xl font-bold text-ink dark:text-white">Get Your Blueprint</h3>
                <p className="text-gray-500 dark:text-gray-400 font-medium text-sm leading-relaxed">
                  Review your personalized tax breakdown, compare Old vs. New regime, and chat with our AI CA for specific queries.
                </p>
              </div>
            </div>
          </motion.section>
        )}

        {/* Security & Privacy Section */}
        {!summary && (
          <motion.section 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0, duration: 0.8 }}
            className="mt-24 md:mt-32 max-w-6xl mx-auto mb-12"
          >
            <div className="bg-ink dark:bg-slate-900 text-white rounded-[3rem] p-8 md:p-16 relative overflow-hidden border border-transparent dark:border-slate-800">
              <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/20 blur-[100px] rounded-full pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/20 blur-[100px] rounded-full pointer-events-none" />
              
              <div className="relative z-10 text-center mb-12 md:mb-16">
                <span className="text-[10px] font-black tracking-[0.3em] text-indigo-400 uppercase">ENTERPRISE-GRADE SECURITY</span>
                <h2 className="text-3xl md:text-5xl font-black tracking-tighter mt-4">
                  Your Data is <span className="text-indigo-400 italic font-serif">Yours.</span>
                </h2>
                <p className="text-gray-400 font-medium mt-6 max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
                  We built TaxWise with a privacy-first architecture. Your financial documents are processed securely, never monetized, and strictly protected under global data protection laws.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                    <Shield className="w-6 h-6 text-indigo-400" />
                  </div>
                  <h4 className="font-bold text-lg">DPDP & GDPR Compliant</h4>
                  <p className="text-xs text-gray-400 leading-relaxed">Fully compliant with India's Digital Personal Data Protection Act and EU's GDPR. You have the right to delete your data anytime.</p>
                </div>
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                    <EyeOff className="w-6 h-6 text-indigo-400" />
                  </div>
                  <h4 className="font-bold text-lg">Zero Data Monetization</h4>
                  <p className="text-xs text-gray-400 leading-relaxed">We will never sell, rent, or share your financial data with third parties, advertisers, or brokers. Your trust is our product.</p>
                </div>
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                    <Server className="w-6 h-6 text-indigo-400" />
                  </div>
                  <h4 className="font-bold text-lg">Ephemeral Processing</h4>
                  <p className="text-xs text-gray-400 leading-relaxed">Documents are processed securely in memory and immediately discarded after the AI generates your tax report. No permanent storage.</p>
                </div>
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                    <Lock className="w-6 h-6 text-indigo-400" />
                  </div>
                  <h4 className="font-bold text-lg">Bank-Grade Encryption</h4>
                  <p className="text-xs text-gray-400 leading-relaxed">All data in transit is secured using TLS 1.3 encryption, ensuring your sensitive financial information is safe from interception.</p>
                </div>
              </div>
            </div>
          </motion.section>
        )}
      </main>

      {/* Loading Overlay */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-bg/80 dark:bg-slate-950/80 backdrop-blur-xl z-[100] flex flex-col items-center justify-center gap-6"
          >
            <div className="relative">
              <div className="w-24 h-24 border-4 border-indigo-100 dark:border-indigo-900/50 rounded-full" />
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 w-24 h-24 border-4 border-indigo-600 dark:border-indigo-400 border-t-transparent rounded-full"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-indigo-600 dark:text-indigo-400 animate-spin" />
              </div>
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-2xl font-black text-ink dark:text-white">Analyzing your documents...</h3>
              <p className="text-sm text-gray-400 dark:text-gray-500 font-medium">Our AI CA is crunching the numbers for you.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <ChatBot />

      {/* Footer */}
      <footer className="px-4 md:px-8 py-8 md:py-12 border-t border-indigo-50 dark:border-slate-800 mt-16 md:mt-24">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8 opacity-40 dark:opacity-60">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black tracking-widest uppercase dark:text-white">© 2026 TAXWISE INDIA</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8">
            <span className="text-[10px] font-black tracking-widest uppercase cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 dark:text-white transition-colors">PRIVACY POLICY</span>
            <span className="text-[10px] font-black tracking-widest uppercase cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 dark:text-white transition-colors">TERMS OF SERVICE</span>
            <span className="text-[10px] font-black tracking-widest uppercase cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 dark:text-white transition-colors">CONTACT SUPPORT</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
