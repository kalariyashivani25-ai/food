import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    profile: {
      age: { type: Number, default: 28 },
      gender: { type: String, default: 'Other' },
      weight: { type: Number, default: 70 }, // in kg
      height: { type: Number, default: 175 }, // in cm
      activityLevel: { type: String, default: 'Moderate' }, // Sedentary, Light, Moderate, Active, Very Active
      goal: { type: String, default: 'Maintenance' }, // Weight Loss, Weight Gain, Maintenance
      diseaseConditions: { type: [String], default: [] }, // Diabetes, High BP, Cholesterol, PCOS, Thyroid, Heart Health, etc.
      dietPreference: { type: String, default: 'General' }, // Veg, Non-Veg, Vegan, Keto, etc.
      bmi: { type: Number, default: 22.86 },
      dailyCalorieTarget: { type: Number, default: 2000 },
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.models.User || mongoose.model('User', userSchema);
export default User;
