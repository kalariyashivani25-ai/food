import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import {
  Send,
  Mic,
  MicOff,
  Sparkles,
  MessageSquare,
  Trash2,
  Plus,
  Search,
  RefreshCw,
  Terminal,
  AlertTriangle,
  User,
  Heart,
  ChevronRight,
  ArrowRight
} from 'lucide-react';

const SUGGESTIONS = [
  { text: "How can I lose weight?", icon: "🥗" },
  { text: "Diet for diabetes", icon: "🩸" },
  { text: "High protein breakfast ideas", icon: "🍳" },
  { text: "High BP foods to avoid", icon: "🫀" }
];

export default function ChatPage({ activeAnalysis, clearActiveAnalysis }) {
  const { token } = useAuth();
  
  // Chat Timeline list
  const [history, setHistory] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeChatId, setActiveChatId] = useState(null);
  
  // Messages inside active chat thread
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState(null);

  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  // Load chat timeline lists at startup
  useEffect(() => {
    fetchHistory();
  }, []);

  // Detect image scanning trigger from dashboard
  useEffect(() => {
    if (activeAnalysis) {
      const triggerImageAnalysisChat = async () => {
        const text = `[HIDDEN_PROMPT] I just scanned my meal. Name: ${activeAnalysis.mealName}, Calories: ${activeAnalysis.estimatedCalories} kcal, P: ${activeAnalysis.protein}g, F: ${activeAnalysis.fat}g, C: ${activeAnalysis.carbohydrates}g. Assessment: "${activeAnalysis.analysis}". Improvements: "${activeAnalysis.improvements}". Please provide a structured analysis response based on this data.`;
        await handleSendMessage(text, activeAnalysis.image);
        clearActiveAnalysis();
      };
      triggerImageAnalysisChat();
    }
  }, [activeAnalysis]);

  // Auto-scroll to message feed base
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const fetchHistory = async () => {
    setHistoryLoading(true);
    try {
      const res = await fetch('/api/chat/history', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setHistoryLoading(false);
    }
  };

  const loadChatThread = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/chat/history/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setActiveChatId(data._id);
        setMessages(data.messages);
      } else {
        setError('Could not load chat thread.');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const startNewChatThread = () => {
    setActiveChatId(null);
    setMessages([]);
    setError(null);
  };

  const deleteChatThread = async (e, id) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/chat/history/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        if (activeChatId === id) {
          startNewChatThread();
        }
        fetchHistory();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendMessage = async (textToSend, imageUrl = null) => {
    const queryText = textToSend || input;
    if (!queryText.trim() && !imageUrl) return;

    if (!textToSend) setInput('');
    setError(null);

    // Append user query locally to feed instantly
    const tempUserMessage = {
      role: 'user',
      content: queryText,
      image: imageUrl,
      timestamp: new Date().toISOString()
    };
    setMessages((prev) => [...prev, tempUserMessage]);
    setLoading(true);

    try {
      const res = await fetch('/api/chat/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          chatId: activeChatId,
          message: queryText,
          imageUrl: imageUrl
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error getting AI response.');

      // Synchronize thread IDs and message lists
      setActiveChatId(data.chatId);
      setMessages(data.messages);
      fetchHistory(); // refresh timeline list
    } catch (err) {
      setError(err.message || 'Could not reach server.');
      // Remove temporary message if failed
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }
  };

  // Browser speech recognition configuration
  const toggleSpeechRecognition = () => {
    if (isRecording) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsRecording(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError('Web SpeechRecognition API is not supported in this browser. Please use Chrome/Edge.');
      return;
    }

    const rec = new SpeechRecognition();
    rec.continuous = false;
    rec.lang = 'en-US';
    rec.interimResults = false;

    rec.onstart = () => {
      setIsRecording(true);
      setError(null);
    };

    rec.onresult = (e) => {
      const spokenText = e.results[0][0].transcript;
      setInput(spokenText);
    };

    rec.onerror = (e) => {
      console.error('Speech error:', e.error);
      setError('Speech recording error: ' + e.error);
      setIsRecording(false);
    };

    rec.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current = rec;
    rec.start();
  };

  // Filter history based on search bar queries
  const filteredHistory = history.filter((h) =>
    h.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex glass-panel rounded-3xl overflow-hidden border border-slate-200/40 dark:border-slate-800/40 h-[calc(100vh-12rem)] animate-fade-in relative z-10">
      
      {/* Left Chat Sidebar history lists */}
      <div className="w-72 border-r border-slate-200/50 dark:border-slate-800/50 flex flex-col bg-white/40 dark:bg-slate-900/20 shrink-0 hidden md:flex">
        
        {/* Sidebar Trigger button */}
        <div className="p-4 border-b border-slate-200/50 dark:border-slate-800/50 flex justify-between items-center">
          <button
            onClick={startNewChatThread}
            className="w-full py-2 px-3.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4" /> New Discussion
          </button>
        </div>

        {/* History Search bar */}
        <div className="p-3 border-b border-slate-200/30 dark:border-slate-800/30">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-slate-400">
              <Search className="w-3.5 h-3.5" />
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search previous chats..."
              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-100/50 dark:bg-slate-800/30 border border-slate-200/50 dark:border-slate-800/60 text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Scrolling Chat history container */}
        <div className="flex-grow overflow-y-auto p-3 space-y-1.5">
          {historyLoading ? (
            <div className="flex items-center justify-center py-8 text-xs text-slate-400 gap-1.5">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Loading timeline...
            </div>
          ) : filteredHistory.length === 0 ? (
            <p className="text-[10px] text-slate-400/80 text-center py-8">No chats found.</p>
          ) : (
            filteredHistory.map((chat) => {
              const isActive = activeChatId === chat._id;
              return (
                <button
                  key={chat._id}
                  onClick={() => loadChatThread(chat._id)}
                  className={`w-full py-2.5 px-3 rounded-xl text-left text-xs flex items-center justify-between group transition-all ${isActive ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/10' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100/60 dark:hover:bg-slate-800/40 border border-transparent'}`}
                >
                  <div className="flex items-center gap-2 truncate pr-2">
                    <MessageSquare className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate font-medium">{chat.title || 'Conversation'}</span>
                  </div>
                  <button
                    onClick={(e) => deleteChatThread(e, chat._id)}
                    className="p-1 text-slate-400 hover:text-rose-500 rounded hover:bg-slate-200/40 dark:hover:bg-slate-800/80 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </button>
              );
            })
          )}
        </div>

      </div>

      {/* Right Core AI Dialog frame */}
      <div className="flex-grow flex flex-col bg-slate-50/30 dark:bg-slate-900/10 relative">
        
        {/* Main Header */}
        <div className="p-4 border-b border-slate-200/50 dark:border-slate-800/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-800 dark:text-white">NutriAI Virtual Expert</h3>
              <p className="text-[10px] text-emerald-500 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span> Active Online Answering
              </p>
            </div>
          </div>

          <button
            onClick={startNewChatThread}
            className="md:hidden p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-200"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Message Feed Feed list */}
        <div className="flex-grow overflow-y-auto p-4 sm:p-6 space-y-6">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs flex gap-2">
              <AlertTriangle className="w-4.5 h-4.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {messages.length === 0 ? (
            /* Suggested Questions Panel */
            <div className="flex flex-col items-center justify-center h-full max-w-lg mx-auto text-center space-y-8 animate-slide-up">
              <div>
                <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-bold uppercase tracking-widest">Healthcare Engine</span>
                <h4 className="text-xl font-bold font-display text-slate-800 dark:text-white mt-3">What are your health and diet goals?</h4>
                <p className="text-xs text-slate-400 mt-1.5">Ask questions about calories, disease nutrition, fat loss, or protein recipes below.</p>
              </div>

              <div className="grid grid-cols-2 gap-4 w-full">
                {SUGGESTIONS.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => handleSendMessage(s.text)}
                    className="p-4 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/60 rounded-2xl text-left hover:border-emerald-500/50 dark:hover:border-emerald-500/40 text-xs hover:scale-[1.02] shadow-sm transition-all group flex items-start gap-2.5"
                  >
                    <span className="text-xl shrink-0">{s.icon}</span>
                    <div className="flex-grow">
                      <p className="font-semibold text-slate-700 dark:text-slate-200 leading-normal">{s.text}</p>
                      <span className="text-[10px] text-slate-400 inline-flex items-center gap-0.5 mt-1 group-hover:text-emerald-500 transition-colors">
                        Ask AI <ArrowRight className="w-2.5 h-2.5 group-hover:translate-x-0.5 transition-transform" />
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Active Message Timelines */
            <div className="space-y-4 max-w-3xl mx-auto">
              {messages.map((msg, index) => {
                const isUser = msg.role === 'user';
                return (
                  <div
                    key={index}
                    className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    {/* Assistant Icon */}
                    {!isUser && (
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0 self-start border border-emerald-500/15">
                        <Sparkles className="w-4 h-4" />
                      </div>
                    )}

                    {/* Dialog Balloon */}
                    <div
                      className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed shadow-sm ${isUser ? 'bg-emerald-500 text-white rounded-br-none' : 'bg-white dark:bg-slate-900 border border-slate-200/40 dark:border-slate-800/40 text-slate-800 dark:text-slate-200 rounded-bl-none prose prose-slate dark:prose-invert prose-xs'}`}
                    >
                      {isUser ? (
                        <div className="flex flex-col gap-2">
                          {msg.image && <img src={msg.image} alt="Uploaded meal" className="w-48 h-48 object-cover rounded-xl border border-white/20" />}
                          <p className="whitespace-pre-wrap">{msg.content?.startsWith('[HIDDEN_PROMPT]') ? 'Please analyze this meal photo.' : msg.content}</p>
                        </div>
                      ) : (
                        /* Standard markdown processing container */
                        <div className="space-y-3">
                          {msg.content.split('\n').map((line, lIdx) => {
                            if (line.startsWith('###')) {
                              return <h4 key={lIdx} className="text-sm font-bold text-slate-800 dark:text-white mt-3 border-b border-slate-200/20 pb-1 font-display">{line.replace(/###/g, '')}</h4>;
                            }
                            if (line.startsWith('*')) {
                              return <li key={lIdx} className="ml-4 list-disc text-slate-600 dark:text-slate-300">{line.replace(/\*/g, '')}</li>;
                            }
                            if (line.startsWith('>')) {
                              return <blockquote key={lIdx} className="p-3 bg-amber-500/5 border-l-4 border-amber-500 text-[10px] text-amber-500/90 italic rounded">{line.replace(/>/g, '')}</blockquote>;
                            }
                            
                            // Simple table scanner/renderer helper for calorie matrices
                            if (line.startsWith('|')) {
                              const cols = line.split('|').filter(c => c.trim()).map(c => c.trim());
                              // Ignore separators
                              if (cols[0]?.includes('---')) return null;
                              return (
                                <div key={lIdx} className="grid grid-cols-3 gap-2 bg-slate-100/50 dark:bg-slate-800/30 p-2.5 rounded-lg text-[10px] border border-slate-200/20">
                                  {cols.map((c, cIdx) => (
                                    <span key={cIdx} className={cIdx === 0 ? 'font-bold' : ''}>{c.replace(/\*\*/g, '')}</span>
                                  ))}
                                </div>
                              );
                            }
                            return <p key={lIdx} className="text-slate-600 dark:text-slate-300 leading-normal">{line.replace(/\*\*/g, '')}</p>;
                          })}
                        </div>
                      )}
                    </div>

                    {/* User Icon */}
                    {isUser && (
                      <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-200 flex items-center justify-center shrink-0 self-start">
                        <User className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Typing bounce dots anim */}
              {loading && (
                <div className="flex gap-3 justify-start">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0 self-start">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div className="bg-white dark:bg-slate-900 border border-slate-200/40 dark:border-slate-800/40 rounded-2xl rounded-bl-none p-4 flex gap-1 items-center shrink-0">
                    <span className="w-1.5 h-1.5 bg-slate-400 dark:bg-slate-600 rounded-full typing-dot"></span>
                    <span className="w-1.5 h-1.5 bg-slate-400 dark:bg-slate-600 rounded-full typing-dot"></span>
                    <span className="w-1.5 h-1.5 bg-slate-400 dark:bg-slate-600 rounded-full typing-dot"></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef}></div>
            </div>
          )}
        </div>

        {/* Input Bar Form */}
        <div className="p-4 border-t border-slate-200/50 dark:border-slate-800/50 bg-white/40 dark:bg-slate-900/10 relative">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2 max-w-3xl mx-auto"
          >
            {/* Speech Microphone trigger */}
            <button
              type="button"
              onClick={toggleSpeechRecognition}
              className={`p-3.5 rounded-xl border transition-all ${isRecording ? 'bg-rose-500 border-rose-500 text-white animate-pulse' : 'bg-slate-100/80 dark:bg-slate-800/60 border-slate-200/50 dark:border-slate-800/60 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700/80 hover:text-slate-700 dark:hover:text-slate-200'}`}
            >
              {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isRecording ? 'Listening carefully... speak now' : 'Ask anything (Hindi, English...)'}
              disabled={isRecording}
              className="flex-grow px-4 py-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/60 text-xs focus:outline-none focus:border-emerald-500/80 focus:ring-1 focus:ring-emerald-500/30 text-slate-800 dark:text-slate-100"
            />

            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="p-3.5 bg-emerald-500 hover:bg-emerald-600 active:scale-95 disabled:opacity-50 disabled:scale-100 text-white rounded-xl shadow-lg shadow-emerald-500/10 flex items-center justify-center transition-all shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

          {/* Micro medical warning bar */}
          <p className="text-[9px] text-slate-400/80 mt-2 text-center select-none">
            ⚠️ AI recommendations are guidelines only. NutriAI advice does not replace professional medical diagnosis.
          </p>
        </div>

      </div>

    </div>
  );
}
