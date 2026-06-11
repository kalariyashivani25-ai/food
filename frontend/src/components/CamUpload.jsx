import React, { useRef, useState } from 'react';
import { Camera, Image as ImageIcon, Sparkles, X, RefreshCw, AlertTriangle, CheckCircle, Apple } from 'lucide-react';

export default function CamUpload({ onClose, onAnalysisComplete }) {
  const [mode, setMode] = useState(null); // 'camera' or 'gallery'
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  // Initialize webcam stream
  const startCamera = async () => {
    setMode('camera');
    setError(null);
    setImagePreview(null);
    setAnalysis(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }, // Rear camera by default on phones
        audio: false
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('Camera access error:', err);
      setError('Webcam access was denied or is not supported. Please use the Gallery Upload instead.');
      setMode(null);
    }
  };

  // Capture image frame from active webcam stream
  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      // Set canvas dimension matching video stream dimensions
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Draw frame to canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const base64Image = canvas.toDataURL('image/jpeg');
      setImagePreview(base64Image);
      
      // Turn off camera stream to save energy
      stopCamera();
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  // Process selected file from standard system file dialog
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setError(null);
    setAnalysis(null);
    setMode('gallery');

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.onerror = () => {
      setError('Could not read image file.');
    };
    reader.readAsDataURL(file);
  };

  // Post base64 payload to backend image-analyzer controller
  const analyzeMeal = async () => {
    if (!imagePreview) return;
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/analyze/food', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ image: imagePreview })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Image analysis failed.');
      
      setAnalysis(data);
      if (onAnalysisComplete) {
        onAnalysisComplete({ ...data, image: imagePreview });
      }
    } catch (err) {
      setError(err.message || 'Server encountered an error parsing the food image.');
    } finally {
      setLoading(false);
    }
  };

  const resetScanner = () => {
    stopCamera();
    setMode(null);
    setImagePreview(null);
    setAnalysis(null);
    setError(null);
  };

  const handleClose = () => {
    stopCamera();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-2xl glass-panel rounded-3xl brand-glow p-6 relative overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200/50 dark:border-slate-800/50">
          <div className="flex items-center gap-2">
            <Apple className="w-6 h-6 text-emerald-500" />
            <h3 className="text-xl font-bold font-display text-slate-800 dark:text-white">AI Meal Scanner</h3>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Box */}
        <div className="flex-grow overflow-y-auto py-6 space-y-6">
          {error && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs flex gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {!mode && !imagePreview && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-8">
              <button
                onClick={startCamera}
                className="flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800/80 hover:border-emerald-500/50 dark:hover:border-emerald-500/40 bg-slate-50/50 dark:bg-slate-900/30 transition-all hover:scale-[1.02] group"
              >
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Camera className="w-6 h-6" />
                </div>
                <span className="font-semibold text-sm text-slate-700 dark:text-slate-200">Use Live Camera</span>
                <span className="text-xs text-slate-400 mt-1 text-center">Snapshot your plate in real time</span>
              </button>

              <label className="flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800/80 hover:border-emerald-500/50 dark:hover:border-emerald-500/40 bg-slate-50/50 dark:bg-slate-900/30 transition-all hover:scale-[1.02] cursor-pointer group">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <ImageIcon className="w-6 h-6" />
                </div>
                <span className="font-semibold text-sm text-slate-700 dark:text-slate-200">Upload from Gallery</span>
                <span className="text-xs text-slate-400 mt-1 text-center">Select image from your device</span>
              </label>
            </div>
          )}

          {/* Active Camera View */}
          {mode === 'camera' && !imagePreview && (
            <div className="relative rounded-2xl overflow-hidden bg-black border border-slate-200 dark:border-slate-800 aspect-video flex items-center justify-center">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              ></video>
              <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-3">
                <button
                  onClick={capturePhoto}
                  className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full font-semibold text-sm shadow-lg flex items-center gap-2"
                >
                  <Camera className="w-4 h-4" /> Snapshot Meal
                </button>
                <button
                  onClick={resetScanner}
                  className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-full text-sm flex items-center gap-2"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Image captured or loaded preview */}
          {imagePreview && !analysis && (
            <div className="space-y-4">
              <div className="relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-200 dark:border-slate-800 aspect-video flex items-center justify-center">
                <img
                  src={imagePreview}
                  alt="Food Snapshot"
                  className="w-full h-full object-contain"
                />
                <div className="absolute top-4 right-4 flex gap-2">
                  <button
                    onClick={resetScanner}
                    className="p-2 bg-slate-900/80 hover:bg-slate-900 text-white rounded-full shadow transition-all backdrop-blur-sm"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex justify-center gap-3">
                <button
                  onClick={analyzeMeal}
                  disabled={loading}
                  className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 active:scale-95 disabled:opacity-50 text-white rounded-xl font-semibold text-sm shadow-lg shadow-emerald-500/20 flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" /> Analyzing Macros...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" /> Recognize & Analyze Meal
                    </>
                  )}
                </button>
                <button
                  onClick={resetScanner}
                  disabled={loading}
                  className="px-6 py-3 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-sm"
                >
                  Retake
                </button>
              </div>
            </div>
          )}

          {/* Analysis Results Display */}
          {analysis && (
            <div className="space-y-6 animate-slide-up">
              <div className="relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-200 dark:border-slate-800 max-h-48 flex items-center justify-center">
                <img
                  src={imagePreview}
                  alt="Analyzed Plate"
                  className="w-full h-full object-cover opacity-60"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase mb-1.5 ${analysis.isHealthy ? 'bg-emerald-500' : 'bg-amber-500'}`}>
                    {analysis.isHealthy ? 'Healthy Meal' : 'Nutritionally Unbalanced'}
                  </span>
                  <h4 className="text-lg font-bold font-display">{analysis.mealName}</h4>
                </div>
              </div>

              {/* Macro breakdown grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 flex flex-col items-center">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Calories</span>
                  <span className="text-2xl font-bold font-display text-emerald-500 mt-1">{analysis.estimatedCalories}</span>
                  <span className="text-[10px] text-slate-400">kcal</span>
                </div>
                <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/10 flex flex-col items-center">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Protein</span>
                  <span className="text-2xl font-bold font-display text-blue-500 mt-1">{analysis.protein}g</span>
                  <span className="text-[10px] text-slate-400">Carb Building</span>
                </div>
                <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10 flex flex-col items-center">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Fat</span>
                  <span className="text-2xl font-bold font-display text-amber-500 mt-1">{analysis.fat}g</span>
                  <span className="text-[10px] text-slate-400">Energy source</span>
                </div>
                <div className="p-4 rounded-2xl bg-purple-500/5 border border-purple-500/10 flex flex-col items-center">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Carbs</span>
                  <span className="text-2xl font-bold font-display text-purple-500 mt-1">{analysis.carbohydrates}g</span>
                  <span className="text-[10px] text-slate-400">Total fuel</span>
                </div>
              </div>

              {/* Nutrition breakdown cards */}
              <div className="space-y-4">
                <div className="p-5 rounded-2xl bg-slate-100/50 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/40">
                  <h5 className="font-semibold text-sm text-slate-800 dark:text-slate-200 flex items-center gap-1.5 mb-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500" /> Nutritional Assessment (Score: {analysis.healthScore}/100)
                  </h5>
                  <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">{analysis.analysis}</p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-100/50 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/40">
                  <h5 className="font-semibold text-sm text-slate-800 dark:text-slate-200 flex items-center gap-1.5 mb-2">
                    <Sparkles className="w-4 h-4 text-emerald-400" /> Actionable Improvements
                  </h5>
                  <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">{analysis.improvements}</p>
                </div>
              </div>

              {/* Warning note */}
              <div className="p-3 rounded-xl bg-slate-100/40 dark:bg-slate-900/20 text-[10px] text-slate-400 leading-normal text-center border border-slate-200/20">
                ⚠️ **Medical Warning:** Calorie estimations and health indices are approximations based on computer vision. They are for educational reference and do not replace formal dietician calculations.
              </div>

              <div className="flex justify-center pt-2">
                <button
                  onClick={resetScanner}
                  className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold transition-all"
                >
                  Scan Another Meal
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Hidden Canvas tag used for drawing frames */}
        <canvas ref={canvasRef} className="hidden"></canvas>
      </div>
    </div>
  );
}
