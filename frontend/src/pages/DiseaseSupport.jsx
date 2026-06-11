import React, { useState } from 'react';
import { ShieldAlert, CheckCircle, Ban, BookOpen, Heart, Activity, Apple, Zap, RefreshCw, Star } from 'lucide-react';

const CONDITIONS = [
  {
    id: 'diabetes',
    name: 'Diabetes / Sugar Management',
    icon: Activity,
    color: 'text-rose-500 bg-rose-500/10 border-rose-500/20',
    description: 'Stabilize insulin responses and manage sudden blood sugar spikes.',
    foodsToEat: ['Methi (Fenugreek) seeds', 'Leafy greens (Spinach, Kale)', 'Steel-cut oats & Barley', 'Quinoa & Brown rice', 'Cinnamon', 'Low-fat Paneer & Tofu'],
    foodsToAvoid: ['Refined white flour (Maida)', 'Potatoes & Sweet potatoes', 'Sugary fruit juices', 'Sweets & White sugar', 'Highly polished white rice', 'Aerated soft drinks'],
    samplePlan: {
      breakfast: 'Muns dal cheela with spinach or sugar-free vegetable oats.',
      lunch: '1 Multigrain chapati + 1 cup yellow lentil + massive leafy salad.',
      snack: 'Roasted bengal gram (chana) + green tea without sugar.',
      dinner: 'Sautéed/grilled paneer/chicken with broccoli, baby corn & bell peppers.'
    },
    lifestyle: ['Walk for 10-15 minutes immediately following meals.', 'Keep stress low as cortisol triggers blood sugar spikes.', 'Measure glucose regularly.']
  },
  {
    id: 'bp',
    name: 'High Blood Pressure',
    icon: ShieldAlert,
    color: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
    description: 'DASH-inspired guidelines to regulate sodium and protect arterial tissue.',
    foodsToEat: ['Bananas (rich in Potassium)', 'Leafy spinach & Broccoli', 'Plain Greek yogurt', 'Unsalted raw almonds', 'Garlic (dilates vessels)', 'Coconut water'],
    foodsToAvoid: ['Table salt (limit < 1 tsp/day)', 'Pickles & Papads', 'Processed cheese & Butter', 'Soy sauce & Ketchup', 'Deep-fried snacks', 'Preserved canned foods'],
    samplePlan: {
      breakfast: 'Banana oatmeal smoothie topped with unsalted chia seeds.',
      lunch: 'Stir-fried vegetables with low salt + brown rice + Greek yogurt.',
      snack: 'Handful of unsalted roasted foxnuts (Makhana) + black tea.',
      dinner: 'Lemon-herb baked tofu or lean fish + steamed asparagus.'
    },
    lifestyle: ['Reduce sodium intake below 2000mg/day.', 'Perform moderate aerobic cardiovascular exercise (30 mins daily).', 'Maintain adequate hydration.']
  },
  {
    id: 'cholesterol',
    name: 'High Cholesterol',
    icon: Apple,
    color: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
    description: 'Reduce Low-Density Lipoprotein (LDL) and improve heart health indices.',
    foodsToEat: ['Soluble fibers (Oats, Barley)', 'Omega-3 oils (Walnuts, Flaxseeds)', 'Legumes & Lentils', 'Avocados & Olive oil', 'Apples & Pears (Pectin rich)', 'Garlic & Onions'],
    foodsToAvoid: ['Industrial trans-fats (Margerine)', 'Deep-fried street foods', 'Fatty cuts of red meat', 'Full-fat dairy cream & Butter', 'Commercial baked goods', 'Palm oil'],
    samplePlan: {
      breakfast: 'Oatmeal cooked in almond milk + crushed walnuts + blueberries.',
      lunch: 'Quinoa chickpea Mediterranean salad dressed in olive oil & lemon juice.',
      snack: 'Apple slices + 1 tablespoon raw organic almond butter.',
      dinner: 'Grilled salmon or lentils + steamed zucchini and cauliflower.'
    },
    lifestyle: ['Increase active soluble fibers in meals to bind cholesterol in digestion.', 'Avoid smoking as it directly oxidizes LDL.', 'Engage in active physical workouts.']
  },
  {
    id: 'pcos',
    name: 'PCOS / PCOD Care',
    icon: Zap,
    color: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
    description: 'Regulate insulin resistance, manage androgen hormones, and fight inflammation.',
    foodsToEat: ['High-fiber foods (Broccoli, Lentils)', 'Anti-inflammatory spices (Turmeric, Ginger)', 'Avocados & walnuts', 'Steamed fish & Lean meats', 'Berries', 'Pumpkin & Sunflower seeds'],
    foodsToAvoid: ['Refined sugar & Candy', 'Refined gluten products (white bread)', 'Commercial dairy (if sensitive)', 'Processed snacks', 'Excessive caffeine', 'Soy isolates'],
    samplePlan: {
      breakfast: 'Chia seed pudding made with coconut milk and topped with mixed seeds.',
      lunch: 'Sprouted moong salad + boiled egg/tofu + steamed leafy vegetables.',
      snack: 'Handful of walnuts and pumpkin seeds + Spearmint tea.',
      dinner: 'Grilled chicken or Paneer tikka + massive bowl of steamed vegetables.'
    },
    lifestyle: ['Drink Spearmint tea daily to reduce high androgens.', 'Integrate strength/weight resistance training to restore insulin health.', 'Maintain consistent sleep cycles.']
  },
  {
    id: 'thyroid',
    name: 'Thyroid Support',
    icon: Star,
    color: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20',
    description: 'Optimize endocrine activity for Hypothyroidism and related conditions.',
    foodsToEat: ['Iodized salt', 'Brazil nuts (extraordinarily rich in Selenium)', 'Eggs (containing tyrosine)', 'Steamed fish & shellfish', 'Pumpkin seeds (rich in Zinc)', 'Seaweed / Kelp'],
    foodsToAvoid: ['Raw cruciferous vegetables (Cabbage, Cauliflower, Kale)', 'Soy-based supplements in excess', 'Highly refined wheat flour', 'Gluten (if sensitive)', 'Tap water with high chlorine', 'Uncooked soy flour'],
    samplePlan: {
      breakfast: 'Scrambled whole eggs + spinach + 1 Brazil nut.',
      lunch: 'Fish curry or paneer curry + portioned brown rice + salad.',
      snack: 'Warm green tea + handful of roasted pumpkin seeds.',
      dinner: 'Thoroughly cooked stir-fry broccoli (cooking deactivates goitrogens) + grilled paneer.'
    },
    lifestyle: ['Take thyroid hormone replacement on an empty stomach first thing in the morning.', 'Cook goitrogenic vegetables thoroughly to render them safe.', 'Check levels quarterly.']
  },
  {
    id: 'heart',
    name: 'Heart Health',
    icon: Heart,
    color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
    description: 'Vascular anti-inflammatory diet protecting coronary circulation.',
    foodsToEat: ['Berries (strawberries, blueberries)', 'Walnuts & Flaxseeds', 'Dark chocolate (75%+)', 'Tomatoes (rich in Lycopene)', 'Olive oil', 'Oily fish (Mackerel, Salmon)'],
    foodsToAvoid: ['Processed deli meats (Bacon, Salami)', 'Margarine & shortening', 'High fructose corn syrups', 'Deep-fried snacks', 'Heavy hydrogenated oils', 'High salt meals'],
    samplePlan: {
      breakfast: 'Overnight oats with chia seeds, soy milk, dark cocoa flakes & raspberries.',
      lunch: 'Lentil soup + brown rice + baked vegetables in olive oil.',
      snack: '1 cup hibiscus tea + handful of mixed walnuts and almonds.',
      dinner: 'Grilled cod fish or baked tempeh + Mediterranean garden salad.'
    },
    lifestyle: ['Maintain an active lifestyle aiming for 10,000 steps daily.', 'Practice deep breathing or meditation for 15 minutes to reduce arterial stress.', 'Limit alcohol.']
  }
];

