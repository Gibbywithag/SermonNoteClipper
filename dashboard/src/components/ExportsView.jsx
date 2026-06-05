import React, { useState, useEffect } from 'react';
import { Download, RefreshCw, FolderOpen, Loader2 } from 'lucide-react';
import { getApiUrl } from '../config';

// Persistent library of every clip on disk. Reads from /api/exports, which scans
// the output folder — so clips survive navigating away, refreshes, and restarts.
export default function ExportsView() {
  const [exports, setExports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(getApiUrl('/api/exports'));
      if (!res.ok) throw new Error('Could not load exports.');
      const data = await res.json();
      setExports(data.exports || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const download = async (clip, label, idx) => {
    const url = getApiUrl(clip.video_url);
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error('Download failed');
      const blob = await res.blob();
      const a = document.createElement('a');
      a.href = window.URL.createObjectURL(blob);
      const safe = (label || 'clip').replace(/[^a-z0-9]+/gi, '-').toLowerCase().slice(0, 40);
      a.download = `${safe}-clip-${idx + 1}.mp4`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(a.href);
      document.body.removeChild(a);
    } catch (e) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const totalClips = exports.reduce((n, e) => n + (e.clips ? e.clips.length : 0), 0);

  return (
    <div className="h-full overflow-y-auto custom-scrollbar p-8 animate-[fadeIn_0.3s_ease-out]">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-display italic text-3xl text-ink">
            Exports
            {totalClips > 0 && <span className="text-muted text-base ml-3 not-italic">· {totalClips} clips</span>}
          </h1>
          <button onClick={load} className="text-sm text-muted hover:text-ink transition-colors flex items-center gap-1.5">
            <RefreshCw size={15} /> Refresh
          </button>
        </div>

        {loading && (
          <div className="flex flex-col items-center justify-center py-24 text-muted">
            <Loader2 size={28} className="animate-spin mb-3" />
            <span className="text-sm">Loading your clips…</span>
          </div>
        )}

        {!loading && error && (
          <div className="text-center py-20 text-muted">{error}</div>
        )}

        {!loading && !error && exports.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <FolderOpen size={36} className="text-line mb-4" />
            <h2 className="font-display italic text-xl text-ink mb-1">No exports yet</h2>
            <p className="text-muted text-sm">Generate clips from a sermon and they’ll live here — always one click away.</p>
          </div>
        )}

        {!loading && !error && exports.map((exp) => (
          <div key={exp.job_id} className="mb-10">
            <div className="flex items-baseline gap-3 mb-4">
              <h2 className="text-sm font-semibold text-ink">{exp.label}</h2>
              <span className="text-xs text-muted">{exp.clips.length} clip{exp.clips.length === 1 ? '' : 's'}</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
              {exp.clips.map((clip, i) => (
                <div key={i} className="bg-surface border border-line rounded-2xl overflow-hidden flex flex-col hover:border-primary/30 hover:shadow-[0_18px_44px_-26px_rgba(70,57,55,0.28)] transition-all">
                  <div className="bg-ink aspect-[9/16] relative">
                    <video src={getApiUrl(clip.video_url)} controls playsInline className="w-full h-full object-cover" />
                    <span className="absolute top-2 left-2 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wide">Clip {i + 1}</span>
                  </div>
                  <div className="p-3 flex flex-col gap-3 flex-1">
                    <p className="text-xs text-ink font-medium leading-snug line-clamp-2 flex-1" title={clip.title}>{clip.title}</p>
                    <button onClick={() => download(clip, exp.label, i)} className="btn-primary w-full !py-2 !rounded-lg text-xs flex items-center justify-center gap-1.5">
                      <Download size={14} /> Download
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
