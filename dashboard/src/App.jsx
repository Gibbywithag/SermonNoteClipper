import React, { useState, useEffect } from 'react';
import { Upload, FileVideo, Sparkles, Youtube, Instagram, LogOut, ChevronDown, Check, Activity, LayoutDashboard, Settings, PlusCircle, History, Menu, X, Terminal, Shield, LayoutGrid, Globe, RotateCcw, AlertTriangle, KeyRound, Bot, Users, Smartphone, ExternalLink, Copy, CheckCircle2 } from 'lucide-react';
import KeyInput from './components/KeyInput';
import MediaInput from './components/MediaInput';
import ResultCard from './components/ResultCard';
import ExportsView from './components/ExportsView';
// import Gallery from './components/Gallery';
import { getApiUrl } from './config';

// Light obfuscation (NOT encryption) using XOR + Base64 with a Salt.
// This only hides the raw key from a casual localStorage glance; it is reversible
// client-side by anyone with the source and must not be treated as real encryption.
const SECRET_KEY = import.meta.env.VITE_ENCRYPTION_KEY || "SermonNoteClipper-Salt-Key";
const ENCRYPTION_PREFIX = "ENC:";

const encrypt = (text) => {
  if (!text) return '';
  try {
    const xor = text.split('').map((c, i) =>
      String.fromCharCode(c.charCodeAt(0) ^ SECRET_KEY.charCodeAt(i % SECRET_KEY.length))
    ).join('');
    return ENCRYPTION_PREFIX + btoa(xor);
  } catch (e) {
    console.error("Encryption failed", e);
    return text;
  }
};

const decrypt = (text) => {
  if (!text) return '';
  if (text.startsWith(ENCRYPTION_PREFIX)) {
    try {
      const raw = text.slice(ENCRYPTION_PREFIX.length);
      // Check if it's plain base64 or our custom XOR (simple try)
      const xor = atob(raw);
      const result = xor.split('').map((c, i) =>
        String.fromCharCode(c.charCodeAt(0) ^ SECRET_KEY.charCodeAt(i % SECRET_KEY.length))
      ).join('');
      return result;
    } catch (e) {
      // Fallback if decryption fails (might be old plain text)
      return '';
    }
  }
  // Backward compatibility: If no prefix, assume old plain text (or return empty if you want to force re-login)
  // For migration: Return text as is, so it populates the field, and next save will encrypt it.
  return text;
};