export default function DiseaseSupport() {
  const [selectedCondition, setSelectedCondition] = useState(CONDITIONS[0]);

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-extrabold font-display text-slate-800 dark:text-white">Disease-Based Nutrition Center</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Access specific dietary guidelines, sample meal plans, and positive lifestyle adjustments for chronic health conditions.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Selectable Conditions Cards */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest px-1">Select Condition</h3>
          <div className="space-y-3">
            {CONDITIONS.map(c => {
              const Icon = c.icon;
              const isSelected = selectedCondition.id === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => setSelectedCondition(c)}
                  className={`w-full p-4 rounded-2xl border text-left transition-all hover:scale-[1.01] flex items-center gap-3.5 ${isSelected ? 'bg-white dark:bg-slate-900 border-emerald-500 shadow-md shadow-emerald-500/5 brand-glow' : 'bg-white/40 dark:bg-slate-900/30 border-slate-200/50 dark:border-slate-800/40 hover:bg-white dark:hover:bg-slate-900/50'}`}
                >
                  <div className={`p-2.5 rounded-xl border shrink-0 ${c.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-slate-800 dark:text-white">{c.name}</h4>
                    <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">{c.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Side: Tabular displays containing Foods to Eat/Avoid, Meal Plans, etc. */}
        <div className="lg:col-span-2 glass-panel p-6 sm:p-8 rounded-3xl space-y-8 animate-slide-up">
          
          {/* Header Condition Details */}
          <div className="border-b border-slate-200/50 dark:border-slate-800/50 pb-5">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-2xl border ${selectedCondition.color}`}>
                {React.createElement(selectedCondition.icon, { className: 'w-6 h-6' })}
              </div>
              <div>
                <h3 className="text-xl font-bold font-display text-slate-800 dark:text-white">{selectedCondition.name}</h3>
                <p className="text-xs text-slate-400 mt-0.5">{selectedCondition.description}</p>
              </div>
            </div>
          </div>

          {/* Foods list grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            
            {/* Foods to Eat */}
            <div className="p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 space-y-4">
              <h4 className="font-bold text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 uppercase tracking-wider">
                <CheckCircle className="w-4.5 h-4.5" /> Foods to Eat (Highly Recommended)
              </h4>
              <ul className="space-y-2.5">
                {selectedCondition.foodsToEat.map((food, i) => (
                  <li key={i} className="text-xs text-slate-600 dark:text-slate-300 flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-1.5 shrink-0"></span>
                    <span>{food}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Foods to Avoid */}
            <div className="p-5 rounded-2xl bg-rose-500/5 border border-rose-500/10 space-y-4">
              <h4 className="font-bold text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1.5 uppercase tracking-wider">
                <Ban className="w-4.5 h-4.5" /> Foods to Avoid (Highly Restricted)
              </h4>
              <ul className="space-y-2.5">
                {selectedCondition.foodsToAvoid.map((food, i) => (
                  <li key={i} className="text-xs text-slate-600 dark:text-slate-300 flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-rose-500 rounded-full mt-1.5 shrink-0"></span>
                    <span>{food}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>

          {/* Sample meal plan */}
          <div className="space-y-4">
            <h4 className="font-bold text-xs text-slate-700 dark:text-slate-200 flex items-center gap-1.5 uppercase tracking-wider">
              <BookOpen className="w-4.5 h-4.5 text-emerald-500" /> Sample Daily Nutrition Plan
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-100/50 dark:bg-slate-900/30 border border-slate-200/40 dark:border-slate-800/40 text-xs">
                <span className="font-bold text-[10px] uppercase tracking-wider text-slate-400">🍳 Breakfast</span>
                <p className="text-slate-600 dark:text-slate-300 mt-1">{selectedCondition.samplePlan.breakfast}</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-100/50 dark:bg-slate-900/30 border border-slate-200/40 dark:border-slate-800/40 text-xs">
                <span className="font-bold text-[10px] uppercase tracking-wider text-slate-400">🥗 Lunch</span>
                <p className="text-slate-600 dark:text-slate-300 mt-1">{selectedCondition.samplePlan.lunch}</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-100/50 dark:bg-slate-900/30 border border-slate-200/40 dark:border-slate-800/40 text-xs">
                <span className="font-bold text-[10px] uppercase tracking-wider text-slate-400">☕ Evening Snack</span>
                <p className="text-slate-600 dark:text-slate-300 mt-1">{selectedCondition.samplePlan.snack}</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-100/50 dark:bg-slate-900/30 border border-slate-200/40 dark:border-slate-800/40 text-xs">
                <span className="font-bold text-[10px] uppercase tracking-wider text-slate-400">🍲 Dinner</span>
                <p className="text-slate-600 dark:text-slate-300 mt-1">{selectedCondition.samplePlan.dinner}</p>
              </div>
            </div>
          </div>

          {/* Lifestyle tips */}
          <div className="p-5 rounded-2xl bg-slate-100/40 dark:bg-slate-900/10 border border-slate-200/30 dark:border-slate-800/20 space-y-4">
            <h4 className="font-bold text-xs text-slate-700 dark:text-slate-200 flex items-center gap-1.5 uppercase tracking-wider">
              <Zap className="w-4.5 h-4.5 text-emerald-500" /> Lifestyle Adjustments
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {selectedCondition.lifestyle.map((tip, i) => (
                <div key={i} className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/60 shadow-sm text-xs flex gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0 text-[10px] font-bold">{i+1}</span>
                  <span className="text-slate-600 dark:text-slate-300 leading-normal">{tip}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Professional Medical warning notice */}
          <div className="p-4 rounded-xl bg-slate-100/40 dark:bg-slate-900/30 text-[10px] text-slate-400 leading-normal border border-slate-200/20 text-center">
            ⚠️ **Medical Disclaimer:** The dietary guides provided here are for general informational guidance only and are not meant to substitute for professional medical recommendations. Always coordinate major meal modifications with your personal cardiologist, endocrinologist or certified physician.
          </div>

        </div>

      </div>
    </div>
  );
}
