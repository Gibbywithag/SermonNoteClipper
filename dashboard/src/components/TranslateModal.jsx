import React, { useState } from 'react';
import { X, Loader2, Globe, Languages, AlertCircle } from 'lucide-react';

const LANGUAGES = {
    "es": "Spanish",
    "fr": "French",
    "de": "German",
    "it": "Italian",
    "pt": "Portuguese",
    "pl": "Polish",
    "hi": "Hindi",
    "ja": "Japanese",
    "ko": "Korean",
    "zh": "Chinese",
    "ar": "Arabic",
    "ru": "Russian",
    "tr": "Turkish",
    "nl": "Dutch",
    "sv": "Swedish",
    "id": "Indonesian",
    "fil": "Filipino",
    "ms": "Malay",
    "vi": "Vietnamese",
    "th": "Thai",
    "uk": "Ukrainian",
    "el": "Greek",
    "cs": "Czech",
    "fi": "Finnish",
    "ro": "Romanian",
    "da": "Danish",
    "bg": "Bulgarian",
    "hr": "Croatian",
    "sk": "Slovak",
    "ta": "Tamil",
    "en": "English",
};

export default function TranslateModal({ isOpen, onClose, onTranslate, isProcessing, videoUrl, hasApiKey }) {
    const [targetLanguage, setTargetLanguage] = useState('es');

    if (!isOpen) return null;

    const handleSubmit = () => {
        onTranslate({ targetLanguage });
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
            <div className="bg-surface border border-line p-6 rounded-2xl w-full max-w-md shadow-2xl relative">
                <button
                    onClick={onClose}
                    disabled={isProcessing}
                    className="absolute top-4 right-4 text-muted hover:text-ink disabled:opacity-50"
                >
                    <X size={20} />
                </button>

                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                        <Languages size={20} className="text-[#FBF8F4]" />
                    </div>
                    <div>
                        <h3 className="font-display italic text-2xl text-ink">Dub Voice</h3>
                        <p className="text-xs text-muted">AI voice translation by ElevenLabs</p>
                    </div>
                </div>

                {!hasApiKey && (
                    <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/30 text-amber-700 text-xs rounded-lg flex items-start gap-2">
                        <AlertCircle size={14} className="mt-0.5 shrink-0" />
                        <div>Configure ElevenLabs API Key in Settings first.</div>
                    </div>
                )}

                {/* Preview */}
                <div className="mb-6 rounded-xl overflow-hidden bg-black aspect-video relative">
                    <video
                        src={videoUrl}
                        className="w-full h-full object-contain"
                        muted
                        playsInline
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
                </div>

                {/* Language Selection */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-muted mb-2">
                        <Globe size={14} className="inline mr-2" />
                        Target Language
                    </label>
                    <select
                        value={targetLanguage}
                        onChange={(e) => setTargetLanguage(e.target.value)}
                        className="w-full bg-background border border-line rounded-lg p-3 text-sm text-ink focus:outline-none focus:border-primary/50 appearance-none cursor-pointer"
                        disabled={isProcessing}
                    >
                        {Object.entries(LANGUAGES).sort((a, b) => a[1].localeCompare(b[1])).map(([code, name]) => (
                            <option key={code} value={code}>
                                {name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Info */}
                <div className="mb-6 p-3 bg-accent/10 border border-accent/20 rounded-lg">
                    <p className="text-xs text-accent">
                        The audio will be dubbed with AI-generated voice in the selected language, matching the original speaker's characteristics.
                    </p>
                </div>

                {/* Processing State */}
                {isProcessing && (
                    <div className="mb-4 p-4 bg-stone rounded-lg border border-line">
                        <div className="flex items-center gap-3">
                            <Loader2 size={20} className="text-primary animate-spin" />
                            <div>
                                <p className="text-sm text-ink font-medium">Dubbing audio...</p>
                                <p className="text-xs text-muted">This may take a few minutes</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        disabled={isProcessing}
                        className="flex-1 py-3 bg-stone hover:bg-line/60 text-ink rounded-xl font-medium transition-colors disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isProcessing || !hasApiKey}
                        className="flex-1 py-3 bg-primary hover:bg-[#2f2624] text-[#FBF8F4] rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isProcessing ? (
                            <>
                                <Loader2 size={16} className="animate-spin" />
                                Dubbing...
                            </>
                        ) : (
                            <>
                                <Languages size={16} />
                                Dub Voice
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
