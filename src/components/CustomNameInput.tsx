import React from 'react';
import { Edit3, Sparkles, X, Check } from 'lucide-react';

interface CustomNameInputProps {
  value: string;
  originalName: string;
  rangeString: string;
  selectedCount: number;
  isZip: boolean;
  onChange: (newName: string) => void;
  className?: string;
}

export const CustomNameInput: React.FC<CustomNameInputProps> = ({
  value,
  originalName,
  rangeString,
  selectedCount,
  isZip,
  onChange,
  className = '',
}) => {
  const extension = isZip ? '.zip' : '.pdf';
  const cleanOriginal = originalName.replace(/\.pdf$/i, '').trim() || 'document';

  // Sanitize filename to avoid filesystem errors
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const sanitized = raw.replace(/[<>:"/\\|?*]/g, '');
    onChange(sanitized);
  };

  // Preset generators
  const presets = [
    {
      label: 'Default Split',
      name: `${cleanOriginal}_split`,
    },
    {
      label: rangeString ? `Pages (${rangeString})` : 'Range',
      name: rangeString ? `${cleanOriginal}_pages_${rangeString.replace(/\s+/g, '')}` : `${cleanOriginal}_pages`,
    },
    {
      label: `${selectedCount} Pages`,
      name: `${cleanOriginal}_${selectedCount}pages`,
    },
    {
      label: 'Date Stamp',
      name: `${cleanOriginal}_${new Date().toISOString().slice(0, 10)}`,
    },
  ];

  return (
    <div className={`space-y-2.5 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5 uppercase tracking-wider">
          <Edit3 className="w-3.5 h-3.5 text-[#0A84FF]" />
          <span>Export File Name</span>
        </label>
        <span className="text-[11px] text-zinc-500 font-mono">
          Extension: <strong className="text-zinc-300">{extension}</strong>
        </span>
      </div>

      {/* Input container */}
      <div className="relative flex items-center group">
        <div className="w-full flex items-center rounded-2xl bg-black/60 border border-white/10 group-focus-within:border-[#0A84FF] group-focus-within:ring-2 group-focus-within:ring-[#0A84FF]/20 transition-all overflow-hidden px-3 py-2">
          <input
            type="text"
            value={value}
            onChange={handleInputChange}
            placeholder="Enter custom file name"
            className="flex-1 bg-transparent text-sm text-white placeholder:text-zinc-600 focus:outline-none font-medium truncate"
          />

          {value && (
            <button
              type="button"
              onClick={() => onChange('')}
              className="p-1 rounded-full text-zinc-500 hover:text-white hover:bg-white/10 transition-all cursor-pointer mr-1"
              title="Clear file name"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Locked extension badge */}
          <span className="px-2 py-0.5 rounded-lg bg-white/10 text-zinc-300 text-xs font-mono font-medium shrink-0 border border-white/5 select-none">
            {extension}
          </span>
        </div>
      </div>

      {/* Quick Suggestion Chips */}
      <div className="flex flex-wrap items-center gap-1.5 pt-1">
        <span className="text-[10px] text-zinc-500 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-[#0A84FF]" />
          <span>Quick:</span>
        </span>
        {presets.map((preset, index) => {
          const isSelected = value === preset.name;
          return (
            <button
              key={index}
              type="button"
              onClick={() => onChange(preset.name)}
              className={`text-[10px] px-2.5 py-1 rounded-full transition-all cursor-pointer border ${
                isSelected
                  ? 'bg-[#0A84FF]/20 text-[#0A84FF] border-[#0A84FF]/40 font-medium'
                  : 'bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-zinc-200 border-white/5'
              }`}
            >
              {isSelected && <Check className="w-2.5 h-2.5 inline mr-1" />}
              {preset.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};
