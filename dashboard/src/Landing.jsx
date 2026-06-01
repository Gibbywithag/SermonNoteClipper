import React from 'react';
import { Scissors, Upload, Sparkles, Share2, ArrowRight } from 'lucide-react';

const StepCard = ({ number, icon: Icon, title, description }) => (
  <div className="flex gap-4 items-start">
    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-bold text-sm">
      {number}
    </div>
    <div>
      <h3 className="text-white font-semibold mb-1 flex items-center gap-2">
        <Icon size={16} className="text-primary" />
        {title}
      </h3>
      <p className="text-zinc-400 text-sm leading-relaxed">{description}</p>
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
          <h1 className="text-4xl font-bold text-white tracking-tight">
            Sermon Note Clipper
          </h1>
          <p className="text-xl text-zinc-400 max-w-lg mx-auto">
            Turn sermon recordings into powerful 45-60 second clips for Instagram Reels, TikTok, and YouTube Shorts.
          </p>
        </div>

        {/* How it works */}
        <div className="bg-surface/50 backdrop-blur-xl border border-white/10 rounded-2xl p-8 text-left space-y-6">
          <h2 className="text-lg font-semibold text-white text-center mb-4">How It Works</h2>
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
            title="Get ready-to-post clips"
            description="Each clip is 45-60 seconds, vertical (9:16), with auto-generated subtitles and captions optimized for each platform."
          />
          <StepCard
            number="4"
            icon={Share2}
            title="Post to social media"
            description="Download clips or publish directly to Instagram, TikTok, and YouTube Shorts."
          />
        </div>

        {/* Launch Button */}
        <button
          onClick={onLaunchApp}
          className="inline-flex items-center gap-2 px-8 py-4 bg-primary hover:bg-primary/90 text-white font-semibold rounded-xl transition-all duration-200 text-lg shadow-lg shadow-primary/20 hover:shadow-primary/30"
        >
          Launch Sermon Clipper
          <ArrowRight size={20} />
        </button>

        <p className="text-zinc-500 text-sm">
          Requires a free Google Gemini API key.{' '}
          <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener" className="text-primary hover:underline">
            Get one here
          </a>
        </p>
      </div>
    </div>
  );
}