// Simple TikTok icon sine Lucide might not have it or it varies
const TikTokIcon = ({ size = 16, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-5.201 1.743l-.002-.001.002.001a2.895 2.895 0 0 1 3.183-4.51v-3.5a6.329 6.329 0 0 0-5.394 10.692 6.33 6.33 0 0 0 10.857-4.424V8.687a8.182 8.182 0 0 0 4.773 1.526V6.79a4.831 4.831 0 0 1-1.003-.104z" />
  </svg>
);

const SESSION_KEY = 'sermon_clipper_session';
const SESSION_MAX_AGE = 7 * 24 * 3600000; // 7 days (matches server clip retention)

// Mock polling function
const pollJob = async (jobId) => {
  const res = await fetch(getApiUrl(`/api/status/${jobId}`));
  if (!res.ok) throw new Error('Status check failed');
  return res.json();
};

function App() {
  const [apiKey, setApiKey] = useState(() => {
    const stored = localStorage.getItem('gemini_key');
    if (stored) return decrypt(stored);
    return '';
  });
  // ElevenLabs API State - Load lightly obfuscated (not encryption)
  const [elevenLabsKey, setElevenLabsKey] = useState(() => {
    const stored = localStorage.getItem('elevenLabsKey_v1');
    if (stored) return decrypt(stored);
    return '';
  });

  const [showKeyModal, setShowKeyModal] = useState(false);
  const [jobId, setJobId] = useState(null);
  const [status, setStatus] = useState('idle'); // idle, processing, complete, error
  const [results, setResults] = useState(null);
  const [logs, setLogs] = useState([]);
  const [processingMedia, setProcessingMedia] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard'); // dashboard, settings

  const [sessionRecovered, setSessionRecovered] = useState(false);
  // False when the server holds a Gemini key (GEMINI_API_KEY in .env, typically
  // with a gateway) — then the UI doesn't prompt for a key.
  const [keyRequired, setKeyRequired] = useState(true);

  // Ask the server whether a key is needed (or it already has one).
  useEffect(() => {
    fetch(getApiUrl('/api/config'))
      .then((r) => (r.ok ? r.json() : null))
      .then((cfg) => { if (cfg && cfg.geminiKeyRequired === false) setKeyRequired(false); })
      .catch(() => {});
  }, []);

  // Session Recovery: Restore on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(SESSION_KEY);
      if (!saved) return;
      const session = JSON.parse(saved);
      if (Date.now() - session.timestamp > SESSION_MAX_AGE) {
        localStorage.removeItem(SESSION_KEY);
        return;
      }
      if (session.jobId && session.status && session.status !== 'idle') {
        setJobId(session.jobId);
        setResults(session.results || null);
        if (session.processingMedia) setProcessingMedia(session.processingMedia);
        if (session.activeTab) setActiveTab(session.activeTab);
        // If was processing, resume polling; if complete/error, just show results
        setStatus(session.status === 'processing' ? 'processing' : session.status);
        setSessionRecovered(true);
        setTimeout(() => setSessionRecovered(false), 5000);
      }
    } catch (e) {
      localStorage.removeItem(SESSION_KEY);
    }
  }, []);

  // Session Recovery: Save state changes
  useEffect(() => {
    if (status === 'idle') {
      localStorage.removeItem(SESSION_KEY);
      return;
    }
    try {
      const sessionData = {
        jobId,
        status,
        results,
        processingMedia: processingMedia?.type === 'url' ? processingMedia : null,
        activeTab,
        timestamp: Date.now()
      };
      localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
    } catch (e) {
      // localStorage full or serialization error - ignore
    }
  }, [jobId, status, results, activeTab, processingMedia]);

  useEffect(() => {
    // Store the Gemini key lightly obfuscated (not encryption) for consistency with the ElevenLabs key,
    // so it is at least not sitting in localStorage as raw cleartext.
    if (apiKey) localStorage.setItem('gemini_key', encrypt(apiKey));
  }, [apiKey]);

  useEffect(() => {
    if (elevenLabsKey) {
      localStorage.setItem('elevenLabsKey_v1', encrypt(elevenLabsKey));
    }
  }, [elevenLabsKey]);

  useEffect(() => {
    if (status !== 'processing' || !jobId) return;
    let failCount = 0;
    const interval = setInterval(async () => {
      try {
        const data = await pollJob(jobId);
        failCount = 0;

        // Stream partial clips in as they finish.
        if (data.result) setResults(data.result);

        if (data.status === 'completed') {
          setStatus('complete');
          clearInterval(interval);
        } else if (data.status === 'failed') {
          setStatus('error');
          const errorMsg = data.error || (data.logs && data.logs.length > 0 ? data.logs[data.logs.length - 1] : "Process failed");
          setLogs(prev => [...prev, "Error: " + errorMsg]);
          clearInterval(interval);
        } else if (data.logs) {
          setLogs(data.logs);
        }
      } catch (e) {
        // Job dropped / server restarted / 1-hour cleanup purged it — don't spin forever.
        failCount += 1;
        if (failCount >= 5) {
          clearInterval(interval);
          setStatus('error');
          setLogs(prev => [...prev, "Lost connection to the job — it may have expired. Please try again."]);
        }
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [status, jobId]);


  const handleProcess = async (data) => {
    // Only require a key in the browser if the server doesn't already hold one.
    if (keyRequired && !apiKey) {
      setActiveTab('settings');
      return;
    }
    setStatus('processing');
    setLogs(["Starting process..."]);
    setResults(null);
    setProcessingMedia(data);

    try {
      let body;
      const headers = {};
      if (apiKey) headers['X-Gemini-Key'] = apiKey; // else the server uses its own key

      if (data.type === 'url') {
        headers['Content-Type'] = 'application/json';
        body = JSON.stringify({ url: data.payload, acknowledged: !!data.acknowledged });
      } else {
        const formData = new FormData();
        formData.append('file', data.payload);
        formData.append('acknowledged', data.acknowledged ? 'true' : 'false');
        body = formData;
      }

      const res = await fetch(getApiUrl('/api/process'), {
        method: 'POST',
        headers,
        body
      });

      if (!res.ok) throw new Error(await res.text());
      const resData = await res.json();
      setJobId(resData.job_id);

    } catch (e) {
      setStatus('error');
      setLogs(l => [...l, `Error starting job: ${e.message}`]);
    }
  };

  const handleReset = () => {
    setStatus('idle');
    setJobId(null);
    setResults(null);
    setLogs([]);
    setProcessingMedia(null);
    localStorage.removeItem(SESSION_KEY);
  };

  // --- UI Components ---

  const Sidebar = () => (
    <div className="w-20 lg:w-64 bg-surface border-r border-line flex flex-col h-full shrink-0 transition-all duration-300">
      <div className="p-6 flex items-center gap-3">
        <div className="w-9 h-9 bg-primary text-[#FBF8F4] rounded-xl flex items-center justify-center shrink-0 font-display italic text-xl leading-none">
          S
        </div>
        <span className="font-display italic font-semibold text-xl text-ink hidden lg:block tracking-tight">Sermon Clipper</span>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-2">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-colors ${activeTab === 'dashboard' ? 'bg-primary/10 text-primary' : 'text-muted hover:text-ink hover:bg-stone'}`}
        >
          <LayoutDashboard size={20} />
          <span className="font-medium hidden lg:block">Sermon Clipper</span>
        </button>

        <button
          onClick={() => setActiveTab('exports')}
          className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-colors ${activeTab === 'exports' ? 'bg-primary/10 text-primary' : 'text-muted hover:text-ink hover:bg-stone'}`}
        >
          <LayoutGrid size={20} />
          <span className="font-medium hidden lg:block">Exports</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-colors ${activeTab === 'settings' ? 'bg-primary/10 text-primary' : 'text-muted hover:text-ink hover:bg-stone'}`}
        >
          <Settings size={20} />
          <span className="font-medium hidden lg:block">Settings</span>
        </button>
      </nav>
    </div>
  );

  return (
    <div className="flex h-screen bg-background overflow-hidden selection:bg-primary/30">
      <Sidebar />

      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Background Gradients */}
        <div className="absolute inset-0 overflow-hidden -z-10 pointer-events-none">
          <div className="absolute -top-[10%] -right-[10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[120px]" />
        </div>

        {/* Top Header */}
        <header className="h-16 border-b border-line bg-background/70 backdrop-blur-md flex items-center justify-between px-6 shrink-0 z-10">
          <div className="flex items-center gap-4">
            {status !== 'idle' && (
              <button
                onClick={handleReset}
                className="flex items-center gap-2 text-sm text-muted hover:text-ink transition-colors"
              >
                <PlusCircle size={16} />
                <span className="hidden sm:inline">New Project</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-4" />
        </header>

        {/* Persistent Missing Keys Banner — visible on every screen */}
        {keyRequired && !apiKey && activeTab !== 'settings' && (
          <div className="mx-6 mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between gap-4 shrink-0 animate-[fadeIn_0.3s_ease-out]">
            <div className="flex items-center gap-3 text-sm text-amber-900">
              <KeyRound size={16} className="shrink-0 text-amber-600" />
              <div>
                <span className="font-semibold">Add your Gemini API key to get started.</span>{' '}
                <span className="text-amber-800">It’s free and takes a minute.</span>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('settings')}
              className="shrink-0 text-xs font-semibold px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white transition-colors"
            >
              Add key
            </button>
          </div>
        )}

        {/* Session Recovery Banner */}
        {sessionRecovered && (
          <div className="mx-6 mt-2 p-3 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-between animate-[fadeIn_0.3s_ease-out] shrink-0">
            <div className="flex items-center gap-2 text-sm text-primary">
              <RotateCcw size={16} />
              <span className="font-medium">Session recovered</span>
              <span className="text-muted text-xs">Your previous work has been restored.</span>
            </div>
            <button onClick={() => setSessionRecovered(false)} className="text-muted hover:text-ink transition-colors">
              <X size={14} />
            </button>
          </div>
        )}

        {/* Main Workspace */}
        <div className="flex-1 overflow-hidden relative">

          {/* View: Settings */}
          {activeTab === 'settings' && (
            <div className="h-full overflow-y-auto p-8 max-w-2xl mx-auto animate-[fadeIn_0.3s_ease-out]">
              <div className="flex items-center justify-between mb-8">
                <h1 className="text-2xl font-bold">Settings</h1>
                <div className="px-3 py-1 bg-green-50 border border-green-200 rounded-full text-[10px] text-green-700 font-medium flex items-center gap-2">
                  <Shield size={12} /> Keys stay in your browser
                </div>
              </div>
              <KeyInput onKeySet={setApiKey} savedKey={apiKey} />

              <div className="glass-panel p-6 mt-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Video Translation</h2>
                  <span className="text-[10px] bg-stone border border-line px-2 py-0.5 rounded text-muted uppercase tracking-wider">Optional</span>
                </div>
                <p className="text-xs text-muted mb-6 leading-relaxed">
                  Translate your clips to different languages using <strong>ElevenLabs</strong> AI dubbing.
                  Automatically translates speech while preserving the original voice characteristics.
                </p>
                <div className="space-y-4">
                  <label className="block text-sm text-muted">ElevenLabs API Key</label>
                  <div className="flex gap-2">
                    <input
                      type="password"
                      value={elevenLabsKey}
                      onChange={(e) => setElevenLabsKey(e.target.value)}
                      className="input-field"
                      placeholder="sk_..."
                    />
                    <button
                      onClick={() => {
                        if (elevenLabsKey) {
                          localStorage.setItem('elevenLabsKey_v1', encrypt(elevenLabsKey));
                          alert('ElevenLabs API Key saved!');
                        }
                      }}
                      className="btn-primary py-2 px-4 text-sm"
                    >
                      Save
                    </button>
                  </div>
                  <div className="text-xs text-muted leading-relaxed">
                    Get your API key from ElevenLabs to enable video translation.
                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <a href="https://elevenlabs.io/sign-up" target="_blank" rel="noopener noreferrer" className="p-2 border border-line rounded-lg hover:bg-stone transition-colors flex flex-col gap-1">
                        <span className="text-muted font-medium">1. Sign Up</span>
                        <span className="text-[10px] text-muted">Create account</span>
                      </a>
                      <a href="https://elevenlabs.io/app/settings/api-keys" target="_blank" rel="noopener noreferrer" className="p-2 border border-line rounded-lg hover:bg-stone transition-colors flex flex-col gap-1">
                        <span className="text-muted font-medium">2. API Key</span>
                        <span className="text-[10px] text-muted">Generate key</span>
                      </a>
                    </div>
                    <br />
                    <span className="text-muted italic">
                      Keys are only stored in your browser, and sent to the backend only to process your request.
                    </span>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* View: Exports — persistent library of all generated clips */}
          {activeTab === 'exports' && <ExportsView />}

          {/* View: Gallery */}
          {/* {activeTab === 'gallery' && (
            <Gallery />
          )} */}

          {/* View: Dashboard (Idle) */}
          {activeTab === 'dashboard' && status === 'idle' && (
            <div className="h-full flex flex-col items-center justify-center p-6 animate-[fadeIn_0.3s_ease-out]">
              <div className="max-w-xl w-full text-center space-y-8">
                <div className="space-y-4">
                  <h1 className="font-display text-ink text-4xl md:text-5xl leading-[1.05]">
                    Turn the sermon into<br />
                    <em className="font-display italic text-accent">moments worth sharing</em>
                  </h1>
                  <p className="text-muted text-lg">
                    Drop a full message and the AI finds the Scripture, the stories, and the one-liners — cut to vertical, ready to post.
                  </p>
                </div>

                <MediaInput onProcess={handleProcess} isProcessing={status === 'processing'} />
              </div>
            </div>
          )}

          {/* View: Processing / Results */}
          {activeTab === 'dashboard' && (status === 'processing' || status === 'complete' || status === 'error') && (
            <div className="h-full overflow-y-auto custom-scrollbar animate-[fadeIn_0.3s_ease-out]">
              <div className="max-w-3xl mx-auto px-6 py-12">

                {status === 'processing' && (() => {
                  const last = (logs.length ? logs[logs.length - 1] : '').toLowerCase();
                  const clipCount = results?.clips?.length || 0;
                  // Which step are we on? 0 transcribe · 1 find moments · 2 cut clips
                  let stage = 0;
                  if (clipCount > 0 || /clip|cut|reframe|scene|frame|processing video|merg|saved/.test(last)) stage = 2;
                  else if (/analyz|gemini|viral|moment/.test(last)) stage = 1;
                  const steps = ['Transcribing the sermon', 'Finding the best moments', 'Cutting & reframing clips'];
                  return (
                    <div className="space-y-10">
                      <div className="text-center space-y-2 pt-4">
                        <h2 className="font-display italic text-3xl text-ink">Working on your clips…</h2>
                        <p className="text-muted text-sm">Usually 2–5 minutes. You can leave this open while it works.</p>
                      </div>

                      {/* Step tracker */}
                      <div className="max-w-md mx-auto space-y-2.5">
                        {steps.map((label, i) => {
                          const state = i < stage ? 'done' : i === stage ? 'active' : 'pending';
                          return (
                            <div key={i} className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-colors ${state === 'active' ? 'border-primary/30 bg-primary/5' : 'border-line bg-surface'}`}>
                              <span className="w-6 h-6 shrink-0 flex items-center justify-center">
                                {state === 'done'
                                  ? <Check size={18} className="text-green-600" />
                                  : state === 'active'
                                    ? <span className="w-4 h-4 rounded-full border-2 border-line border-t-primary animate-spin" />
                                    : <span className="w-2 h-2 rounded-full bg-line" />}
                              </span>
                              <span className={`text-sm ${state === 'pending' ? 'text-muted' : 'text-ink font-medium'}`}>{label}</span>
                              {i === 2 && clipCount > 0 && (
                                <span className="ml-auto text-xs text-muted">{clipCount} so far</span>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Clips streaming in as they're cut */}
                      {clipCount > 0 && (
                        <div>
                          <div className="flex items-baseline justify-between mb-4">
                            <h3 className="font-display italic text-2xl text-ink">Clips so far</h3>
                            <span className="text-sm text-muted">{clipCount} ready</span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            {results.clips.map((clip, i) => (
                              <ResultCard key={i} clip={clip} index={i} jobId={jobId} geminiApiKey={apiKey} elevenLabsKey={elevenLabsKey} />
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="text-center pb-8">
                        <button onClick={handleReset} className="text-sm text-muted hover:text-ink transition-colors">Cancel</button>
                      </div>
                    </div>
                  );
                })()}

                {status === 'error' && (
                  <div className="flex flex-col items-center text-center py-24 space-y-5">
                    <h2 className="font-display italic text-3xl text-ink">That didn’t work</h2>
                    <p className="text-muted max-w-md">
                      {logs.length ? logs[logs.length - 1] : 'Something went wrong while processing the sermon.'}
                    </p>
                    <button onClick={handleReset} className="btn-primary">Try again</button>
                  </div>
                )}

                {status === 'complete' && (
                  <>
                    <div className="flex items-center justify-between mb-8">
                      <h2 className="font-display italic text-3xl text-ink">
                        Your clips
                        {results?.clips?.length > 0 && (
                          <span className="text-muted text-base ml-3 not-italic">· {results.clips.length} ready</span>
                        )}
                      </h2>
                      <button onClick={handleReset} className="text-sm text-muted hover:text-ink transition-colors flex items-center gap-1.5">
                        <PlusCircle size={15} /> New sermon
                      </button>
                    </div>

                    {results?.clips?.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pb-12">
                        {results.clips.map((clip, i) => (
                          <ResultCard
                            key={i}
                            clip={clip}
                            index={i}
                            jobId={jobId}
                            geminiApiKey={apiKey}
                            elevenLabsKey={elevenLabsKey}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-20 space-y-5">
                        <p className="text-muted">No clear moments were found in this one.</p>
                        <button onClick={handleReset} className="btn-primary">Try another sermon</button>
                      </div>
                    )}
                  </>
                )}

              </div>
            </div>
          )}

        </div>

      </main>

      {/* Missing API Key Modal */}
      {showKeyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowKeyModal(false)}>
          <div className="bg-surface border border-line rounded-2xl p-6 max-w-md w-full mx-4 space-y-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-display italic text-2xl text-ink">
              Gemini API Key Required
            </h2>
            <p className="text-sm text-muted">
              Sermon Note Clipper needs a <strong className="text-ink">Gemini</strong> API key (free tier available).
            </p>

            {/* Gemini block */}
            <div className={`rounded-lg p-4 space-y-2 border ${!apiKey ? 'bg-primary/5 border-primary/30' : 'bg-stone border-line opacity-70'}`}>
              <p className="text-xs font-semibold text-ink flex items-center gap-2">
                {apiKey ? <Check size={12} className="text-green-600" /> : <AlertTriangle size={12} className="text-amber-500" />}
                Gemini API Key {apiKey && <span className="text-green-600">— set</span>}
              </p>
              {!apiKey && (
                <>
                  <ol className="text-xs text-muted space-y-1 list-decimal list-inside">
                    <li>Go to <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-accent underline">aistudio.google.com/app/apikey</a></li>
                    <li>Sign in with your Google account</li>
                    <li>Click "Create API Key"</li>
                    <li>Copy the key and paste it below</li>
                  </ol>
                  <input
                    type="text"
                    placeholder="Paste your Gemini API key here..."
                    className="w-full bg-background border border-line rounded-lg px-4 py-2.5 text-sm text-ink placeholder-muted focus:outline-none focus:border-primary"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && e.target.value.trim()) {
                        setApiKey(e.target.value.trim());
                      }
                    }}
                  />
                </>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowKeyModal(false)}
                className="flex-1 text-sm text-muted py-2 rounded-lg border border-line hover:bg-stone transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => { setShowKeyModal(false); setActiveTab('settings'); }}
                className="flex-1 text-sm text-[#FBF8F4] py-2 rounded-lg bg-primary hover:bg-[#2f2624] transition-colors font-medium"
              >
                Go to Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
