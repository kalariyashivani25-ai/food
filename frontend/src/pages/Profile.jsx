import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { User, Activity, AlertCircle, Save, CheckSquare, Square, LogOut, ShieldCheck } from 'lucide-react';

const MEDICAL_OPTIONS = [
  'Diabetes',
  'High Blood Pressure',
  'Cholesterol',
  'PCOS',
  'Thyroid',
  'Heart Health',
];

const DIET_PREFS = [
  'General',
  'Vegetarian',
  'Vegan',
  'Keto',
  'Paleo',
  'Low Carb',
  'High Protein'
];

export default function Profile() {
  const { user, updateProfile, logout } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [age, setAge] = useState(user?.profile?.age || 28);
  const [gender, setGender] = useState(user?.profile?.gender || 'Other');
  const [weight, setWeight] = useState(user?.profile?.weight || 70);
  const [height, setHeight] = useState(user?.profile?.height || 175);
  const [activity, setActivity] = useState(user?.profile?.activityLevel || 'Moderate');
  const [goal, setGoal] = useState(user?.profile?.goal || 'Maintenance');
  const [diet, setDiet] = useState(user?.profile?.dietPreference || 'General');
  
  const [selectedDiseases, setSelectedDiseases] = useState(user?.profile?.diseaseConditions || []);

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  const toggleDisease = (cond) => {
    if (selectedDiseases.includes(cond)) {
      setSelectedDiseases(prev => prev.filter(c => c !== cond));
    } else {
      setSelectedDiseases(prev => [...prev, cond]);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(null);
    setError(null);
    try {
      await updateProfile({
        age: parseInt(age),
        gender,
        weight: parseFloat(weight),
        height: parseFloat(height),
        activityLevel: activity,
        goal,
        dietPreference: diet,
        diseaseConditions: selectedDiseases
      });
      setSuccess('Your profile and health parameters have been successfully updated!');
      setTimeout(() => setSuccess(null), 4000);
    } catch (err) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header Banner */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-extrabold font-display text-slate-800 dark:text-white">User Health Profile</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage your personal metrics, dietary selections and pre-existing medical conditions.
          </p>
        </div>
        <button
          onClick={logout}
          className="px-4 py-2 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white font-semibold text-xs rounded-xl transition-all flex items-center gap-1.5 shadow-sm"
        >
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </div>

      {success && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs flex gap-2 animate-bounce">
          <ShieldCheck className="w-5 h-5 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs flex gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Core parameters */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl space-y-6">
            <h3 className="text-base font-bold font-display text-slate-800 dark:text-white border-b border-slate-200/50 dark:border-slate-800/50 pb-3 flex items-center gap-2">
              <User className="w-5 h-5 text-emerald-500" /> Account & Physical Metrics
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Display Name</label>
                <input
                  type="text"
                  value={name}
                  disabled
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-100/50 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-800/60 text-slate-400 text-sm focus:outline-none cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Email Address</label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-100/50 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-800/60 text-slate-400 text-sm focus:outline-none cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Age</label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-100/50 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-800/60 text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-100/50 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-800/60 text-sm focus:outline-none focus:border-emerald-500"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Weight (kg)</label>
                <input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-100/50 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-800/60 text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Height (cm)</label>
                <input
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-100/50 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-800/60 text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Activity Level</label>
                <select
                  value={activity}
                  onChange={(e) => setActivity(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-100/50 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-800/60 text-sm focus:outline-none focus:border-emerald-500"
                >
                  <option value="Sedentary">Sedentary</option>
                  <option value="Light">Light</option>
                  <option value="Moderate">Moderate</option>
                  <option value="Active">Active</option>
                  <option value="Very Active">Very Active</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Primary Goal</label>
                <select
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-100/50 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-800/60 text-sm focus:outline-none focus:border-emerald-500"
                >
                  <option value="Weight Loss">Weight Loss</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Weight Gain">Weight Gain</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Dietary Preference</label>
                <select
                  value={diet}
                  onChange={(e) => setDiet(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-100/50 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-800/60 text-sm focus:outline-none focus:border-emerald-500"
                >
                  {DIET_PREFS.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200/50 dark:border-slate-800/50 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 active:scale-95 disabled:opacity-50 text-white rounded-xl font-semibold text-xs shadow-lg shadow-emerald-500/10 flex items-center gap-1.5 transition-all"
              >
                {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                Save Changes & Recalculate
              </button>
            </div>
          </div>
        </div>

        {/* Medical and conditions right side cards */}
        <div className="lg:col-span-1 space-y-6">
          
          <div className="glass-panel p-6 rounded-3xl space-y-5">
            <h3 className="text-base font-bold font-display text-slate-800 dark:text-white border-b border-slate-200/50 dark:border-slate-800/50 pb-3 flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-500" /> Medical Profile
            </h3>

            <p className="text-[10px] text-slate-400 leading-normal">
              Select any chronic or specific physiological health conditions you manage. Our AI assistant references this metadata to fine-tune answers and customize dietary advice.
            </p>

            <div className="space-y-3">
              {MEDICAL_OPTIONS.map((opt) => {
                const isSelected = selectedDiseases.includes(opt);
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => toggleDisease(opt)}
                    className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all ${isSelected ? 'bg-emerald-500/5 border-emerald-500 text-emerald-600 dark:text-emerald-400' : 'bg-slate-100/50 dark:bg-slate-800/40 border-slate-200/50 dark:border-slate-800/60 text-slate-600 dark:text-slate-300'}`}
                  >
                    <span className="text-xs font-semibold">{opt}</span>
                    {isSelected ? <CheckSquare className="w-4.5 h-4.5 text-emerald-500" /> : <Square className="w-4.5 h-4.5 text-slate-400" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sync warning panel */}
          <div className="p-5 rounded-2xl bg-amber-500/5 border border-amber-500/10 text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed flex gap-2.5">
            <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 self-start" />
            <div>
              <span className="font-semibold text-slate-800 dark:text-slate-200">Active Syncing Active:</span>
              <p className="mt-0.5">Changing your height, weight, gender, or age will trigger an automated recalculation of your Body Mass Index (BMI) and basal metabolic rate. Make sure to keep these up to date weekly to keep macro parameters synchronized.</p>
            </div>
          </div>

        </div>

      </form>
    </div>
  );
}
