/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';
import { useTaxStore } from '../store/useTaxStore';
import { 
  TrendingUp, 
  ShieldCheck, 
  Calendar, 
  FileText, 
  CheckCircle2, 
  AlertCircle,
  Info
} from 'lucide-react';

const COLORS = ['#4f46e5', '#818cf8', '#a5b4fc', '#c7d2fe', '#e0e7ff'];

export default function TaxReport() {
  const { summary } = useTaxStore();
  const [activeTab, setActiveTab] = useState<'guidance' | 'schedule'>('guidance');

  if (!summary) return null;

  const chartData = [
    { name: 'Salary', value: summary.summary.incomeSources.salary },
    { name: 'STCG', value: summary.summary.incomeSources.stcg },
    { name: 'LTCG', value: summary.summary.incomeSources.ltcg },
    { name: 'Dividends', value: summary.summary.incomeSources.dividends },
    { name: 'Other', value: summary.summary.incomeSources.other },
  ].filter(d => d.value > 0);

  const formatCurrency = (val: any) => 
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(val) || 0);

  const getStr = (val: any): string => {
    if (val === null || val === undefined) return '';
    if (typeof val === 'string') return val;
    if (typeof val === 'number') return val.toString();
    return JSON.stringify(val);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-6xl mx-auto space-y-12 pb-24"
    >
      {/* Header Section */}
      <div className="flex flex-col gap-2">
        <span className="text-[10px] font-black tracking-[0.2em] text-indigo-600 uppercase">TAX ANALYSIS REPORT</span>
        <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-ink font-sans">
          Your Financial <span className="italic font-serif text-indigo-600">Blueprint</span>
        </h2>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        {/* Left Column: Stats & Chart */}
        <div className="lg:col-span-2 space-y-6 md:space-y-8">
          {/* Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            <StatCard 
              label="TOTAL INCOME" 
              value={formatCurrency(summary.summary.totalIncome)} 
              icon={<TrendingUp className="w-5 h-5 text-indigo-600" />}
            />
            <StatCard 
              label="TAX LIABILITY (NEW)" 
              value={formatCurrency(summary.summary.taxLiabilityNew)} 
              icon={<ShieldCheck className="w-5 h-5 text-green-600" />}
              subValue={`Old Regime: ${formatCurrency(summary.summary.taxLiabilityOld)}`}
            />
            <StatCard 
              label="BALANCE TAX" 
              value={formatCurrency(summary.summary.balanceTax)} 
              icon={<Calendar className="w-5 h-5 text-red-600" />}
            />
          </div>

          {/* Chart Card */}
          <div className="bg-white rounded-[2rem] md:rounded-[3rem] p-6 md:p-10 shadow-2xl shadow-indigo-100/50 border border-indigo-50">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg md:text-xl font-bold text-ink">Income Distribution</h3>
              <div className="flex items-center gap-2 px-3 py-1 bg-indigo-50 rounded-full">
                <div className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse" />
                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">LIVE DATA</span>
              </div>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {chartData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                  />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Detailed Breakdown */}
          <div className="bg-white rounded-[2rem] md:rounded-[3rem] p-6 md:p-12 shadow-2xl shadow-indigo-100/50 border border-indigo-50">
            <div className="flex items-center gap-3 mb-6 md:mb-8">
              <FileText className="w-5 h-5 md:w-6 md:h-6 text-indigo-600" />
              <h3 className="text-xl md:text-2xl font-bold text-ink">Detailed Breakdown</h3>
            </div>
            <div className="prose prose-sm md:prose-base prose-indigo max-w-none text-gray-600 font-sans leading-relaxed">
              <Markdown>{getStr(summary.detailedBreakdown)}</Markdown>
            </div>
          </div>
        </div>

        {/* Right Column: Guidance & Schedule */}
        <div className="space-y-6 md:space-y-8">
          <div className="bg-white rounded-[2rem] md:rounded-[3rem] p-6 md:p-8 shadow-2xl shadow-indigo-100/50 border border-indigo-50 flex flex-col h-full">
            <div className="flex p-1 bg-gray-50 rounded-2xl mb-8">
              <button
                onClick={() => setActiveTab('guidance')}
                className={`flex-1 py-3 text-[10px] font-black tracking-widest uppercase rounded-xl transition-all ${
                  activeTab === 'guidance' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400 hover:text-ink'
                }`}
              >
                ITR GUIDANCE
              </button>
              <button
                onClick={() => setActiveTab('schedule')}
                className={`flex-1 py-3 text-[10px] font-black tracking-widest uppercase rounded-xl transition-all ${
                  activeTab === 'schedule' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400 hover:text-ink'
                }`}
              >
                ADVANCE TAX
              </button>
            </div>

            <AnimatePresence mode="wait">
              {activeTab === 'guidance' ? (
                <motion.div
                  key="guidance"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="p-6 bg-indigo-50 rounded-[2rem] border border-indigo-100">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-lg">
                        {getStr(summary.itrGuidance?.formType).slice(-1) || '1'}
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-ink">{getStr(summary.itrGuidance?.formType)}</h4>
                        <span className="text-[10px] font-black text-indigo-600 tracking-widest uppercase">RECOMMENDED FORM</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">{getStr(summary.itrGuidance?.reason)}</p>
                  </div>

                  <div className="space-y-4">
                    <h5 className="text-[10px] font-black tracking-widest text-gray-400 uppercase">KEY RECOMMENDATIONS</h5>
                    {Array.isArray(summary.recommendations) ? summary.recommendations.map((rec, i) => (
                      <div key={i} className="flex items-start gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                        <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <p className="text-xs font-medium text-ink leading-relaxed">{getStr(rec)}</p>
                      </div>
                    )) : (
                      <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                        <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <p className="text-xs font-medium text-ink leading-relaxed">{getStr(summary.recommendations)}</p>
                      </div>
                    )}
                  </div>

                  {summary.foreignAssets?.detected && (
                    <div className="p-6 bg-red-50 rounded-[2rem] border border-red-100">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertCircle className="w-4 h-4 text-red-600" />
                        <h5 className="text-xs font-bold text-red-600 uppercase tracking-wider">SCHEDULE FA REQUIRED</h5>
                      </div>
                      <p className="text-xs text-red-700 leading-relaxed">{getStr(summary.foreignAssets?.details)}</p>
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="schedule"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="space-y-4">
                    {Array.isArray(summary.advanceTaxSchedule) ? summary.advanceTaxSchedule.map((item, i) => (
                      <div key={i} className="flex items-center justify-between p-5 bg-gray-50 rounded-2xl border border-gray-100">
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-ink">{getStr(item?.dueDate)}</span>
                          <span className="text-[10px] font-black text-indigo-600 tracking-widest uppercase">{Number(item?.percentage) || 0}% INSTALLMENT</span>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-black text-ink font-mono">{formatCurrency(item?.amount)}</span>
                        </div>
                      </div>
                    )) : (
                      <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100">
                        <span className="text-xs font-bold text-ink">No schedule available</span>
                      </div>
                    )}
                  </div>
                  <div className="p-6 bg-indigo-50 rounded-[2rem] border border-indigo-100 flex items-start gap-3">
                    <Info className="w-5 h-5 text-indigo-600 mt-0.5" />
                    <p className="text-xs text-indigo-700 leading-relaxed">
                      Interest under section 234C may apply if advance tax is not paid as per this schedule.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function StatCard({ label, value, icon, subValue }: { label: string; value: string; icon: React.ReactNode; subValue?: string }) {
  return (
    <div className="bg-white rounded-[2rem] md:rounded-[3rem] p-6 md:p-8 shadow-2xl shadow-indigo-100/50 border border-indigo-50 flex flex-col items-center text-center">
      <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-50 rounded-2xl flex items-center justify-center mb-4">
        {icon}
      </div>
      <span className="text-[10px] font-black tracking-[0.2em] text-gray-400 uppercase mb-2">{label}</span>
      <span className="text-2xl md:text-3xl font-black text-ink font-mono tracking-tighter">{value}</span>
      {subValue && <span className="text-[10px] font-medium text-gray-400 mt-2">{subValue}</span>}
    </div>
  );
}
