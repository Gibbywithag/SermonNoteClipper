import React, { useState } from 'react';
import { Upload, FileVideo, X } from 'lucide-react';

export default function MediaInput({ onProcess, isProcessing }) {
    const [file, setFile] = useState(null);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (file) onProcess({ type: 'file', payload: file, acknowledged: true });
    };

    const handleDrop = (e) => {
        e.preventDefault();
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setFile(e.dataTransfer.files[0]);
        }
    };

    return (
        <div className="glass-panel p-6 animate-[fadeIn_0.6s_ease-out]">
            <form onSubmit={handleSubmit}>
                <div
                    className={`border-2 border-dashed rounded-xl p-10 text-center transition-all ${file ? 'border-primary/50 bg-primary/5' : 'border-line hover:border-muted bg-stone'}`}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                >
                    {file ? (
                        <div className="flex items-center justify-center gap-3 text-ink">
                            <FileVideo className="text-primary" />
                            <span className="font-medium truncate max-w-[260px]">{file.name}</span>
                            <button
                                type="button"
                                onClick={() => setFile(null)}
                                className="p-1 hover:bg-line/60 rounded-full shrink-0"
                                title="Remove"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    ) : (
                        <label className="cursor-pointer block">
                            <input
                                type="file"
                                accept="video/*"
                                onChange={(e) => setFile(e.target.files?.[0] || null)}
                                className="hidden"
                            />
                            <Upload className="mx-auto mb-3 text-muted" size={26} />
                            <p className="text-ink font-medium">Choose a sermon video</p>
                            <p className="text-xs text-muted mt-1">Click to upload, or drag &amp; drop — MP4 or MOV</p>
                        </label>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={isProcessing || !file}
                    className="w-full btn-primary mt-5 flex items-center justify-center gap-2"
                >
                    {isProcessing ? (
                        <>
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Processing…
                        </>
                    ) : (
                        'Generate Clips'
                    )}
                </button>
            </form>
        </div>
    );
}
