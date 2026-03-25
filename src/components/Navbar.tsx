/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { ShieldCheck, LogOut, User as UserIcon, Clock } from 'lucide-react';
import { useTaxStore } from '../store/useTaxStore';
import { auth, googleProvider, signInWithPopup } from '../lib/firebase';
import { motion } from 'motion/react';
import HistoryModal from './HistoryModal';

export default function Navbar() {
  const { user, setUser } = useTaxStore();
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

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

  const handleLogout = async () => {
    try {
      await auth.signOut();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <nav className="flex items-center justify-between px-8 py-6 bg-transparent">
      <div className="flex items-center gap-2">
        <ShieldCheck className="w-8 h-8 text-indigo-600" />
        <span className="text-2xl font-black tracking-tighter text-ink font-sans">
          TaxWise <span className="text-indigo-600">India</span>
        </span>
      </div>

      <div className="flex items-center gap-4">
        {user ? (
          <div className="flex items-center gap-2 md:gap-4">
            <button
              onClick={() => setIsHistoryOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-xl transition-colors font-bold text-sm"
            >
              <Clock className="w-4 h-4" />
              <span className="hidden sm:inline">History</span>
            </button>
            <div className="flex items-center gap-4 bg-white/50 backdrop-blur-md p-1 pr-4 rounded-2xl border border-indigo-50 shadow-sm">
              <img
                src={user.photoURL || ''}
                alt={user.displayName || 'User'}
                className="w-10 h-10 rounded-xl object-cover border border-indigo-100"
                referrerPolicy="no-referrer"
              />
              <div className="hidden sm:flex flex-col">
                <span className="text-xs font-bold text-ink leading-tight">{user.displayName}</span>
                <span className="text-[10px] text-gray-500 font-mono tracking-tight">{user.email}</span>
              </div>
              <button
                onClick={handleLogout}
                className="ml-2 p-2 hover:bg-red-50 rounded-xl transition-colors text-gray-400 hover:text-red-600"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleLogin}
            className="px-6 py-2.5 bg-indigo-600 text-white rounded-2xl font-bold text-sm shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center gap-2"
          >
            <UserIcon className="w-4 h-4" />
            Sign in with Google
          </motion.button>
        )}
      </div>

      <HistoryModal isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} />
    </nav>
  );
}
