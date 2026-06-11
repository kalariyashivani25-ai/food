import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';

const FALLBACK_FILE = path.join(process.cwd(), 'db_fallback.json');

// Initialize fallback JSON file database if not present
if (!fs.existsSync(FALLBACK_FILE)) {
  fs.writeFileSync(
    FALLBACK_FILE,
    JSON.stringify({ users: [], chats: [] }, null, 2),
    'utf-8'
  );
}

export let isFallbackMode = true;

export const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.warn('\x1b[33m%s\x1b[0m', '⚠️ No MONGODB_URI provided in .env. Running in LOCAL JSON Database Fallback mode!');
    isFallbackMode = true;
    return;
  }

  try {
    mongoose.set('strictQuery', false);
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 3000, // Fail quickly if mongo is not running
    });
    console.log('\x1b[32m%s\x1b[0m', '✅ MongoDB Connected Successfully!');
    isFallbackMode = false;
  } catch (error) {
    console.error('\x1b[31m%s\x1b[0m', '❌ MongoDB Connection Failed! Error: ' + error.message);
    console.warn('\x1b[33m%s\x1b[0m', '⚠️ Falling back to LOCAL JSON Database Mode.');
    isFallbackMode = true;
  }
};

// Local database helper operations
export const localDB = {
  read: () => {
    try {
      const data = fs.readFileSync(FALLBACK_FILE, 'utf-8');
      return JSON.parse(data);
    } catch (e) {
      return { users: [], chats: [] };
    }
  },

  write: (data) => {
    fs.writeFileSync(FALLBACK_FILE, JSON.stringify(data, null, 2), 'utf-8');
  },

  getUsers: () => {
    return localDB.read().users;
  },

  saveUser: (user) => {
    const data = localDB.read();
    const existingIndex = data.users.findIndex((u) => u._id === user._id || u.email === user.email);
    
    if (existingIndex > -1) {
      data.users[existingIndex] = { ...data.users[existingIndex], ...user };
    } else {
      if (!user._id) user._id = 'user_' + Date.now();
      data.users.push(user);
    }
    localDB.write(data);
    return user;
  },

  getUserByEmail: (email) => {
    return localDB.getUsers().find((u) => u.email.toLowerCase() === email.toLowerCase());
  },

  getUserById: (id) => {
    return localDB.getUsers().find((u) => u._id === id);
  },

  getChats: (userId) => {
    return localDB.read().chats.filter((c) => c.userId === userId);
  },

  getChatById: (chatId) => {
    return localDB.read().chats.find((c) => c._id === chatId);
  },

  saveChat: (chat) => {
    const data = localDB.read();
    if (!chat._id) chat._id = 'chat_' + Date.now();
    const existingIndex = data.chats.findIndex((c) => c._id === chat._id);
    
    if (existingIndex > -1) {
      data.chats[existingIndex] = { ...data.chats[existingIndex], ...chat, updatedAt: new Date().toISOString() };
    } else {
      chat.createdAt = new Date().toISOString();
      chat.updatedAt = new Date().toISOString();
      data.chats.push(chat);
    }
    localDB.write(data);
    return chat;
  },

  deleteChat: (chatId) => {
    const data = localDB.read();
    data.chats = data.chats.filter((c) => c._id !== chatId);
    localDB.write(data);
    return true;
  }
};
