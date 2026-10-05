import React from 'react';
import { X, Check, Stamp } from 'lucide-react';
import type { WatermarkConfig } from '../types';

interface WatermarkModalProps {
  watermark: WatermarkConfig;
  onChange: (newConfig: WatermarkConfig) => void;
  onClose: () => void;
}

export const WatermarkModal: React.FC<WatermarkModalProps> = ({
  watermark,
  onChange,
  onClose,
}) => {
  const presets = ['CONFIDENTIAL', 'DRAFT', 'APPROVED', 'FINAL', 'SAMPLE', 'DO NOT COPY'];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-2xl animate-ios-enter"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md ios-glass-popover rounded-3xl p-6 border border-white/10 shadow-2xl space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-orange-500/15 text-orange-400 flex items-center justify-center">
              <Stamp className="w-4 h-4" />
            </div>
            <h3 className="text-base font-semibold text-white">Watermark Settings</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-zinc-300 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Enable Watermark Toggle */}
        <div className="flex items-center justify-between p-3 rounded-2xl bg-black/50 border border-white/10">
          <span className="text-xs font-semibold text-white">Enable Watermark</span>
          <button
            type="button"
            onClick={() => onChange({ ...watermark, enabled: !watermark.enabled })}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
              watermark.enabled ? 'bg-[#0A84FF]' : 'bg-zinc-800'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                watermark.enabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Watermark text input */}
        <div className="space-y-2">
          <label className="text-xs text-zinc-400 font-medium">Watermark Text</label>
          <input
            type="text"
            value={watermark.text}
            onChange={(e) => onChange({ ...watermark, text: e.target.value })}
            placeholder="e.g. CONFIDENTIAL"
            className="w-full bg-black/60 border border-white/10 focus:border-[#0A84FF] rounded-xl px-3 py-2 text-xs text-white font-semibold"
          />

          {/* Preset chips */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {presets.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => onChange({ ...watermark, text: preset, enabled: true })}
                className={`text-[10px] px-2.5 py-1 rounded-full border transition-all cursor-pointer ${
                  watermark.text === preset
                    ? 'bg-[#0A84FF]/20 text-[#0A84FF] border-[#0A84FF]/40 font-medium'
                    : 'bg-white/5 text-zinc-400 hover:text-white border-white/5'
                }`}
              >
                {preset}
              </button>
            ))}
          </div>
        </div>

        {/* Sliders: Opacity & Size */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <div className="bg-black/50 p-3 rounded-xl border border-white/10 space-y-1">
            <div className="flex justify-between text-xs text-zinc-400">
              <span>Opacity</span>
              <span className="text-white font-mono">{Math.round(watermark.opacity * 100)}%</span>
            </div>
            <input
              type="range"
              min={0.05}
              max={0.8}
              step={0.05}
              value={watermark.opacity}
              onChange={(e) => onChange({ ...watermark, opacity: parseFloat(e.target.value) })}
              className="w-full accent-[#0A84FF] cursor-pointer"
            />
          </div>

          <div className="bg-black/50 p-3 rounded-xl border border-white/10 space-y-1">
            <div className="flex justify-between text-xs text-zinc-400">
              <span>Font Size</span>
              <span className="text-white font-mono">{watermark.fontSize}px</span>
            </div>
            <input
              type="range"
              min={24}
              max={96}
              step={4}
              value={watermark.fontSize}
              onChange={(e) => onChange({ ...watermark, fontSize: parseInt(e.target.value) })}
              className="w-full accent-[#0A84FF] cursor-pointer"
            />
          </div>
        </div>

        {/* Toggles: Diagonal & All Pages */}
        <div className="flex items-center justify-between text-xs text-zinc-300 pt-1">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={watermark.diagonal}
              onChange={(e) => onChange({ ...watermark, diagonal: e.target.checked })}
              className="rounded accent-[#0A84FF]"
            />
            <span>Diagonal Angle (45°)</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={watermark.allPages}
              onChange={(e) => onChange({ ...watermark, allPages: e.target.checked })}
              className="rounded accent-[#0A84FF]"
            />
            <span>Apply to All Pages</span>
          </label>
        </div>

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-[#0A84FF] hover:bg-blue-600 text-xs font-semibold text-white flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-blue-500/25"
        >
          <Check className="w-4 h-4" />
          <span>Save Watermark</span>
        </button>
      </div>
    </div>
  );
};
