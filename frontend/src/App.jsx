import React, { useState } from 'react';
import { useAuth } from './context/AuthContext.jsx';
import { useTheme } from './context/ThemeContext.jsx';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import Dashboard from './pages/Dashboard.jsx';
import ChatPage from './pages/ChatPage.jsx';
import Calculators from './pages/Calculators.jsx';
import DiseaseSupport from './pages/DiseaseSupport.jsx';
import Profile from './pages/Profile.jsx';
import CamUpload from './components/CamUpload.jsx';


import {
  Sparkles,
  LayoutDashboard,
  MessageSquare,
  Calculator,
  ShieldAlert,
  User,
  Sun,
  Moon,
  LogOut,
  Menu,
  X
} from 'lucide-react';

export default function App() {
  const { user, loading } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isAuthLogin, setIsAuthLogin] = useState(true);
  const [showScanner, setShowScanner] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeAnalysis, setActiveAnalysis] = useState(null);

  // Trigger analysis capture to auto transition to chat AI thread
  const handleScannerComplete = (analysisData) => {
    setActiveAnalysis(analysisData);
    setActiveTab('chat');
    setShowScanner(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white gap-3">
        <Sparkles className="w-8 h-8 text-emerald-500 animate-spin" />
        <span className="text-xs font-semibold tracking-widest text-slate-400">LOADING NUTRIAI SYSTEM...</span>
      </div>
    );
  }

  // Not authenticated? Render Auth screens
  if (!user) {
    return isAuthLogin ? (
      <Login onToggleAuth={() => setIsAuthLogin(false)} />
    ) : (
      <Signup onToggleAuth={() => setIsAuthLogin(true)} />
    );
  }

  // Render navigation tab panels
  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard
            onTabSelect={setActiveTab}
            onTriggerScan={() => setShowScanner(true)}
            activeAnalysis={activeAnalysis}
          />
        );
      case 'chat':
        return (
          <ChatPage
            activeAnalysis={activeAnalysis}
            clearActiveAnalysis={() => setActiveAnalysis(null)}
          />
        );
      case 'calculators':
        return <Calculators />;
      case 'diseases':
        return <DiseaseSupport />;
      case 'profile':
        return <Profile />;
      default:
        return <Dashboard onTabSelect={setActiveTab} onTriggerScan={() => setShowScanner(true)} />;
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'chat', label: 'AI Assistant', icon: MessageSquare },
    { id: 'calculators', label: 'Calorie Matrix', icon: Calculator },
    { id: 'diseases', label: 'Diet Guides', icon: ShieldAlert },
    { id: 'profile', label: 'My Settings', icon: User },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300 relative flex flex-col overflow-x-hidden">
      {/* Background glowing decorations */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-glow-blue-radial pointer-events-none z-0"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-glow-radial pointer-events-none z-0"></div>

      {/* Main Header navigation */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/60 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800/40 relative z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo brand */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-lg font-display tracking-tight text-slate-800 dark:text-white">
              Nutri<span className="text-emerald-500">AI</span>
            </span>
          </div>

          {/* Desktop Navigation links */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all flex items-center gap-1.5 ${isActive ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/10 font-bold' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/50'}`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Header Action Buttons (Dark/Light toggle, Mobile menu launcher) */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors border border-slate-200/50 dark:border-slate-800/60"
            >
              {isDark ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
            </button>

            {/* Mobile Drawer Trigger button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200/50 dark:border-slate-800/60"
            >
              {mobileMenuOpen ? <X className="w-4.5 h-4.5" /> : <Menu className="w-4.5 h-4.5" />}
            </button>
          </div>

        </div>
      </header>

      {/* Mobile Drawer menu items */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-30 bg-slate-950/40 backdrop-blur-sm animate-fade-in" onClick={() => setMobileMenuOpen(false)}>
          <div className="w-64 max-h-screen h-full bg-white dark:bg-slate-900 border-r border-slate-200/50 dark:border-slate-800/50 p-4 space-y-6 flex flex-col justify-between" onClick={(e) => e.stopPropagation()}>
            <div className="space-y-6">
              <div className="flex items-center gap-2 border-b border-slate-200/50 dark:border-slate-800/50 pb-4">
                <div className="w-8 h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center shadow-lg">
                  <Sparkles className="w-4.5 h-4.5" />
                </div>
                <span className="font-extrabold text-sm tracking-tight text-slate-800 dark:text-white">NutriAI Menu</span>
              </div>

              <div className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full px-3.5 py-3 rounded-xl text-left text-xs font-semibold transition-all flex items-center gap-2.5 ${isActive ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/10' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50'}`}
                    >
                      <Icon className="w-4.5 h-4.5" />
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="border-t border-slate-200/50 dark:border-slate-800/50 pt-4">
              <div className="p-3 rounded-2xl bg-slate-100/50 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-800/60 flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 truncate pr-2">Active: {user.name}</span>
                <button
                  onClick={toggleTheme}
                  className="p-1 text-slate-500 dark:text-slate-400 hover:text-emerald-500 transition-colors"
                >
                  {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main content display */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {renderTabContent()}
      </main>

      {/* Footer warning bar */}
      <footer className="py-6 border-t border-slate-200/30 dark:border-slate-800/30 text-center bg-white/20 dark:bg-slate-900/10 backdrop-blur-sm relative z-25">
        <p className="text-[10px] text-slate-400 leading-normal max-w-xl mx-auto px-4">
          © {new Date().getFullYear()} NutriAI Assistant. All rights reserved. 
          <span className="block mt-1">⚠️ Medical Advice Warning: Calculations and virtual assistant summaries are purely educational and are not substitute clinics.</span>
        </p>
      </footer>

      {/* Modal image analyzer dialog */}
      {showScanner && (
        <CamUpload
          onClose={() => setShowScanner(false)}
          onAnalysisComplete={handleScannerComplete}
        />
      )}
    </div>
  );
}
