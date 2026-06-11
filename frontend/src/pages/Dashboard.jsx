import React from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import {
  Sparkles,
  Flame,
  Activity,
  Apple,
  Camera,
  Heart,
  TrendingDown,
  TrendingUp,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  ChevronRight,
  TrendingUp as GainIcon
} from 'lucide-react';

export default function Dashboard({ onTabSelect, onTriggerScan, activeAnalysis }) {
  const { user } = useAuth();
  const profile = user?.profile || {
    weight: 70,
    height: 175,
    goal: 'Maintenance',
    bmi: 22.86,
    dailyCalorieTarget: 2000,
    diseaseConditions: [],
    dietPreference: 'General'
  };

  const getBmiCategory = (bmiValue) => {
    if (bmiValue < 18.5) return { text: 'Underweight', color: 'text-blue-500 bg-blue-500/10' };
    if (bmiValue >= 25 && bmiValue < 29.9) return { text: 'Overweight', color: 'text-amber-500 bg-amber-500/10' };
    if (bmiValue >= 30) return { text: 'Obese', color: 'text-rose-500 bg-rose-500/10' };
    return { text: 'Normal', color: 'text-emerald-500 bg-emerald-500/10' };
  };

  const bmiMeta = getBmiCategory(profile.bmi);

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Welcome Banner */}
      <div className="relative rounded-3xl overflow-hidden glass-panel p-6 sm:p-8 border border-slate-200/40 dark:border-slate-800/40 brand-glow">
        <div className="absolute top-0 right-0 w-64 h-64 bg-glow-radial pointer-events-none"></div>
        <div className="relative z-10 space-y-4">
          <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-bold uppercase tracking-widest">Premium Workspace</span>
          <h2 className="text-3xl font-extrabold font-display text-slate-800 dark:text-white mt-2">
            Hello, <span className="gradient-text">{user?.name || 'Explorer'}</span>
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xl leading-relaxed">
            Welcome to your unified healthcare dashboard. Scan your meals for instant macronutrient assessments, track biometric indexes, or chat with your private clinical AI assistant.
          </p>
        </div>
      </div>

      {/* Core Biological Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Metric 1: BMI */}
        <div className="glass-panel p-6 rounded-3xl flex flex-col justify-between hover:scale-[1.01] transition-transform">
          <div className="flex justify-between items-start">
            <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Body Mass Index</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
              <Activity className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold font-display text-slate-800 dark:text-white">{profile.bmi}</span>
            <span className={`inline-block ml-2 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${bmiMeta.color}`}>
              {bmiMeta.text}
            </span>
          </div>
          <p className="text-[10px] text-slate-400 mt-3 border-t border-slate-200/30 dark:border-slate-800/30 pt-3">
            Healthy baseline range: 18.5 - 24.9
          </p>
        </div>

        {/* Metric 2: Calories */}
        <div className="glass-panel p-6 rounded-3xl flex flex-col justify-between hover:scale-[1.01] transition-transform">
          <div className="flex justify-between items-start">
            <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Daily Calorie Target</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
              <Flame className="w-4.5 h-4.5 animate-pulse" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold font-display text-slate-800 dark:text-white">{profile.dailyCalorieTarget}</span>
            <span className="text-xs text-slate-400 ml-1 uppercase font-semibold">kcal</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-3 border-t border-slate-200/30 dark:border-slate-800/30 pt-3">
            Recalculated using Mifflin-St Jeor BMR
          </p>
        </div>

        {/* Metric 3: Objective */}
        <div className="glass-panel p-6 rounded-3xl flex flex-col justify-between hover:scale-[1.01] transition-transform">
          <div className="flex justify-between items-start">
            <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Active Goal</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
              {profile.goal === 'Weight Loss' ? <TrendingDown className="w-4.5 h-4.5" /> : <TrendingUp className="w-4.5 h-4.5" />}
            </div>
          </div>
          <div className="mt-4">
            <span className="text-xl font-bold font-display text-slate-800 dark:text-white">{profile.goal}</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-3 border-t border-slate-200/30 dark:border-slate-800/30 pt-3">
            {profile.goal === 'Weight Loss' ? 'Deficit: -500 kcal per day' : profile.goal === 'Weight Gain' ? 'Surplus: +500 kcal per day' : 'Caloric equilibrium'}
          </p>
        </div>

        {/* Metric 4: Diet preference */}
        <div className="glass-panel p-6 rounded-3xl flex flex-col justify-between hover:scale-[1.01] transition-transform">
          <div className="flex justify-between items-start">
            <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Diet Type</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500">
              <Apple className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-xl font-bold font-display text-slate-800 dark:text-white">{profile.dietPreference}</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-3 border-t border-slate-200/30 dark:border-slate-800/30 pt-3">
            Selected in health profile settings
          </p>
        </div>

      </div>

      {/* Main Interactive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Interactive Card: Scan Plate */}
        <div className="lg:col-span-2 glass-panel p-6 sm:p-8 rounded-3xl relative overflow-hidden flex flex-col justify-between group border-2 border-dashed border-slate-200/60 dark:border-slate-800/50 hover:border-emerald-500/40 transition-all shadow-lg">
          <div className="absolute top-0 right-0 w-48 h-48 bg-glow-radial pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity"></div>
          
          <div className="space-y-4">
            <div className="w-12 h-12 bg-emerald-500/15 text-emerald-500 rounded-2xl flex items-center justify-center border border-emerald-500/20 group-hover:scale-110 transition-transform">
              <Camera className="w-6 h-6 animate-pulse-slow" />
            </div>
            <div>
              <h3 className="text-lg font-bold font-display text-slate-800 dark:text-white">AI Plate Scanner & Analyst</h3>
              <p className="text-xs text-slate-400 leading-relaxed mt-1">
                Upload a picture from your device gallery or snap a plate live using your device webcam. Our computer vision evaluates calories, tracks protein, fat, carbohydrates, and suggests improvements dynamically!
              </p>
            </div>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <button
              onClick={onTriggerScan}
              className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-semibold text-xs transition-all shadow-lg shadow-emerald-500/15 flex items-center justify-center gap-1.5 active:scale-95 border border-emerald-500/20 group-hover:brand-glow-hover"
            >
              <Camera className="w-3.5 h-3.5" /> Launch Scanner Modal
            </button>
            <button
              onClick={() => onTabSelect('chat')}
              className="px-6 py-3 bg-slate-200 dark:bg-slate-800/80 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-semibold text-xs transition-all flex items-center justify-center gap-1 hover:gap-1.5"
            >
              Ask AI about Meal <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Right Card: Disease Quick Reference Checklist */}
        <div className="lg:col-span-1 glass-panel p-6 rounded-3xl flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-glow-rose-radial pointer-events-none"></div>
          
          <div className="space-y-4">
            <h3 className="text-base font-bold font-display text-slate-800 dark:text-white flex items-center gap-2">
              <Heart className="w-5 h-5 text-emerald-500" /> Active Profile Checklist
            </h3>

            <p className="text-[10px] text-slate-400 leading-normal border-b border-slate-200/50 dark:border-slate-800/50 pb-3">
              We sync your health guidelines automatically. Below are active targets aligned with your profile conditions:
            </p>

            <div className="space-y-3">
              {profile.diseaseConditions.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-xs text-slate-400">No medical condition limits active.</p>
                  <button
                    onClick={() => onTabSelect('profile')}
                    className="text-[10px] font-bold text-emerald-500 hover:underline mt-2 inline-block"
                  >
                    Configure Health conditions
                  </button>
                </div>
              ) : (
                profile.diseaseConditions.map((cond, i) => (
                  <div key={i} className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10 flex items-center justify-between text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    <span className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-500" /> {cond} Limits Enabled
                    </span>
                    <button
                      onClick={() => onTabSelect('diseases')}
                      className="text-[10px] underline hover:text-emerald-700 transition-colors"
                    >
                      View Foods
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-6 border-t border-slate-200/50 dark:border-slate-800/50 mt-6 text-center">
            <button
              onClick={() => onTabSelect('diseases')}
              className="text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-emerald-500 dark:hover:text-emerald-400 flex items-center justify-center gap-1.5 mx-auto"
            >
              Browse complete medical list <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
