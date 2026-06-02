import React from 'react';
import { Scissors, Upload, Sparkles, ArrowRight } from 'lucide-react';

const StepCard = ({ number, icon: Icon, title, description }) => (
  <div className="flex gap-4 items-start">
    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-sm">
      {number}
    </div>
    <div>
      <h3 className="text-ink font-semibold mb-1 flex items-center gap-2">
        <Icon size={16} className="text-primary" />
        {title}
      </h3>
      <p className="text-muted text-sm leading-relaxed">{description}</p>
    </div>
  </div>
);

export default function Landing({ onLaunchApp }) {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8">
      <div className="max-w-2xl w-full text-center space-y-8">
        {/* Logo & Title */}
        <div className="space-y-4">
          <div className="text-6xl mb-4">✂️</div>
          <h1 className="font-display text-5xl text-ink tracking-tight">
            Sermon Note <em className="font-display italic text-accent">Clipper</em>
          </h1>
          <p className="text-xl text-muted max-w-lg mx-auto">
            Turn sermon recordings into powerful 45-60 second clips for Instagram Reels, TikTok, and YouTube Shorts.
          </p>
        </div>

        {/* How it works */}
        <div className="glass-panel p-8 text-left space-y-6">
          <h2 className="text-lg font-semibold text-ink text-center mb-4">How It Works</h2>
          <StepCard
            number="1"
            icon={Upload}
            title="Upload your sermon"
            description="Drop a video file or paste a YouTube link of the full sermon recording."
          />
          <StepCard
            number="2"
            icon={Sparkles}
            title="AI finds the best moments"
            description="Google Gemini AI identifies Scripture references, key illustrations, application points, emotional peaks, and memorable one-liners."
          />
          <StepCard
            number="3"
            icon={Scissors}
            title="Download your clips"
            description="Each clip is 45-60 seconds, vertical (9:16), with auto-generated subtitles and captions optimized for each platform — ready to download and post."
          />
        </div>

        {/* Launch Button */}
        <button
          onClick={onLaunchApp}
          className="inline-flex items-center gap-2 px-8 py-4 bg-primary hover:bg-[#2f2624] text-[#FBF8F4] font-semibold rounded-xl transition-all duration-200 text-lg shadow-lg shadow-primary/20 hover:shadow-primary/30"
        >
          Launch Sermon Clipper
          <ArrowRight size={20} />
        </button>

        <p className="text-muted text-sm">
          Requires a free Google Gemini API key.{' '}
          <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
            Get one here
          </a>
        </p>
      </div>
    </div>
  );
}
