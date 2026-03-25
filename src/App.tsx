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
import { auth, onAuthStateChanged } from './lib/firebase';
import { Loader2, CheckCircle2, FileText, ArrowRight } from 'lucide-react';

export default function App() {
  const { user, setUser, summary, isLoading } = useTaxStore();

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
    <div className="min-h-screen bg-bg selection:bg-indigo-100 selection:text-indigo-900">
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
                  <span className="text-[10px] font-black tracking-[0.3em] text-indigo-600 uppercase">PREMIUM TAX ENGINE</span>
                  <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter text-ink leading-[0.9] md:leading-[0.85] font-sans">
                    Tax Analysis <br />
                    <span className="italic font-serif text-indigo-600">Reimagined.</span>
                  </h1>
                </motion.div>
                
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-lg md:text-xl text-gray-500 max-w-lg mx-auto lg:mx-0 font-medium leading-relaxed"
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
                      <div key={i} className="w-10 h-10 rounded-full border-2 border-bg bg-gray-200 overflow-hidden">
                        <img src={`https://picsum.photos/seed/user${i}/100/100`} alt="User" referrerPolicy="no-referrer" />
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-ink">Trusted by 10,000+ Investors</span>
                    <span className="text-[10px] font-black text-indigo-600 tracking-widest uppercase">ACROSS INDIA</span>
                  </div>
                </motion.div>
              </div>

              {/* Right Side: Upload Card */}
              <div className="flex-1 w-full max-w-xl">
                <FileUpload />
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
              <span className="text-[10px] font-black tracking-[0.3em] text-indigo-600 uppercase">SIMPLE PROCESS</span>
              <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-ink mt-4">
                How TaxWise Works
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
              {/* Step 1 */}
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 font-black text-2xl">
                  1
                </div>
                <h3 className="text-xl font-bold text-ink">Gather Documents</h3>
                <p className="text-gray-500 font-medium text-sm leading-relaxed">
                  Download your <strong>Form 16</strong> from your employer, <strong>Salary Slips</strong>, or <strong>Tax P&L Statements</strong> from your broker (Zerodha, Groww, Upstox, etc.).
                </p>
              </div>

              {/* Step 2 */}
              <div className="flex flex-col items-center text-center space-y-4 relative">
                <div className="hidden md:block absolute top-8 left-[-50%] w-full h-[2px] bg-gradient-to-r from-transparent via-indigo-100 to-transparent -z-10" />
                <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 font-black text-2xl">
                  2
                </div>
                <h3 className="text-xl font-bold text-ink">Upload & Analyze</h3>
                <p className="text-gray-500 font-medium text-sm leading-relaxed">
                  Drag and drop your files into the engine. Our AI securely extracts income, deductions, and capital gains in seconds.
                </p>
              </div>

              {/* Step 3 */}
              <div className="flex flex-col items-center text-center space-y-4 relative">
                <div className="hidden md:block absolute top-8 left-[-50%] w-full h-[2px] bg-gradient-to-r from-transparent via-indigo-100 to-transparent -z-10" />
                <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-indigo-200">
                  3
                </div>
                <h3 className="text-xl font-bold text-ink">Get Your Blueprint</h3>
                <p className="text-gray-500 font-medium text-sm leading-relaxed">
                  Review your personalized tax breakdown, compare Old vs. New regime, and chat with our AI CA for specific queries.
                </p>
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
            className="fixed inset-0 bg-bg/80 backdrop-blur-xl z-[100] flex flex-col items-center justify-center gap-6"
          >
            <div className="relative">
              <div className="w-24 h-24 border-4 border-indigo-100 rounded-full" />
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 w-24 h-24 border-4 border-indigo-600 border-t-transparent rounded-full"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
              </div>
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-2xl font-black text-ink">Analyzing your documents...</h3>
              <p className="text-sm text-gray-400 font-medium">Our AI CA is crunching the numbers for you.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <ChatBot />

      {/* Footer */}
      <footer className="px-4 md:px-8 py-8 md:py-12 border-t border-indigo-50 mt-16 md:mt-24">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8 opacity-40">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black tracking-widest uppercase">© 2026 TAXWISE INDIA</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8">
            <span className="text-[10px] font-black tracking-widest uppercase cursor-pointer hover:text-indigo-600 transition-colors">PRIVACY POLICY</span>
            <span className="text-[10px] font-black tracking-widest uppercase cursor-pointer hover:text-indigo-600 transition-colors">TERMS OF SERVICE</span>
            <span className="text-[10px] font-black tracking-widest uppercase cursor-pointer hover:text-indigo-600 transition-colors">CONTACT SUPPORT</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
