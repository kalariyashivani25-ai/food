import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { Calculator, Flame, Dumbbell, Compass, RefreshCw, Sparkles, TrendingDown, TrendingUp, HelpCircle } from 'lucide-react';

export default function Calculators() {
  const { user, updateProfile } = useAuth();
  
  // Set local state initialized with user profile metrics
  const [weight, setWeight] = useState(user?.profile?.weight || 70);
  const [height, setHeight] = useState(user?.profile?.height || 175);
  const [age, setAge] = useState(user?.profile?.age || 28);
  const [gender, setGender] = useState(user?.profile?.gender || 'Other');
  const [activity, setActivity] = useState(user?.profile?.activityLevel || 'Moderate');
  const [goal, setGoal] = useState(user?.profile?.goal || 'Maintenance');

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);

  // Dynamic calculations
  // BMI = weight / (height/100)^2
  const heightInMeters = height / 100;
  const bmi = parseFloat((weight / (heightInMeters * heightInMeters)).toFixed(2));

  // Determine BMI category
  let bmiCategory = 'Normal';
  let bmiColor = 'text-emerald-500';
  let bmiBg = 'bg-emerald-500/10';
  let bmiRange = '18.5 - 24.9';

  if (bmi < 18.5) {
    bmiCategory = 'Underweight';
    bmiColor = 'text-blue-500';
    bmiBg = 'bg-blue-500/10';
    bmiRange = '< 18.5';
  } else if (bmi >= 25 && bmi < 29.9) {
    bmiCategory = 'Overweight';
    bmiColor = 'text-amber-500';
    bmiBg = 'bg-amber-500/10';
    bmiRange = '25.0 - 29.9';
  } else if (bmi >= 30) {
    bmiCategory = 'Obese';
    bmiColor = 'text-rose-500';
    bmiBg = 'bg-rose-500/10';
    bmiRange = '≥ 30.0';
  }

  // BMR (Mifflin-St Jeor)
  let bmr = 10 * weight + 6.25 * height - 5 * age;
  if (gender === 'Male') bmr += 5;
  else if (gender === 'Female') bmr -= 161;
  else bmr -= 78;

  // Active Multipliers
  let multiplier = 1.2; // Sedentary
  if (activity === 'Light') multiplier = 1.375;
  if (activity === 'Moderate') multiplier = 1.55;
  if (activity === 'Active') multiplier = 1.725;
  if (activity === 'Very Active') multiplier = 1.9;

  const tdee = Math.round(bmr * multiplier);

  // Targets depending on goals
  const targetCalories = {
    'Weight Loss': Math.max(1200, tdee - 500),
    'Weight Gain': tdee + 500,
    'Maintenance': tdee
  };

  const activeTarget = targetCalories[goal];

  // Macronutrient breakdowns (Standard Balanced ratio: 30% Protein, 45% Carbs, 25% Fat)
  // 1g Protein = 4 kcal, 1g Carb = 4 kcal, 1g Fat = 9 kcal
  const proteinKcal = activeTarget * 0.30;
  const carbKcal = activeTarget * 0.45;
  const fatKcal = activeTarget * 0.25;

  const proteinGrams = Math.round(proteinKcal / 4);
  const carbGrams = Math.round(carbKcal / 4);
  const fatGrams = Math.round(fatKcal / 9);

  const handleSaveToProfile = async () => {
    setSaving(true);
    setSuccessMsg(null);
    try {
      await updateProfile({
        weight: parseFloat(weight),
        height: parseFloat(height),
        age: parseInt(age),
        gender,
        activityLevel: activity,
        goal
      });
      setSuccessMsg('Your physical health profile has been synchronized successfully!');
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold font-display text-slate-800 dark:text-white">Fitness & Calorie Matrix</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Calculate your precise biological index, metabolic requirements, and customize dietary goals.
          </p>
        </div>
        <button
          onClick={handleSaveToProfile}
          disabled={saving}
          className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white font-semibold text-xs rounded-xl shadow-lg shadow-emerald-500/10 flex items-center gap-1.5 transition-all self-start md:self-auto"
        >
          {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Calculator className="w-3.5 h-3.5" />}
          Sync to My Profile
        </button>
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs flex gap-2 animate-bounce">
          <Sparkles className="w-4 h-4" />
          <span>{successMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Parameters Form */}
        <div className="lg:col-span-1 glass-panel p-6 rounded-3xl space-y-6">
          <h3 className="text-lg font-bold font-display text-slate-800 dark:text-white border-b border-slate-200/50 dark:border-slate-800/50 pb-3 flex items-center gap-2">
            <Compass className="w-5 h-5 text-emerald-500" /> Biometrics Input
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Gender</label>
              <div className="grid grid-cols-3 gap-2">
                {['Male', 'Female', 'Other'].map(g => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGender(g)}
                    className={`py-2 rounded-xl text-xs font-semibold transition-all border ${gender === g ? 'bg-emerald-500 border-emerald-500 text-white shadow-md' : 'bg-slate-100/50 dark:bg-slate-800/40 border-slate-200/50 dark:border-slate-800/60 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Age (years)</label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-100/50 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-800/60 focus:outline-none focus:border-emerald-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Height (cm)</label>
                <input
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-100/50 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-800/60 focus:outline-none focus:border-emerald-500 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Weight (kg)</label>
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-100/50 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-800/60 focus:outline-none focus:border-emerald-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Physical Activity</label>
              <select
                value={activity}
                onChange={(e) => setActivity(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-100/50 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-800/60 focus:outline-none focus:border-emerald-500 text-sm"
              >
                <option value="Sedentary">Sedentary (Little/no exercise)</option>
                <option value="Light">Light (Exercise 1-3 days/wk)</option>
                <option value="Moderate">Moderate (Exercise 3-5 days/wk)</option>
                <option value="Active">Active (Exercise 6-7 days/wk)</option>
                <option value="Very Active">Very Active (Heavy training twice daily)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Dietary Objective</label>
              <div className="space-y-2">
                {[
                  { value: 'Weight Loss', label: 'Weight Loss (500 kcal Deficit)', icon: TrendingDown, desc: 'Gradual, healthy fat reduction' },
                  { value: 'Maintenance', label: 'Maintenance (Caloric Balance)', icon: HelpCircle, desc: 'Maintain mass and fitness levels' },
                  { value: 'Weight Gain', label: 'Weight Gain (500 kcal Surplus)', icon: TrendingUp, desc: 'Support muscle hypertrophy' }
                ].map(obj => {
                  const Icon = obj.icon;
                  return (
                    <button
                      key={obj.value}
                      type="button"
                      onClick={() => setGoal(obj.value)}
                      className={`w-full p-3.5 rounded-xl border text-left flex items-start gap-3 transition-all ${goal === obj.value ? 'bg-emerald-500/10 border-emerald-500' : 'bg-slate-100/50 dark:bg-slate-800/40 border-slate-200/50 dark:border-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                    >
                      <div className={`p-1.5 rounded-lg ${goal === obj.value ? 'bg-emerald-500 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <p className={`font-semibold text-xs ${goal === obj.value ? 'text-emerald-500 dark:text-emerald-400' : 'text-slate-800 dark:text-slate-200'}`}>{obj.label}</p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-400 mt-0.5">{obj.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Scoreboards and Progress Metres */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Top Scoreboard: BMI & BMR */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            
            {/* BMI Display Card */}
            <div className="glass-panel p-6 rounded-3xl flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-glow-blue-radial pointer-events-none"></div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Body Mass Index</span>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-4xl font-extrabold font-display text-slate-800 dark:text-white">{bmi}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${bmiBg} ${bmiColor}`}>{bmiCategory}</span>
                </div>
              </div>
              
              <div className="mt-8 pt-4 border-t border-slate-200/50 dark:border-slate-800/50">
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Normal BMI Range</span>
                  <span className="font-semibold text-slate-600 dark:text-slate-300">18.5 - 24.9 kg/m²</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden flex">
                  <div className="h-full bg-blue-400" style={{ width: '18.5%' }}></div>
                  <div className="h-full bg-emerald-400" style={{ width: '35%' }}></div>
                  <div className="h-full bg-amber-400" style={{ width: '25%' }}></div>
                  <div className="h-full bg-rose-400" style={{ width: '21.5%' }}></div>
                </div>
              </div>
            </div>

            {/* Calories Card */}
            <div className="glass-panel p-6 rounded-3xl flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-glow-radial pointer-events-none"></div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Target Daily Intake</span>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-4xl font-extrabold font-display text-emerald-500">{activeTarget}</span>
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Kcal</span>
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-slate-200/50 dark:border-slate-800/50 space-y-1.5 text-xs text-slate-400">
                <div className="flex justify-between">
                  <span>Basal Metabolic Rate (BMR)</span>
                  <span className="font-semibold text-slate-600 dark:text-slate-300">{Math.round(bmr)} kcal</span>
                </div>
                <div className="flex justify-between">
                  <span>Daily Expenditure (TDEE)</span>
                  <span className="font-semibold text-slate-600 dark:text-slate-300">{tdee} kcal</span>
                </div>
              </div>
            </div>

          </div>

          {/* Bottom Card: Macronutrients Breakdown */}
          <div className="glass-panel p-6 rounded-3xl relative overflow-hidden">
            <div className="absolute bottom-0 right-0 w-36 h-36 bg-glow-rose-radial pointer-events-none"></div>
            
            <h4 className="text-base font-bold font-display text-slate-800 dark:text-white mb-6 flex items-center gap-2">
              <Flame className="w-5 h-5 text-emerald-500" /> Macronutrient Fuel Ratios
            </h4>

            <div className="space-y-5">
              
              {/* Protein indicator */}
              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-200 mb-2">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Protein (30% - Building Blocks)
                  </span>
                  <span>{proteinGrams}g / {Math.round(proteinKcal)} kcal</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-800/80 h-3 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: '30%' }}></div>
                </div>
              </div>

              {/* Carbohydrates indicator */}
              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-200 mb-2">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span> Carbohydrates (45% - Main Fuel)
                  </span>
                  <span>{carbGrams}g / {Math.round(carbKcal)} kcal</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-800/80 h-3 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-500 rounded-full" style={{ width: '45%' }}></div>
                </div>
              </div>

              {/* Fats indicator */}
              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-200 mb-2">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Fats (25% - Vital Endocrine/Hormonal support)
                  </span>
                  <span>{fatGrams}g / {Math.round(fatKcal)} kcal</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-800/80 h-3 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: '25%' }}></div>
                </div>
              </div>

            </div>

            {/* Custom Personalized Meal Advice summary based on choice */}
            <div className="mt-8 p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 text-xs text-slate-500 dark:text-slate-400 flex gap-3 leading-relaxed">
              <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-xl shrink-0 self-start">
                <Dumbbell className="w-5 h-5" />
              </div>
              <div>
                <span className="font-semibold text-slate-800 dark:text-slate-200">Personalized Caloric Recommendation:</span>
                {goal === 'Weight Loss' && (
                  <p className="mt-1">We recommend a daily deficit of 500 kcal to promote safe weight loss (~0.5kg per week). Prioritize fibrous green vegetables and lean protein (1.6g per kg of body mass) to prevent muscle wastage during fat breakdown.</p>
                )}
                {goal === 'Weight Gain' && (
                  <p className="mt-1">We recommend a daily surplus of 500 kcal to facilitate anabolic muscle building. Aim for healthy high-density fats (avocados, peanut butter, whole eggs) and perform compound weight training 3-4 times a week to guide surplus calories into muscle mass.</p>
                )}
                {goal === 'Maintenance' && (
                  <p className="mt-1">Maintain active caloric equilibrium. Balance input calories with output physical training, supporting metabolic stamina and athletic endurance. Focus on high-quality organic micronutrient variety.</p>
                )}
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
