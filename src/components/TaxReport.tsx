/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';
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
  Info,
  Download,
  FileDown,
  PlusCircle
} from 'lucide-react';

const COLORS = ['#4f46e5', '#818cf8', '#a5b4fc', '#c7d2fe', '#e0e7ff'];

function TooltipIcon({ content }: { content: string }) {
  return (
    <div className="group relative inline-flex items-center justify-center ml-1">
      <Info className="w-3 h-3 text-gray-400 cursor-help" />
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-ink dark:bg-white text-white dark:text-ink text-[10px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 text-center leading-relaxed">
        {content}
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-ink dark:border-t-white"></div>
      </div>
    </div>
  );
}

export default function TaxReport() {
  const { summary, setSummary } = useTaxStore();
  const [activeTab, setActiveTab] = useState<'guidance' | 'schedule' | 'filing'>('guidance');

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

  const exportCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Category,Amount\n"
      + `Total Income,${summary.summary.totalIncome}\n`
      + `Tax Liability (New),${summary.summary.taxLiabilityNew}\n`
      + `Tax Liability (Old),${summary.summary.taxLiabilityOld}\n`
      + `Balance Tax,${summary.summary.balanceTax}\n`
      + `Salary,${summary.summary.incomeSources.salary}\n`
      + `STCG,${summary.summary.incomeSources.stcg}\n`
      + `LTCG,${summary.summary.incomeSources.ltcg}\n`
      + `Dividends,${summary.summary.incomeSources.dividends}\n`
      + `Other Income,${summary.summary.incomeSources.other}\n`;
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "tax_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportPDF = () => {
    window.print();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-6xl mx-auto space-y-12 pb-24 print-container"
    >
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex flex-col gap-2">
          <span className="text-[10px] font-black tracking-[0.2em] text-indigo-600 dark:text-indigo-400 uppercase">TAX ANALYSIS REPORT</span>
          <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-ink dark:text-white font-sans">
            Your Financial <span className="italic font-serif text-indigo-600 dark:text-indigo-400">Blueprint</span>
          </h2>
        </div>
        <div className="flex flex-wrap items-center gap-3 no-print">
          <button onClick={() => setSummary(null)} className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-ink dark:text-white rounded-xl transition-colors font-bold text-sm">
            <PlusCircle className="w-4 h-4" />
            Add More Files
          </button>
          <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-xl transition-colors font-bold text-sm">
            <FileDown className="w-4 h-4" />
            Export CSV
          </button>
          <button onClick={exportPDF} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-colors font-bold text-sm">
            <Download className="w-4 h-4" />
            Save PDF
          </button>
        </div>
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
              icon={<TrendingUp className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />}
              tooltip="Sum of all your income sources including salary, capital gains, and other income."
            />
            <StatCard 
              label="TAX LIABILITY (NEW)" 
              value={formatCurrency(summary.summary.taxLiabilityNew)} 
              icon={<ShieldCheck className="w-5 h-5 text-green-600 dark:text-green-400" />}
              subValue={`Old Regime: ${formatCurrency(summary.summary.taxLiabilityOld)}`}
              tooltip="Estimated tax under the New Tax Regime, which offers lower rates but fewer deductions."
            />
            <StatCard 
              label="BALANCE TAX" 
              value={formatCurrency(summary.summary.balanceTax)} 
              icon={<Calendar className="w-5 h-5 text-red-600 dark:text-red-400" />}
              tooltip="Remaining tax to be paid after accounting for TDS and advance tax."
            />
          </div>

          {/* Chart Card */}
          <div className="bg-white dark:bg-slate-800 rounded-[2rem] md:rounded-[3rem] p-6 md:p-10 shadow-2xl shadow-indigo-100/50 dark:shadow-none border border-indigo-50 dark:border-slate-700">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2">
                <h3 className="text-lg md:text-xl font-bold text-ink dark:text-white">Income Distribution</h3>
                <TooltipIcon content="Visual breakdown of your different income streams." />
              </div>
              <div className="flex items-center gap-2 px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 rounded-full">
                <div className="w-2 h-2 bg-indigo-600 dark:bg-indigo-400 rounded-full animate-pulse" />
                <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">LIVE DATA</span>
              </div>
            </div>
            <div className="h-[300px] w-full flex items-center justify-center">
              {chartData.length > 0 ? (
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
                    <RechartsTooltip 
                      formatter={(value: number) => formatCurrency(value)}
                      contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                    />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-gray-400 dark:text-gray-500 text-sm font-medium">No income data available for chart</div>
              )}
            </div>
          </div>

          {/* Detailed Breakdown */}
          <div className="bg-white dark:bg-slate-800 rounded-[2rem] md:rounded-[3rem] p-6 md:p-12 shadow-2xl shadow-indigo-100/50 dark:shadow-none border border-indigo-50 dark:border-slate-700">
            <div className="flex items-center gap-3 mb-6 md:mb-8">
              <FileText className="w-5 h-5 md:w-6 md:h-6 text-indigo-600 dark:text-indigo-400" />
              <h3 className="text-xl md:text-2xl font-bold text-ink dark:text-white">Detailed Breakdown</h3>
              <TooltipIcon content="In-depth analysis of your tax computation, deductions, and exemptions." />
            </div>
            <div className="space-y-4">
              {Array.isArray(summary.detailedBreakdown) ? summary.detailedBreakdown.map((item, i) => (
                <div key={i} className="p-5 bg-gray-50 dark:bg-slate-700/50 rounded-2xl border border-gray-100 dark:border-slate-600 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex flex-col gap-1">
                    <h4 className="text-sm font-bold text-ink dark:text-white">{getStr(item.title)}</h4>
                    <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">{getStr(item.description)}</p>
                  </div>
                  {item.amount !== undefined && item.amount !== null && (
                    <div className="text-right flex-shrink-0">
                      <span className="text-sm font-black text-ink dark:text-white font-mono">{formatCurrency(item.amount)}</span>
                    </div>
                  )}
                </div>
              )) : (
                <div className="p-5 bg-gray-50 dark:bg-slate-700/50 rounded-2xl border border-gray-100 dark:border-slate-600">
                  <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{getStr(summary.detailedBreakdown)}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Guidance & Schedule */}
        <div className="space-y-6 md:space-y-8">
          <div className="bg-white dark:bg-slate-800 rounded-[2rem] md:rounded-[3rem] p-6 md:p-8 shadow-2xl shadow-indigo-100/50 dark:shadow-none border border-indigo-50 dark:border-slate-700 flex flex-col h-full">
            <div className="flex p-1 bg-gray-50 dark:bg-slate-900 rounded-2xl mb-8 no-print overflow-x-auto hide-scrollbar">
              <button
                onClick={() => setActiveTab('guidance')}
                className={`flex-1 min-w-[100px] py-3 px-2 text-[10px] font-black tracking-widest uppercase rounded-xl transition-all ${
                  activeTab === 'guidance' ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-gray-400 hover:text-ink dark:hover:text-white'
                }`}
              >
                ITR GUIDANCE
              </button>
              <button
                onClick={() => setActiveTab('schedule')}
                className={`flex-1 min-w-[100px] py-3 px-2 text-[10px] font-black tracking-widest uppercase rounded-xl transition-all ${
                  activeTab === 'schedule' ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-gray-400 hover:text-ink dark:hover:text-white'
                }`}
              >
                ADVANCE TAX
              </button>
              <button
                onClick={() => setActiveTab('filing')}
                className={`flex-1 min-w-[100px] py-3 px-2 text-[10px] font-black tracking-widest uppercase rounded-xl transition-all ${
                  activeTab === 'filing' ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-gray-400 hover:text-ink dark:hover:text-white'
                }`}
              >
                FILING GUIDE
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
                  <div className="p-6 bg-indigo-50 dark:bg-indigo-900/20 rounded-[2rem] border border-indigo-100 dark:border-indigo-800/30">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-indigo-600 dark:bg-indigo-500 rounded-xl flex items-center justify-center text-white font-black text-lg">
                        {getStr(summary.itrGuidance?.formType).slice(-1) || '1'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-lg font-bold text-ink dark:text-white">{getStr(summary.itrGuidance?.formType)}</h4>
                          <TooltipIcon content="The specific Income Tax Return form you need to file based on your income sources." />
                        </div>
                        <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 tracking-widest uppercase">RECOMMENDED FORM</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{getStr(summary.itrGuidance?.reason)}</p>
                  </div>

                  <div className="space-y-4">
                    <h5 className="text-[10px] font-black tracking-widest text-gray-400 uppercase">KEY RECOMMENDATIONS</h5>
                    {Array.isArray(summary.recommendations) ? summary.recommendations.map((rec, i) => (
                      <div key={i} className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-slate-700/50 rounded-2xl border border-gray-100 dark:border-slate-600">
                        <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <p className="text-xs font-medium text-ink dark:text-white leading-relaxed">{getStr(rec)}</p>
                      </div>
                    )) : (
                      <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-slate-700/50 rounded-2xl border border-gray-100 dark:border-slate-600">
                        <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <p className="text-xs font-medium text-ink dark:text-white leading-relaxed">{getStr(summary.recommendations)}</p>
                      </div>
                    )}
                  </div>

                  {summary.foreignAssets?.detected && (
                    <div className="p-6 bg-red-50 dark:bg-red-900/20 rounded-[2rem] border border-red-100 dark:border-red-800/30">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                        <h5 className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wider">SCHEDULE FA REQUIRED</h5>
                        <TooltipIcon content="Schedule FA is mandatory if you hold any foreign assets like US stocks (RSUs/ESPPs) or foreign bank accounts." />
                      </div>
                      <p className="text-xs text-red-700 dark:text-red-300 leading-relaxed">{getStr(summary.foreignAssets?.details)}</p>
                    </div>
                  )}
                </motion.div>
              ) : activeTab === 'schedule' ? (
                <motion.div
                  key="schedule"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="space-y-4">
                    {Array.isArray(summary.advanceTaxSchedule) ? summary.advanceTaxSchedule.map((item, i) => (
                      <div key={i} className="flex items-center justify-between p-5 bg-gray-50 dark:bg-slate-700/50 rounded-2xl border border-gray-100 dark:border-slate-600">
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-ink dark:text-white">{getStr(item?.dueDate)}</span>
                          <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 tracking-widest uppercase">UP TO {Number(item?.percentage) || 0}%</span>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-black text-ink dark:text-white font-mono">{formatCurrency(item?.amount)}</span>
                        </div>
                      </div>
                    )) : (
                      <div className="p-5 bg-gray-50 dark:bg-slate-700/50 rounded-2xl border border-gray-100 dark:border-slate-600">
                        <span className="text-xs font-bold text-ink dark:text-white">No schedule available</span>
                      </div>
                    )}
                  </div>
                  <div className="p-6 bg-indigo-50 dark:bg-indigo-900/20 rounded-[2rem] border border-indigo-100 dark:border-indigo-800/30 flex items-start gap-3">
                    <Info className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-indigo-700 dark:text-indigo-300 leading-relaxed">
                      Interest under section 234C may apply if advance tax is not paid as per this schedule.
                    </p>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="filing"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-black text-sm flex-shrink-0">1</div>
                      <div>
                        <h4 className="text-sm font-bold text-ink dark:text-white">Login to e-Filing Portal</h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Go to <a href="https://eportal.incometax.gov.in/" target="_blank" rel="noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline">eportal.incometax.gov.in</a> and login using your PAN and password.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-black text-sm flex-shrink-0">2</div>
                      <div>
                        <h4 className="text-sm font-bold text-ink dark:text-white">Select File Return</h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Navigate to <strong>e-File &gt; Income Tax Returns &gt; File Income Tax Return</strong>.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-black text-sm flex-shrink-0">3</div>
                      <div>
                        <h4 className="text-sm font-bold text-ink dark:text-white">Choose Assessment Year</h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Select the relevant Assessment Year (e.g., 2026-27 for FY 2025-26) and mode of filing as <strong>Online</strong>.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-black text-sm flex-shrink-0">4</div>
                      <div>
                        <h4 className="text-sm font-bold text-ink dark:text-white">Select ITR Form</h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Choose <strong>{getStr(summary.itrGuidance?.formType)}</strong> based on our recommendation.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-black text-sm flex-shrink-0">5</div>
                      <div>
                        <h4 className="text-sm font-bold text-ink dark:text-white">Verify Pre-filled Data</h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Check the pre-filled data against your Form 16 and AIS/TIS. Add any missing income or deductions.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-black text-sm flex-shrink-0">6</div>
                      <div>
                        <h4 className="text-sm font-bold text-ink dark:text-white">Pay Tax & e-Verify</h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Pay any balance tax due, submit the return, and e-Verify using Aadhaar OTP or Net Banking.</p>
                      </div>
                    </div>
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

function StatCard({ label, value, icon, subValue, tooltip }: { label: string; value: string; icon: React.ReactNode; subValue?: string; tooltip?: string }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-[2rem] md:rounded-[3rem] p-6 md:p-8 shadow-2xl shadow-indigo-100/50 dark:shadow-none border border-indigo-50 dark:border-slate-700 flex flex-col items-center text-center">
      <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-50 dark:bg-slate-700 rounded-2xl flex items-center justify-center mb-4">
        {icon}
      </div>
      <div className="flex items-center justify-center mb-2">
        <span className="text-[10px] font-black tracking-[0.2em] text-gray-400 uppercase">{label}</span>
        {tooltip && <TooltipIcon content={tooltip} />}
      </div>
      <span className="text-2xl md:text-3xl font-black text-ink dark:text-white font-mono tracking-tighter">{value}</span>
      {subValue && <span className="text-[10px] font-medium text-gray-400 mt-2">{subValue}</span>}
    </div>
  );
}
