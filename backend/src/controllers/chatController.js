import { isFallbackMode, localDB } from '../config/db.js';
import Chat from '../models/Chat.js';

// Native fetch helper to query Gemini API directly
const queryGeminiAPI = async (apiKey, messages, systemPrompt) => {
  try {
    const contents = [
      {
        role: 'user',
        parts: [{ text: systemPrompt }]
      },
      {
        role: 'model',
        parts: [{ text: "Understood. I will act as NutriAI, your advanced healthcare, fitness, and nutrition assistant. I will classify all user questions into Category A (Weight Gain), Category B (Weight Loss), Category C (Disease Support), Category D (Food Analysis), or Category E (Recipes), and generate category-specific responses without repeating templates." }]
      }
    ];

    // Append the history messages
    messages.forEach(msg => {
      contents.push({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      });
    });

    const requestBody = {
      contents,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1500,
      }
    };

    // Use stable production v1 endpoint
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gemini API Error (${response.status}): ${errText}`);
    }

    const data = await response.json();
    const assistantText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!assistantText) {
      throw new Error('Invalid response structure received from Gemini API');
    }

    return assistantText;
  } catch (error) {
    console.error('Gemini API fetch failed, using simulation instead:', error.message);
    return null;
  }
};

// Dynamic Offline Nutrition Engine (Classifies user intent and builds category-specific responses)
const generateSimulatedAIResponse = (userPrompt) => {
  if (userPrompt.includes('[HIDDEN_PROMPT]')) {
    const nameMatch = userPrompt.match(/Name:\s([^,]+),/);
    const calMatch = userPrompt.match(/Calories:\s([0-9.]+)\skcal,/);
    const pMatch = userPrompt.match(/P:\s([0-9.]+)g,/);
    const fMatch = userPrompt.match(/F:\s([0-9.]+)g,/);
    const cMatch = userPrompt.match(/C:\s([0-9.]+)g\./);
    const assessMatch = userPrompt.match(/Assessment:\s"([^"]+)"\./);
    const improveMatch = userPrompt.match(/Improvements:\s"([^"]+)"\./);

    const mealName = nameMatch ? nameMatch[1] : "Your Meal";
    const cal = calMatch ? calMatch[1] : "0";
    const p = pMatch ? pMatch[1] : "0";
    const f = fMatch ? fMatch[1] : "0";
    const c = cMatch ? cMatch[1] : "0";
    const assess = assessMatch ? assessMatch[1] : "";
    const improve = improveMatch ? improveMatch[1] : "";

    return `### 🍱 Image Analysis: ${mealName}

Here is the professional macronutrient and metabolic analysis of your scanned meal:

#### 📊 Macronutrient Analysis:
* 🔥 **Calories:** ~${cal} kcal
* 🥚 **Protein:** ${p}g
* 🥑 **Fat:** ${f}g
* 🍞 **Carbohydrates:** ${c}g

#### 🟢 Assessment:
* ${assess}

#### 🔄 Actionable Improvements:
* ${improve}`;
  }

  const query = userPrompt.toLowerCase();
  
  // Detect language
  let lang = 'en';
  if (/[\u0900-\u097F]/.test(userPrompt) || query.includes('hindi') || query.includes('हिंदी') || query.includes('khana') || query.includes('fayde') || query.includes('nuksan') || query.includes('वजन')) {
    lang = 'hi';
  } else if (/[\u0A80-\u0AFF]/.test(userPrompt) || query.includes('gujarati') || query.includes('ગુજરાતી')) {
    lang = 'gu';
  }

  // --- Category Classification Step ---

  const weightGainTriggers = [
    'gain',
    'increase',
    'surplus',
    'mota',
    'vajan badha',
    'vajan kaise badhaye',
    'weight gain',
    'wazan badh',
    'wajan badhane',
    'mota karna',
    'gain weight'
  ];

  const weightLossTriggers = [
    'lose',
    'loss',
    'deficit',
    'fat loss',
    'vajan kam',
    'wajan kam',
    'wazan kam',
    'patla',
    'patla karna',
    'weight loss',
    'vajan kaise ghataye',
    'motapa ghatana',
    'wazan ghatana',
    'reduce weight',
    'kam karna'
  ];

  const findFirstMatchIndex = (triggers) => {
    return triggers.reduce((minIndex, trigger) => {
      const idx = query.indexOf(trigger);
      return idx >= 0 ? Math.min(minIndex, idx) : minIndex;
    }, Infinity);
  };

  const gainIndex = findFirstMatchIndex(weightGainTriggers);
  const lossIndex = findFirstMatchIndex(weightLossTriggers);
  const isWeightGain = gainIndex !== Infinity && (lossIndex === Infinity || gainIndex < lossIndex);
  const isWeightLoss = lossIndex !== Infinity && (gainIndex === Infinity || lossIndex <= gainIndex);

  // Category A: Weight Gain
  if (isWeightGain) {
    if (lang === 'hi') {
      return `### 🥩 श्रेणी A: स्वस्थ वजन बढ़ाने की रणनीति (Weight Gain Strategy)

वजन बढ़ाने के लिए आपको एक **स्वस्थ कैलोरी अधिशेष (Clean Caloric Surplus)** बनाए रखना होगा।

#### 📊 कैलोरी अधिशेष और प्रोटीन नियम:
* **कैलोरी लक्ष्य:** अपने सामान्य दैनिक उपभोग से **300 - 500 कैलोरी अधिक** खाएं।
* **प्रोटीन की मात्रा:** मांसपेशियों के निर्माण के लिए 1.6 ग्राम से 2.2 ग्राम प्रति किलोग्राम वजन लें।

#### 📅 दैनिक नमूना भोजन योजना (Sample Weight Gain Plan):
* **सुबह:** केला और पीनट बटर शेक (दूध + 2 केले + 2 चम्मच पीनट बटर + ओट्स)।
* **नाश्ता:** भरवां पनीर पराठा (हल्का घी) + दही या 3 पूरे अंडे।
* **दोपहर का भोजन:** 2 कटोरी दाल + 2 कटोरी चावल/रोटी + आलू-सब्जी + पनीर टिक्का।
* **शाम:** मुट्ठी भर बादाम, अखरोट और किशमिश + उबले चने।
* **रात का खाना:** पनीर करी या चिकन ब्रेस्ट + उबले आलू + हरी मटर।

#### 🏋️ व्यायाम और फिटनेस सुझाव (Exercise Suggestions):
1. **भारी वजन उठाना (Compound Lifting):** स्क्वैट्स, डेडलिफ्ट और बेंच प्रेस जैसे व्यायामों पर ध्यान दें।
2. **कार्डियो कम करें:** केवल 15-20 मिनट तक सीमित रखें ताकि एक्स्ट्रा कैलोरी बर्न न हो।

#### 💡 स्वस्थ वजन बढ़ाने के टिप्स:
* भोजन से ठीक पहले पानी पीने से बचें ताकि पेट भरा हुआ महसूस न हो।
* भोजन की आवृत्ति बढ़ाएं (दिन में 5-6 बार खाएं)।`;
    }

    return `### 🥩 Category A: Healthy Weight Gain Strategy

To increase body mass and support muscle hypertrophy, you must establish a structured **Caloric Surplus**.

#### 📊 Caloric Surplus & Protein recommendations:
* **Energy Target:** Consume **300 - 500 kcal above** your maintenance level (TDEE).
* **Protein Requirement:** Target **1.6g - 2.2g of protein per kg** of body weight daily.

#### 📅 Sample Caloric Surplus Meal Plan:
* **Breakfast:** 3 whole eggs scrambled + 2 slices of whole wheat toast + 1 glass whole milk (approx. 550 kcal).
* **Mid-Morning:** Weight gainer shake (1 cup milk, 1 scoop protein, 2 tbsp peanut butter, 1 banana, 50g oats) (approx. 700 kcal).
* **Lunch:** 150g grilled chicken/paneer + 2 cups brown rice + sautéed broccoli and beans (approx. 650 kcal).
* **Evening Snack:** 50g mixed nuts (Almonds, Cashews, Walnuts) + 1 cup Greek yogurt (approx. 350 kcal).
* **Dinner:** Baked salmon or tofu + sweet potato mash + asparagus sautéed in olive oil (approx. 500 kcal).

#### 🏋️ Resistance Training & Exercise Guidelines:
1. **Focus on Compound Movements:** Squats, deadlifts, overhead presses, and pull-ups to stimulate muscle growth.
2. **Limit Cardiovascular Output:** Limit high-intensity cardio to 15 mins to preserve your surplus.

#### 💡 Healthy Bulking Tips:
* Do not drink water 30 minutes prior to meals to maintain a high appetite.
* Eat calorie-dense, nutrient-rich foods (nut butters, avocados, whole eggs, nuts).`;
  }

  // Category B: Weight Loss
  if (isWeightLoss) {
    if (lang === 'hi') {
      return `### 🥗 श्रेणी B: वैज्ञानिक वजन घटाने की योजना (Weight Loss Strategy)

वजन घटाने का मूल आधार **कैलोरी घाटा (Calorie Deficit)** है, यानी खर्च की जाने वाली कैलोरी से कम कैलोरी का सेवन करना।

#### 📊 कैलोरी घाटा स्पष्टीकरण:
* **दैनिक कैलोरी लक्ष्य:** अपने रखरखाव (Maintenance) स्तर से **500 कैलोरी कम** खाएं।
* **अपेक्षित वजन कमी:** प्रति सप्ताह 0.5 किलोग्राम (सुरक्षित और स्वस्थ दर)।

#### 🟢 आहार सुझाव (Diet Suggestions):
* **फाइबर युक्त भोजन:** खीरा, टमाटर, पालक, ब्रोकली, पत्तागोभी।
* **लीन प्रोटीन:** पनीर (कम वसा), सोया चंक्स, उबले अंडे की सफेदी, मूंग दाल।
* **जटिल कार्ब्स:** ओट्स, दलिया, ब्राउन राइस (सीमित मात्रा में)।

#### 📅 दैनिक नमूना भोजन योजना (Sample Diet Chart):
* **सुबह जल्दी:** गुनगुना पानी + आधा नींबू + भीगी हुई चिया सीड्स।
* **नाश्ता:** ओट्स का उपमा या सब्जियां डाल कर बनाया गया चीला + हरी चाय।
* **दोपहर का भोजन:** 1 कटोरी दाल + 1 रागी की रोटी + बड़ी कटोरी सलाद।
* **शाम:** भुना हुआ मखाना या अंकुरित मूंग।
* **रात का खाना:** पनीर ग्रिल्ड सलाद या वेजीटेबल सूप (हल्का भोजन)।

#### 🏋️ व्यायाम और गतिविधि (Exercise Suggestions):
1. **दैनिक कदम:** प्रतिदिन 8,000 - 10,000 कदम चलें।
2. **स्ट्रेंथ ट्रेनिंग:** मांसपेशियों को बचाने और टोन करने के लिए सप्ताह में 3 बार हल्का वर्कआउट करें।`;
    }

    return `### 🥗 Category B: Scientific Weight Loss Strategy

To reduce body fat while preserving lean muscle mass, you must establish a consistent **Calorie Deficit**.

#### 📊 Calorie Deficit Matrix:
* **Energy Target:** Consume **500 kcal below** your maintenance calorie level (TDEE).
* **Expected Velocity:** Promotes a safe, sustainable fat loss rate of **0.5 kg (1 lb) per week**.

#### 🟢 Diet & Meal Planning Suggestions:
* **High-Volume / Low-Calorie Foods:** Leafy green vegetables (spinach, cabbage, lettuce), cucumbers, tomatoes.
* **Lean Proteins:** Egg whites, low-fat cottage cheese (paneer), organic tofu, lentils.
* **Complex Carbs:** Rolled oats, quinoa, sweet potatoes.

#### 📅 Sample Weight Loss Meal Plan (~1400 kcal):
* **Upon Waking:** 1 glass warm water + lemon juice + 1 tsp chia seeds.
* **Breakfast:** Egg white scramble (4 eggs) or Moong Dal Cheela with fresh mint chutney (approx. 250 kcal).
* **Lunch:** Grilled chicken breast/tofu (150g) + large green salad + 1 cup cooked quinoa (approx. 400 kcal).
* **Evening Snack:** 1 cup roasted foxnuts (Makhana) + black coffee or green tea (approx. 100 kcal).
* **Dinner:** Lentil soup with steamed broccoli, carrots, and mushrooms (approx. 300 kcal).

#### 🏋️ Cardiovascular & Strength Guidelines:
1. **Activity Baseline:** Aim for **8,000 - 10,000 steps daily** to boost metabolic rate.
2. **Resistance Work:** Lift weights or perform bodyweight exercises **3 times weekly** to preserve muscle.`;
  }

  // Category C: Disease Support Questions
  if (query.includes('diabet') || query.includes('sugar') || query.includes('bp') || query.includes('blood pressure') || query.includes('hypertension') || query.includes('cholesterol') || query.includes('pcos') || query.includes('pcod') || query.includes('thyroid') || query.includes('heart') || query.includes('cardio') || query.includes('disease') || query.includes('sugar me') || query.includes('sugar ka')) {
    
    // Sub-classification for specific diseases
    let diseaseName = "Diabetes";
    let eat = ["High fiber green vegetables", "Whole grains (Barley, Oats)", "Soluble fibers", "Fenugreek seeds"];
    let avoid = ["White flour (Maida)", "White sugar", "Sweet sodas", "Potatoes"];
    let menu = "Methi seeds in morning, multigrain rotis with green curries for lunch, grilled paneer/tofu for dinner.";
    let tips = ["Walk for 10 minutes post meals", "Check sugar levels weekly", "Reduce anxiety/cortisol"];

    if (query.includes('bp') || query.includes('blood pressure') || query.includes('hypertension')) {
      diseaseName = "High Blood Pressure";
      eat = ["Potassium rich foods (Bananas, Spinach)", "Coconut water", "Garlic", "Greek yogurt"];
      avoid = ["Excess salt (limit < 1 tsp/day)", "Pickles & papads", "Processed cheese & salted chips"];
      menu = "Banana oatmeal shake for breakfast, low sodium mixed vegetable curry for lunch, baked fish/tofu for dinner.";
      tips = ["Limit sodium to less than 2000mg/day", "Do 30 mins cardiovascular cardio daily", "Hydrate well"];
    } else if (query.includes('cholesterol')) {
      diseaseName = "High Cholesterol";
      eat = ["Soluble fiber (Oats, Barley)", "Walnuts & flaxseeds", "Avocados", "Olive oil"];
      avoid = ["Trans-fats (margarine)", "Deep fried snacks", "Full fat dairy", "Palm oil"];
      menu = "Oatmeal with walnuts for breakfast, Mediterranean quinoa salad for lunch, grilled salmon/lentils for dinner.";
      tips = ["Increase soluble fiber intake", "Quit smoking (prevents LDL oxidation)", "Do light cardio"];
    } else if (query.includes('pcos') || query.includes('pcod')) {
      diseaseName = "PCOD/PCOS";
      eat = ["Low-GI vegetables", "Moong dal", "Greek yogurt", "Berries & seeds"];
      avoid = ["Refined wheat (Maida)", "Sugary desserts", "Sweetened beverages", "Deep fried snacks"];
      menu = "Oats chilla with vegetables for breakfast, mixed vegetable salad with grilled paneer for lunch, quinoa pulao with spinach for dinner.";
      tips = ["Prioritize regular meal timing", "Keep hydrated and include 15 mins walking after meals", "Limit refined carbs and added sugars"];
    }

    if (lang === 'hi') {
      return `### 🩸 श्रेणी C: ${diseaseName} के लिए विशेष आहार सलाह

${diseaseName} को नियंत्रित और प्रबंधित करने के लिए यहाँ पोषण संबंधी निर्देश दिए गए हैं:

#### 🟢 क्या खाएं (Foods to Eat):
* ${eat.join('\n* ')}

#### 🔴 किनसे बचें (Foods to Avoid):
* ${avoid.join('\n* ')}

#### 📅 दैनिक भोजन सुझाव (Meal Suggestions):
* ${menu}

#### 🚶 जीवनशैली सुझाव (Lifestyle Tips):
* ${tips.join('\n* ')}`;
    }

    return `### 🩸 Category C: Dietary Protocol for ${diseaseName}

To manage and stabilize your bio-markers for ${diseaseName}, follow these nutritional guidelines:

#### 🟢 Foods to Eat (Highly Recommended):
* ${eat.join('\n* ')}

#### 🔴 Foods to Avoid (Highly Restricted):
* ${avoid.join('\n* ')}

#### 📅 Sample Daily Meal Suggestions:
* ${menu}

#### 🚶 Lifestyle Adjustments:
* ${tips.join('\n* ')}`;
  }

  // Category E: Recipe Questions
  if (query.includes('recipe') || query.includes('banane') || query.includes('kaise banaye') || query.includes('cook') || query.includes('ingredients') || query.includes('step')) {
    let recipeName = "High Protein Oats Cheela";
    let ingredients = ["50g Rolled Oats (blended)", "30g Gram Flour (Besan)", "1/2 chopped onion", "1/2 chopped tomato", "Green chilies & coriander", "1/4 tsp turmeric & salt"];
    let steps = [
      "Blend the oats into a fine powder and mix with gram flour in a bowl.",
      "Add water slowly to make a smooth pouring batter. Stir in the chopped vegetables and spices.",
      "Heat a non-stick pan, grease lightly with olive oil, and pour a ladle of batter.",
      "Cook both sides on medium heat until golden brown. Serve hot with mint chutney."
    ];
    let caloriesRecipe = 280;
    let macrosRecipe = "Protein: 12g | Carbs: 45g | Fat: 4g | Fiber: 6g";
    let altRecipe = "Add 50g grated paneer inside the cheela to boost protein to 21g.";

    if (query.includes('soup')) {
      recipeName = "Immunity Boosting Lentil Soup";
      ingredients = ["100g Red Lentils (Masoor dal)", "1 tsp grated ginger", "3 garlic cloves (crushed)", "1/2 chopped carrot", "Turmeric, black pepper & salt"];
      steps = [
        "Wash and soak lentils for 15 minutes.",
        "Sauté ginger, garlic, and carrots in a pan with 1 tsp olive oil.",
        "Add soaked lentils, turmeric, salt, and 3 cups of water. Pressure cook for 3 whistles.",
        "Blend slightly for a smooth consistency, season with black pepper and lemon juice."
      ];
      caloriesRecipe = 190;
      macrosRecipe = "Protein: 14g | Carbs: 28g | Fat: 1.5g | Fiber: 8g";
      altRecipe = "Stir in a handful of baby spinach at the end to add natural iron and folate.";
    }

    if (lang === 'hi') {
      return `### 🍳 श्रेणी E: ${recipeName} बनाने की स्वस्थ रेसिपी

यहाँ स्वादिष्ट और स्वस्थ **${recipeName}** बनाने की आसान विधि दी गई है:

#### 📝 आवश्यक सामग्री (Ingredients):
* ${ingredients.join('\n* ')}

#### 🥣 बनाने की चरण-दर-चरण विधि (Steps):
1. ${steps.join('\n2. ')}

#### 📊 पोषण संबंधी विश्लेषण (Nutrition Breakdown):
* **कैलोरी:** ~${caloriesRecipe} kcal
* **मैक्रोज़:** ${macrosRecipe}

#### 🔄 और अधिक स्वस्थ विकल्प (Alternatives):
* ${altRecipe}`;
    }

    return `### 🍳 Category E: Healthy Recipe for ${recipeName}

Here is the step-by-step culinary guide to preparing a nutritious **${recipeName}**:

#### 📝 Ingredients Required:
* ${ingredients.join('\n* ')}

#### 🥣 Cooking Steps:
1. ${steps.join('\n2. ')}

#### 📊 Estimated Nutrition Breakdown:
* 🔥 **Calories:** ~${caloriesRecipe} kcal
* 🥚 **Macronutrients:** ${macrosRecipe}

#### 🔄 Healthier Modifications:
* ${altRecipe}`;
  }

  // Category D: Food Analysis Questions (Default Food Parser if no other category matches)
  let food = "your requested food item";
  
  // Try to clean/extract the subject of their question (e.g. "Is Maggi good for health?" -> "Maggi")
  const foodTriggers = [
    /is\s+([a-zA-Z\s]+)\s+good/i,
    /about\s+([a-zA-Z\s]+)/i,
    /what\s+is\s+([a-zA-Z\s]+)/i,
    /diet\s+for\s+([a-zA-Z\s]+)/i,
    /benefits\s+of\s+([a-zA-Z\s]+)/i,
    /([a-zA-Z\s]+)\s+kaisa/i,
    /([a-zA-Z\s]+)\s+ke\s+fayde/i
  ];

  for (const regex of foodTriggers) {
    const match = query.match(regex);
    if (match && match[1]) {
      food = match[1].trim();
      break;
    }
  }

  // Capitalize food name
  food = food.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  // Default dynamic properties
  let caloriesFood = 150;
  let proteinFood = 5;
  let fatFood = 4;
  let carbsFood = 15;
  let healthyFood = true;
  let scoreFood = 85;
  let pros = "Rich source of energy, contains vital trace minerals and support easy digestion.";
  let cons = "High portion consumption can lead to excess carbohydrates intake.";

  // Overrides for common test foods
  const checkFood = food.toLowerCase();
  if (checkFood.includes('maggi') || checkFood.includes('noodle')) {
    food = "Maggi Noodles";
    caloriesFood = 380;
    proteinFood = 8;
    fatFood = 14;
    carbsFood = 56;
    healthyFood = false;
    scoreFood = 30;
    pros = "Extremely convenient to cook, cheap, tasty.";
    cons = "Refined flour base spikes insulin, very high sodium (~900mg) causes water retention and high blood pressure, zero dietary fiber.";
  } else if (checkFood.includes('pizza') || checkFood.includes('burger')) {
    food = "Fast Food Pizza";
    caloriesFood = 290;
    proteinFood = 12;
    fatFood = 13;
    carbsFood = 34;
    healthyFood = false;
    scoreFood = 35;
    pros = "Highly calorie dense, fast source of energy.";
    cons = "Refined wheat base, high saturated fats from cheese, high salt, contains trans-fats.";
  } else if (checkFood.includes('apple') || checkFood.includes('fruit')) {
    food = "Fresh Red Apple";
    caloriesFood = 95;
    proteinFood = 0.5;
    fatFood = 0.3;
    carbsFood = 25;
    healthyFood = true;
    scoreFood = 95;
    pros = "High dietary pectin fiber binds cholesterol, rich antioxidants like Quercetin fight inflammation, high water volume.";
    cons = "High natural fructose (limit in strict ketogenic diets).";
  } else if (checkFood.includes('egg')) {
    food = "Whole Egg";
    caloriesFood = 78;
    proteinFood = 6.3;
    fatFood = 5.3;
    carbsFood = 0.6;
    healthyFood = true;
    scoreFood = 98;
    pros = "Complete protein source with all essential amino acids, contains brain-supporting choline, high bioavailability.";
    cons = "Yolk is high in cholesterol (limit if on a severe low-lipid diet).";
  } else if (checkFood.includes('paneer') || checkFood.includes('cottage cheese')) {
    food = "Cottage Cheese (Paneer)";
    caloriesFood = 265;
    proteinFood = 18;
    fatFood = 20;
    carbsFood = 3.5;
    healthyFood = true;
    scoreFood = 88;
    pros = "Casein protein provides slow and steady release of amino acids, rich calcium.";
    cons = "Moderately high in saturated fat (choose low-fat versions if in a calorie deficit).";
  }

  if (lang === 'hi') {
    return `### 🍎 श्रेणी D: ${food} का स्वास्थ्य और पोषण विश्लेषण (Nutrition analysis)

यहाँ **${food}** का वैज्ञानिक और शारीरिक पोषण विवरण दिया गया है:

#### 📊 पोषण संबंधी मूल्य (प्रति 100 ग्राम):
* **कैलोरी:** ~${caloriesFood} kcal
* **प्रोटीन:** ${proteinFood}g
* **वसा (Fat):** ${fatFood}g
* **कार्बोहाइड्रेट:** ${carbsFood}g
* **हेल्थ इंडेक्स (Score):** ${scoreFood}/100 (${healthyFood ? 'स्वास्थ्यवर्धक भोजन' : 'सीमित मात्रा में खाएं'})

#### 🟢 सकारात्मक पहलू (Pros):
* ${pros}

#### 🔴 नकारात्मक पहलू (Cons):
* ${cons}

#### ⚖️ वजन प्रबंधन (Weight Management):
* **सुझाव:** ${healthyFood ? 'यह वजन घटाने और संतुलित आहार के लिए उत्तम है।' : 'वजन कम करने के दौरान इसके सेवन से बचना चाहिए। यह वजन बढ़ाने के लिए कैलोरी बढ़ाने में मदद कर सकता है।'}`;
  }

  return `### 🍎 Category D: Food Analysis of ${food}

Here is the professional macronutrient and metabolic analysis of **${food}**:

#### 📊 Macronutrient Analysis (per 100g serving):
* 🔥 **Calories:** ~${caloriesFood} kcal
* 🥚 **Protein:** ${proteinFood}g
* 🥑 **Fat:** ${fatFood}g
* 🍞 **Carbohydrates:** ${carbsFood}g
* 🏆 **Health Score:** **${scoreFood}/100** (${healthyFood ? 'Healthy Choice' : 'Unbalanced/Processed'})

#### 🟢 Advantages (Pros):
* ${pros}

#### 🔴 Disadvantages (Cons):
* ${cons}

#### ⚖️ Weight Management Suitability:
* **Recommendation:** ${healthyFood ? 'Excellent addition to clean eating and calorie-deficit plans.' : 'Avoid during fat loss or cutting phases; can be used in moderation for high-calorie bulking.'}`;
};

// @desc    Send a chat message and get AI answer
// @route   POST /api/chat/message
// @access  Private
export const sendMessage = async (req, res) => {
  const { chatId, message, imageUrl } = req.body;
  const userId = req.user.id;

  if (!message) {
    return res.status(400).json({ message: 'Message content is required' });
  }

  try {
    let chat;
    // Dynamic Prompting intent classifier guidelines
    const systemPrompt = `You are an advanced nutrition and healthcare assistant named NutriAI.
Determine user intent first.
Classify the question into:
Category A (Weight Gain)
Category B (Weight Loss)
Category C (Disease Support)
Category D (Food Analysis)
Category E (Recipes)

Answer ONLY according to detected intent.
Never reuse the same response template.
Do not automatically add medical warnings or disclaimers (e.g. "Medical Disclaimer", "Consult your physician", "This is educational only") unless there is an absolute medical emergency or high-risk dangerous symptoms present. Keep responses clean, concise, and natural.`;

    // 1. Fetch or create chat session
    if (isFallbackMode) {
      if (chatId) {
        chat = localDB.getChatById(chatId);
      }
      if (!chat) {
        chat = {
          _id: 'chat_' + Date.now(),
          userId,
          title: message.substring(0, 30) + '...',
          messages: [],
        };
      }
    } else {
      if (chatId) {
        chat = await Chat.findOne({ _id: chatId, userId });
      }
      if (!chat) {
        chat = new Chat({
          userId,
          title: message.substring(0, 30) + '...',
          messages: [],
        });
      }
    }

    // 2. Save the user's raw message in the local session history
    const userMessageObj = {
      role: 'user',
      content: message,
      image: imageUrl || null,
      timestamp: new Date()
    };
    chat.messages.push(userMessageObj);

    // 3. Obtain AI response (Gemini API or Local Simulator)
    let aiResponseText = null;
    const geminiKey = process.env.GEMINI_API_KEY;

    if (geminiKey) {
      // Dynamic Prompt wrapping for intent classification
      const formattedHistory = chat.messages.map((m, index) => {
        if (index === chat.messages.length - 1 && m.role === 'user') {
          return {
            role: 'user',
            content: `You are an advanced nutrition and healthcare assistant.

Determine user intent first.

Answer ONLY according to detected intent.

Never reuse the same response template.

User Question:
${m.content}`
          };
        }
        return {
          role: m.role,
          content: m.content
        };
      });

      aiResponseText = await queryGeminiAPI(geminiKey, formattedHistory, systemPrompt);
    }

    // Fallback/Simulation if API call fails or no API Key
    if (!aiResponseText) {
      aiResponseText = generateSimulatedAIResponse(message);
    }

    // 4. Append assistant response to history
    const assistantMessageObj = {
      role: 'assistant',
      content: aiResponseText,
      timestamp: new Date()
    };
    chat.messages.push(assistantMessageObj);

    // 5. Save chat session
    if (isFallbackMode) {
      localDB.saveChat(chat);
    } else {
      await chat.save();
    }

    res.json({
      chatId: chat._id,
      title: chat.title,
      messages: chat.messages,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

// @desc    Get user's chat history list
// @route   GET /api/chat/history
// @access  Private
export const getChatHistory = async (req, res) => {
  const userId = req.user.id;
  try {
    if (isFallbackMode) {
      const chats = localDB.getChats(userId).map(c => ({
        _id: c._id,
        title: c.title,
        updatedAt: c.updatedAt,
      })).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
      res.json(chats);
    } else {
      const chats = await Chat.find({ userId })
        .select('_id title updatedAt')
        .sort('-updatedAt');
      res.json(chats);
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching history: ' + error.message });
  }
};

// @desc    Get details of a specific chat
// @route   GET /api/chat/history/:id
// @access  Private
export const getChatDetails = async (req, res) => {
  const userId = req.user.id;
  const chatId = req.params.id;
  try {
    let chat;
    if (isFallbackMode) {
      chat = localDB.getChatById(chatId);
    } else {
      chat = await Chat.findOne({ _id: chatId, userId });
    }

    if (!chat) {
      return res.status(404).json({ message: 'Chat session not found' });
    }
    res.json(chat);
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

// @desc    Delete a specific chat
// @route   DELETE /api/chat/history/:id
// @access  Private
export const deleteChat = async (req, res) => {
  const userId = req.user.id;
  const chatId = req.params.id;
  try {
    if (isFallbackMode) {
      const chat = localDB.getChatById(chatId);
      if (!chat || chat.userId !== userId) {
        return res.status(404).json({ message: 'Chat not found or unauthorized' });
      }
      localDB.deleteChat(chatId);
    } else {
      const chat = await Chat.findOneAndDelete({ _id: chatId, userId });
      if (!chat) {
        return res.status(404).json({ message: 'Chat not found or unauthorized' });
      }
    }
    res.json({ success: true, message: 'Chat deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};
