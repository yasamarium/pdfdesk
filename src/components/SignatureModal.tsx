import React, { useRef, useState, useEffect } from 'react';
import { X, Check, Trash2, PenTool, Type } from 'lucide-react';

interface SignatureModalProps {
  onClose: () => void;
  onSaveSignature: (dataUrl: string) => void;
}

export const SignatureModal: React.FC<SignatureModalProps> = ({ onClose, onSaveSignature }) => {
  const [tab, setTab] = useState<'draw' | 'type'>('draw');
  const [typedName, setTypedName] = useState<string>('John Doe');
  const [color, setColor] = useState<string>('#0A84FF');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef<boolean>(false);

  // Initialize canvas
  useEffect(() => {
    if (tab === 'draw') {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth = 3;
      ctx.strokeStyle = color;
    }
  }, [tab, color]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    isDrawingRef.current = true;
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    isDrawingRef.current = false;
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const handleApply = () => {
    if (tab === 'draw') {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const dataUrl = canvas.toDataURL('image/png');
      onSaveSignature(dataUrl);
    } else {
      // Render typed signature to canvas
      const canvas = document.createElement('canvas');
      canvas.width = 400;
      canvas.height = 150;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = color;
        ctx.font = 'italic 42px "Brush Script MT", "Caveat", "Segoe Script", cursive';
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'center';
        ctx.fillText(typedName, 200, 75);
      }
      onSaveSignature(canvas.toDataURL('image/png'));
    }
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-2xl animate-ios-enter"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg ios-glass-popover rounded-3xl p-6 border border-white/10 shadow-2xl space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-white">Create Signature</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-zinc-300 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab selection */}
        <div className="flex rounded-xl bg-black/50 p-1 border border-white/10">
          <button
            onClick={() => setTab('draw')}
            className={`flex-1 py-1.5 text-xs font-medium rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              tab === 'draw' ? 'bg-[#0A84FF] text-white shadow-sm' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <PenTool className="w-3.5 h-3.5" />
            <span>Draw with Mouse / Finger</span>
          </button>
          <button
            onClick={() => setTab('type')}
            className={`flex-1 py-1.5 text-xs font-medium rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              tab === 'type' ? 'bg-[#0A84FF] text-white shadow-sm' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Type className="w-3.5 h-3.5" />
            <span>Type Signature</span>
          </button>
        </div>

        {/* Color picker */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-400">Ink Color:</span>
          {['#0A84FF', '#000000', '#FFFFFF', '#30D158', '#FF453A'].map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className={`w-6 h-6 rounded-full border-2 transition-transform cursor-pointer ${
                color === c ? 'scale-110 border-white' : 'border-transparent'
              }`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>

        {/* Canvas or Type Area */}
        {tab === 'draw' ? (
          <div className="relative rounded-2xl bg-zinc-950 border border-white/10 overflow-hidden">
            <canvas
              ref={canvasRef}
              width={460}
              height={180}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              className="w-full h-44 cursor-crosshair touch-none"
            />
            <div className="absolute bottom-2 right-2">
              <button
                type="button"
                onClick={handleClear}
                className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-xs text-zinc-300 flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3 h-3" />
                <span>Clear</span>
              </button>
            </div>
            <div className="absolute bottom-2 left-3 pointer-events-none text-[10px] text-zinc-600">
              Sign above with mouse or touch
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <input
              type="text"
              value={typedName}
              onChange={(e) => setTypedName(e.target.value)}
              placeholder="Your Name"
              className="w-full bg-black/60 border border-white/10 focus:border-[#0A84FF] rounded-xl px-3 py-2 text-sm text-white"
            />
            <div className="h-28 rounded-2xl bg-zinc-950 border border-white/10 flex items-center justify-center p-4">
              <span
                style={{ color, fontFamily: 'cursive' }}
                className="text-3xl italic font-serif select-none"
              >
                {typedName || 'Signature Preview'}
              </span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-zinc-300 font-medium cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="flex-1 py-2.5 rounded-xl bg-[#0A84FF] hover:bg-blue-600 text-xs text-white font-semibold flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-blue-500/25"
          >
            <Check className="w-4 h-4" />
            <span>Apply Signature</span>
          </button>
        </div>
      </div>
    </div>
  );
};
