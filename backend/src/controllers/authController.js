import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { isFallbackMode, localDB } from '../config/db.js';

// Secret key helper
const getSecret = () => process.env.JWT_SECRET || 'super_secret_nutri_key_12345';

// Generate Token
const generateToken = (id) => {
  return jwt.sign({ id }, getSecret(), {
    expiresIn: '30d',
  });
};

// Calculate BMI and Daily Calories
export const calculateMetrics = (profile) => {
  const { weight = 70, height = 175, age = 28, gender = 'Other', activityLevel = 'Moderate', goal = 'Maintenance' } = profile;
  
  // 1. BMI Calculation
  const heightInMeters = height / 100;
  const bmi = parseFloat((weight / (heightInMeters * heightInMeters)).toFixed(2));

  // 2. BMR Calculation (Mifflin-St Jeor Equation)
  let bmr = 10 * weight + 6.25 * height - 5 * age;
  if (gender === 'Male') {
    bmr += 5;
  } else if (gender === 'Female') {
    bmr -= 161;
  } else {
    bmr -= 78; // average offset
  }

  // 3. TDEE (Total Daily Energy Expenditure) based on Activity Level
  let multiplier = 1.2; // Sedentary
  if (activityLevel === 'Light') multiplier = 1.375;
  if (activityLevel === 'Moderate') multiplier = 1.55;
  if (activityLevel === 'Active') multiplier = 1.725;
  if (activityLevel === 'Very Active') multiplier = 1.9;

  let dailyCalories = Math.round(bmr * multiplier);

  // 4. Adjust based on Goal
  if (goal === 'Weight Loss') {
    dailyCalories -= 500;
  } else if (goal === 'Weight Gain') {
    dailyCalories += 500;
  }

  // Bound dailyCalories to reasonable limits
  dailyCalories = Math.max(1200, dailyCalories);

  return { bmi, dailyCalorieTarget: dailyCalories };
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
  const { name, email, password, profile } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Please provide name, email and password' });
  }

  const initialProfile = {
    age: 28,
    gender: 'Other',
    weight: 70,
    height: 175,
    activityLevel: 'Moderate',
    goal: 'Maintenance',
    diseaseConditions: [],
    dietPreference: 'General',
    ...profile,
  };

  const calculated = calculateMetrics(initialProfile);
  initialProfile.bmi = calculated.bmi;
  initialProfile.dailyCalorieTarget = calculated.dailyCalorieTarget;

  try {
    if (isFallbackMode) {
      const existingUser = localDB.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }

      // Hash password manually in fallback mode
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const userId = 'user_' + Date.now();
      const newUser = {
        _id: userId,
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        profile: initialProfile,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      localDB.saveUser(newUser);

      res.status(201).json({
        _id: userId,
        name,
        email,
        token: generateToken(userId),
        profile: initialProfile,
      });
    } else {
      const userExists = await User.findOne({ email });
      if (userExists) {
        return res.status(400).json({ message: 'User already exists' });
      }

      const user = await User.create({
        name,
        email,
        password,
        profile: initialProfile,
      });

      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id),
        profile: user.profile,
      });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error during signup: ' + error.message });
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Please provide email and password' });
  }

  try {
    if (isFallbackMode) {
      const user = localDB.getUserByEmail(email);
      if (user && (await bcrypt.compare(password, user.password))) {
        res.json({
          _id: user._id,
          name: user.name,
          email: user.email,
          token: generateToken(user._id),
          profile: user.profile,
        });
      } else {
        res.status(401).json({ message: 'Invalid email or password' });
      }
    } else {
      const user = await User.findOne({ email });
      if (user && (await user.matchPassword(password))) {
        res.json({
          _id: user._id,
          name: user.name,
          email: user.email,
          token: generateToken(user._id),
          profile: user.profile,
        });
      } else {
        res.status(401).json({ message: 'Invalid email or password' });
      }
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error during login: ' + error.message });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
export const getUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    if (isFallbackMode) {
      const user = localDB.getUserById(userId);
      if (user) {
        res.json({
          _id: user._id,
          name: user.name,
          email: user.email,
          profile: user.profile,
        });
      } else {
        res.status(404).json({ message: 'User not found' });
      }
    } else {
      const user = await User.findById(userId).select('-password');
      if (user) {
        res.json(user);
      } else {
        res.status(404).json({ message: 'User not found' });
      }
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateUserProfile = async (req, res) => {
  const userId = req.user.id;
  const { name, profile } = req.body;

  try {
    if (isFallbackMode) {
      const user = localDB.getUserById(userId);
      if (!user) return res.status(404).json({ message: 'User not found' });

      if (name) user.name = name;
      if (profile) {
        const mergedProfile = { ...user.profile, ...profile };
        const calculated = calculateMetrics(mergedProfile);
        mergedProfile.bmi = calculated.bmi;
        mergedProfile.dailyCalorieTarget = calculated.dailyCalorieTarget;
        user.profile = mergedProfile;
      }
      user.updatedAt = new Date().toISOString();
      localDB.saveUser(user);

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        profile: user.profile,
      });
    } else {
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ message: 'User not found' });

      if (name) user.name = name;
      if (profile) {
        const mergedProfile = { ...user.profile.toObject(), ...profile };
        const calculated = calculateMetrics(mergedProfile);
        mergedProfile.bmi = calculated.bmi;
        mergedProfile.dailyCalorieTarget = calculated.dailyCalorieTarget;
        user.profile = mergedProfile;
      }

      const updatedUser = await user.save();
      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        profile: updatedUser.profile,
      });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

// @desc    Mock Google Login / Signup
// @route   POST /api/auth/google
// @access  Public
export const googleLogin = async (req, res) => {
  const { email, name, googleId } = req.body;

  if (!email || !name) {
    return res.status(400).json({ message: 'Email and name are required' });
  }

  const initialProfile = {
    age: 28,
    gender: 'Other',
    weight: 70,
    height: 175,
    activityLevel: 'Moderate',
    goal: 'Maintenance',
    diseaseConditions: [],
    dietPreference: 'General',
  };

  const calculated = calculateMetrics(initialProfile);
  initialProfile.bmi = calculated.bmi;
  initialProfile.dailyCalorieTarget = calculated.dailyCalorieTarget;

  try {
    if (isFallbackMode) {
      let user = localDB.getUserByEmail(email);
      
      if (!user) {
        const userId = 'user_g_' + Date.now();
        user = {
          _id: userId,
          name,
          email: email.toLowerCase(),
          password: 'google_oauth_mocked_password_' + googleId,
          profile: initialProfile,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        localDB.saveUser(user);
      }

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id),
        profile: user.profile,
      });
    } else {
      let user = await User.findOne({ email });

      if (!user) {
        // Create user with random pass since logging with Google
        const generatedPass = Math.random().toString(36).slice(-8) + googleId;
        user = await User.create({
          name,
          email,
          password: generatedPass,
          profile: initialProfile,
        });
      }

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id),
        profile: user.profile,
      });
    }
  } catch (error) {
    res.status(500).json({ message: 'Google Auth Server error: ' + error.message });
  }
};
