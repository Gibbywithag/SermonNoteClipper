import React, { useState, useEffect } from 'react';
import { Download, Instagram, Video, AlertCircle, Loader2, Wand2, Type, Languages } from 'lucide-react';
import { getApiUrl } from '../config';
import SubtitleModal from './SubtitleModal';
import HookModal from './HookModal';
import TranslateModal from './TranslateModal';
import { renderInBrowser } from '../lib/renderInBrowser';

export default function ResultCard({ clip, index, jobId, geminiApiKey, elevenLabsKey }) {
    const [showSubtitleModal, setShowSubtitleModal] = useState(false);
    const videoRef = React.useRef(null);
    const originalVideoUrl = getApiUrl(clip.video_url); // Never changes — used for Remotion previews
    const [currentVideoUrl, setCurrentVideoUrl] = useState(originalVideoUrl);

    // Always holds the latest SERVER-RESIDENT clip filename (never a blob: segment).
    // In-browser (Remotion) edits update the display URL only; server edits update this.
    const [serverFilename, setServerFilename] = useState(() => clip.video_url.split('/').pop());

    const [isEditing, setIsEditing] = useState(false);
    const [isSubtitling, setIsSubtitling] = useState(false);
    const [isHooking, setIsHooking] = useState(false);
    const [isTranslating, setIsTranslating] = useState(false);
    const [showHookModal, setShowHookModal] = useState(false);
    const [showTranslateModal, setShowTranslateModal] = useState(false);
    const [editError, setEditError] = useState(null);

    const [clipDuration, setClipDuration] = useState(clip.end && clip.start ? clip.end - clip.start : 30);

    // Accumulate Remotion layers across operations
    const [activeLayers, setActiveLayers] = useState({ subtitles: null, hook: null, effects: null });

    // Fetch clip duration from transcript endpoint
    useEffect(() => {
        if (!jobId || index === undefined) return;
        fetch(getApiUrl(`/api/clip/${jobId}/${index}/transcript`))
            .then(res => res.ok ? res.json() : null)
            .then(data => {
                if (data && data.durationSec) setClipDuration(data.durationSec);
            })
            .catch(() => {});
    }, [jobId, index]);

    const handleAutoEdit = async () => {
        setIsEditing(true);
        setEditError(null);
        try {
            const apiKey = geminiApiKey || localStorage.getItem('gemini_key');

            if (!apiKey) {
                throw new Error("Gemini API Key is missing. Please set it in Settings.");
            }

            // Try Remotion effects endpoint first
            const effectsRes = await fetch(getApiUrl('/api/effects/generate'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Gemini-Key': apiKey
                },
                body: JSON.stringify({
                    job_id: jobId,
                    clip_index: index,
                    input_filename: serverFilename
                })
            });

            if (effectsRes.ok) {
                const data = await effectsRes.json();
                if (data.effects && data.effects.segments) {
                    const newLayers = { ...activeLayers, effects: data.effects };
                    setActiveLayers(newLayers);
                    const blobUrl = await renderInBrowser({
                        videoUrl: originalVideoUrl,
                        durationInSeconds: clipDuration,
                        subtitles: newLayers.subtitles,
                        hook: newLayers.hook,
                        effects: newLayers.effects,
                    });
                    setCurrentVideoUrl(blobUrl);
                    if (videoRef.current) videoRef.current.load();
                    return;
                }
            }

            // Fallback: legacy FFmpeg edit endpoint
            const res = await fetch(getApiUrl('/api/edit'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Gemini-Key': apiKey
                },
                body: JSON.stringify({
                    job_id: jobId,
                    clip_index: index,
                    input_filename: serverFilename
                })
            });

            if (!res.ok) {
                const errText = await res.text();
                try {
                    const jsonErr = JSON.parse(errText);
                    throw new Error(jsonErr.detail || errText);
                } catch (e) {
                    throw new Error(errText);
                }
            }

            const data = await res.json();
            if (data.new_video_url) {
                // Server produced a new server-resident file — track it for chaining.
                setServerFilename(data.new_video_url.split('/').pop());
                setCurrentVideoUrl(getApiUrl(data.new_video_url));
                if (videoRef.current) {
                    videoRef.current.load();
                }
            }

        } catch (e) {
            setEditError(e.message);
            setTimeout(() => setEditError(null), 5000);
        } finally {
            setIsEditing(false);
        }
    };

    const handleSubtitle = async (options) => {
        setIsSubtitling(true);
        setEditError(null);
        try {
            if (options.remotion) {
                // Accumulate layer and render all layers together
                const newLayers = { ...activeLayers, subtitles: options.remotion };
                setActiveLayers(newLayers);
                const blobUrl = await renderInBrowser({
                    videoUrl: originalVideoUrl,
                    durationInSeconds: clipDuration,
                    subtitles: newLayers.subtitles,
                    hook: newLayers.hook,
                    effects: newLayers.effects,
                });
                setCurrentVideoUrl(blobUrl);
                if (videoRef.current) videoRef.current.load();
                setShowSubtitleModal(false);
                return;
            }

            // Fallback: legacy FFmpeg
            const res = await fetch(getApiUrl('/api/subtitle'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    job_id: jobId,
                    clip_index: index,
                    position: options.position,
                    font_size: options.fontSize,
                    font_name: options.fontName,
                    font_color: options.fontColor,
                    border_color: options.borderColor,
                    border_width: options.borderWidth,
                    bg_color: options.bgColor,
                    bg_opacity: options.bgOpacity,
                    input_filename: serverFilename
                })
            });

            if (!res.ok) throw new Error(await res.text());
            const data = await res.json();
            if (data.new_video_url) {
                setServerFilename(data.new_video_url.split('/').pop());
                setCurrentVideoUrl(getApiUrl(data.new_video_url));
                if (videoRef.current) videoRef.current.load();
                setShowSubtitleModal(false);
            }
        } catch (e) {
            setEditError(e.message);
            setTimeout(() => setEditError(null), 5000);
        } finally {
            setIsSubtitling(false);
        }
    };

    const handleHook = async (hookData) => {
        setIsHooking(true);
        setEditError(null);
        try {
            if (hookData.remotion) {
                // Accumulate layer and render all layers together
                const newLayers = { ...activeLayers, hook: hookData.remotion };
                setActiveLayers(newLayers);
                const blobUrl = await renderInBrowser({
                    videoUrl: originalVideoUrl,
                    durationInSeconds: clipDuration,
                    subtitles: newLayers.subtitles,
                    hook: newLayers.hook,
                    effects: newLayers.effects,
                });
                setCurrentVideoUrl(blobUrl);
                if (videoRef.current) videoRef.current.load();
                setShowHookModal(false);
                return;
            }

            // Fallback: legacy FFmpeg
            const payload = typeof hookData === 'string'
                ? { text: hookData, position: 'top', size: 'M' }
                : hookData;

            const res = await fetch(getApiUrl('/api/hook'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    job_id: jobId,
                    clip_index: index,
                    text: payload.text,
                    position: payload.position,
                    size: payload.size,
                    input_filename: serverFilename
                })
            });

            if (!res.ok) throw new Error(await res.text());
            const data = await res.json();
            if (data.new_video_url) {
                setServerFilename(data.new_video_url.split('/').pop());
                setCurrentVideoUrl(getApiUrl(data.new_video_url));
                if (videoRef.current) videoRef.current.load();
                setShowHookModal(false);
            }
        } catch (e) {
            setEditError(e.message);
            setTimeout(() => setEditError(null), 5000);
        } finally {
            setIsHooking(false);
        }
    };

    const handleTranslate = async (options) => {
        setIsTranslating(true);
        setEditError(null);
        try {
            const apiKey = elevenLabsKey;

            if (!apiKey) {
                throw new Error("ElevenLabs API Key is missing. Please set it in Settings.");
            }

            const requestBody = {
                job_id: jobId,
                clip_index: index,
                target_language: options.targetLanguage,
                input_filename: serverFilename
            };

            const res = await fetch(getApiUrl('/api/translate'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-ElevenLabs-Key': apiKey
                },
                body: JSON.stringify(requestBody)
            });

            if (!res.ok) {
                const errText = await res.text();
                if (import.meta.env.DEV) { console.error('[Translate] Error response:', errText); }
                try {
                    const jsonErr = JSON.parse(errText);
                    throw new Error(jsonErr.detail || errText);
                } catch (e) {
                    if (e.message !== errText) throw e;
                    throw new Error(errText);
                }
            }

            const data = await res.json();
            if (data.new_video_url) {
                setServerFilename(data.new_video_url.split('/').pop());
                setCurrentVideoUrl(getApiUrl(data.new_video_url));
                if (videoRef.current) {
                    videoRef.current.load();
                }
                setShowTranslateModal(false);
            }

        } catch (e) {
            if (import.meta.env.DEV) { console.error('[Translate] Exception:', e); }
            setEditError(e.message);
            setTimeout(() => setEditError(null), 5000);
        } finally {
            setIsTranslating(false);
        }
    };

    return (
        <div className="bg-surface border border-line rounded-2xl overflow-hidden flex flex-col md:flex-row group hover:border-primary/20 hover:shadow-[0_18px_44px_-26px_rgba(70,57,55,0.28)] transition-all animate-[fadeIn_0.5s_ease-out] min-h-[300px] h-auto" style={{ animationDelay: `${index * 0.1}s` }}>
            {/* Left: Video Preview (Responsive Width) */}
            <div className="w-full md:w-[180px] lg:w-[200px] bg-ink relative shrink-0 aspect-[9/16] md:aspect-auto group/video">
                <video
                    ref={videoRef}
                    src={currentVideoUrl}
                    controls
                    className="w-full h-full object-cover"
                    playsInline
                    onEnded={() => {
                        if (videoRef.current) {
                            videoRef.current.currentTime = 0;
                            videoRef.current.play();
                        }
                    }}
                />
                <div className="absolute top-3 left-3 flex gap-2">
                    <span className="bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-md border border-white/10 uppercase tracking-wide">
                        Clip {index + 1}
                    </span>
                </div>

                {/* Auto Edit Overlay if Processing */}
                {isEditing && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center z-10 p-4 text-center">
                        <Loader2 size={32} className="text-[#E7C9B8] animate-spin mb-3" />
                        <span className="text-xs font-bold text-white uppercase tracking-wider">AI Magic in Progress...</span>
                        <span className="text-[10px] text-white/70 mt-1">Applying viral edits & zooms</span>
                    </div>
                )}
            </div>

            {/* Right: Content & Details */}
            <div className="flex-1 p-5 md:p-6 flex flex-col bg-surface overflow-hidden min-w-0">
                <div className="mb-5">
                    <h3 className="text-base font-bold text-ink leading-snug line-clamp-2 mb-2.5 break-words" title={clip.video_title_for_youtube_short}>
                        {clip.video_title_for_youtube_short || "Viral Clip Generated"}
                    </h3>
                    <div className="flex flex-wrap gap-2 text-[10px] text-muted font-mono">
                        <span className="bg-stone px-1.5 py-0.5 rounded border border-line shrink-0">{Math.floor(clip.end - clip.start)}s</span>
                        <span className="bg-stone px-1.5 py-0.5 rounded border border-line shrink-0">#shorts</span>
                        <span className="bg-stone px-1.5 py-0.5 rounded border border-line shrink-0">#viral</span>
                    </div>
                </div>

                {/* Scrollable Descriptions Area */}
                <div className="flex-1 overflow-y-auto custom-scrollbar mb-5">
                    {/* TikTok / IG Caption */}
                    <div className="bg-stone rounded-xl p-4 border border-line">
                        <div className="flex items-center gap-2 text-[10px] font-bold text-muted mb-2 uppercase tracking-wider">
                            <Video size={12} className="text-cyan-600 shrink-0" />
                            <span className="text-muted">/</span>
                            <Instagram size={12} className="text-pink-500 shrink-0" />
                            <span className="truncate">Caption</span>
                        </div>
                        <p className="text-xs leading-relaxed text-ink/80 line-clamp-4 hover:line-clamp-none transition-all cursor-pointer select-all break-words">
                            {clip.video_description_for_tiktok || clip.video_description_for_instagram}
                        </p>
                    </div>
                </div>

                {/* Error Message */}
                {editError && (
                    <div className="mb-3 p-2 bg-red-600/10 border border-red-600/20 text-red-700 text-[10px] rounded-lg flex items-center gap-2">
                        <AlertCircle size={12} className="shrink-0" />
                        {editError}
                    </div>
                )}

                {/* Actions Footer */}
                <div className="mt-auto pt-5 border-t border-line space-y-3">
                    {/* Primary action: Download */}
                    <button
                        onClick={async (e) => {
                            e.preventDefault();
                            try {
                                const response = await fetch(currentVideoUrl);
                                if (!response.ok) throw new Error('Download failed');
                                const blob = await response.blob();
                                const url = window.URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.style.display = 'none';
                                a.href = url;
                                a.download = `clip-${index + 1}.mp4`;
                                document.body.appendChild(a);
                                a.click();
                                window.URL.revokeObjectURL(url);
                                document.body.removeChild(a);
                            } catch (err) {
                                if (import.meta.env.DEV) { console.error('Download error:', err); }
                                window.open(currentVideoUrl, '_blank', 'noopener,noreferrer');
                            }
                        }}
                        className="btn-primary w-full !py-2.5 !rounded-lg text-sm flex items-center justify-center gap-2"
                    >
                        <Download size={16} className="shrink-0" /> Download Clip
                    </button>

                    {/* Secondary "enhance" actions — subordinate ghost buttons */}
                    <div className="grid grid-cols-2 gap-2.5">
                        <button
                            onClick={handleAutoEdit}
                            disabled={isEditing}
                            className="px-3 py-2 bg-stone hover:bg-line/60 text-ink border border-line rounded-lg text-xs font-medium transition-colors active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-1.5 whitespace-nowrap"
                        >
                            {isEditing ? <Loader2 size={13} className="animate-spin shrink-0" /> : <Wand2 size={13} className="text-muted shrink-0" />}
                            {isEditing ? 'Editing…' : 'Auto Edit'}
                        </button>

                        <button
                            onClick={() => setShowSubtitleModal(true)}
                            disabled={isSubtitling}
                            className="px-3 py-2 bg-stone hover:bg-line/60 text-ink border border-line rounded-lg text-xs font-medium transition-colors active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-1.5 whitespace-nowrap"
                        >
                            {isSubtitling ? <Loader2 size={13} className="animate-spin shrink-0" /> : <Type size={13} className="text-muted shrink-0" />}
                            {isSubtitling ? 'Adding…' : 'Subtitles'}
                        </button>

                        <button
                            onClick={() => setShowHookModal(true)}
                            disabled={isHooking}
                            className="px-3 py-2 bg-stone hover:bg-line/60 text-ink border border-line rounded-lg text-xs font-medium transition-colors active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-1.5 whitespace-nowrap"
                        >
                            {isHooking ? <Loader2 size={13} className="animate-spin shrink-0" /> : <Wand2 size={13} className="text-muted shrink-0" />}
                            {isHooking ? 'Adding…' : 'Viral Hook'}
                        </button>

                        <button
                            onClick={() => setShowTranslateModal(true)}
                            disabled={isTranslating}
                            className="px-3 py-2 bg-stone hover:bg-line/60 text-ink border border-line rounded-lg text-xs font-medium transition-colors active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-1.5 whitespace-nowrap"
                        >
                            {isTranslating ? <Loader2 size={13} className="animate-spin shrink-0" /> : <Languages size={13} className="text-muted shrink-0" />}
                            {isTranslating ? 'Dubbing…' : 'Dub Voice'}
                        </button>
                    </div>
                </div>
            </div>

            <SubtitleModal
                isOpen={showSubtitleModal}
                onClose={() => setShowSubtitleModal(false)}
                onGenerate={handleSubtitle}
                isProcessing={isSubtitling}
                videoUrl={originalVideoUrl}
                jobId={jobId}
                clipIndex={index}
                existingHook={activeLayers.hook}
            />

            <HookModal
                isOpen={showHookModal}
                onClose={() => setShowHookModal(false)}
                onGenerate={handleHook}
                isProcessing={isHooking}
                videoUrl={originalVideoUrl}
                initialText={clip.viral_hook_text}
                durationInSeconds={clip.end && clip.start ? clip.end - clip.start : 30}
                existingSubtitles={activeLayers.subtitles}
            />

            <TranslateModal
                isOpen={showTranslateModal}
                onClose={() => setShowTranslateModal(false)}
                onTranslate={handleTranslate}
                isProcessing={isTranslating}
                videoUrl={currentVideoUrl}
                hasApiKey={!!elevenLabsKey}
            />

        </div>
    );
}
