import React, { useState, useRef } from 'react';
import { useSystem } from '../context/SystemContext';
import { Save, Trash2, Eraser, Pen, PaintBucket } from 'lucide-react';

export const PixelEditor: React.FC<{ onSave: () => void }> = ({ onSave }) => {
  const { pet, setPet } = useSystem();
  
  const [pixels, setPixels] = useState<string[]>(() => {
    if (pet.customSprite && pet.customSprite.length === 1024) {
      return pet.customSprite.split('');
    }
    return new Array(1024).fill('0');
  });

  const [palette, setPalette] = useState<string[]>(pet.palette || ['#ffffff', '#ff0000', '#00ff00', '#0000ff']);
  const [selectedColorIdx, setSelectedColorIdx] = useState('1'); // '1'-'4'
  const [tool, setTool] = useState<'pen' | 'eraser' | 'fill'>('pen');
  const [isDrawing, setIsDrawing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const clearCanvas = () => {
    if (confirm('Clear entire canvas?')) {
      setPixels(new Array(1024).fill('0'));
    }
  };

  const updatePixel = (index: number) => {
    if (index < 0 || index >= 1024) return;
    if (tool === 'fill') {
      handleFill(index);
      return;
    }
    const newPixels = [...pixels];
    newPixels[index] = tool === 'pen' ? selectedColorIdx : '0';
    setPixels(newPixels);
  };

  const handleFill = (startIndex: number) => {
    const targetValue = pixels[startIndex];
    const fillWith = tool === 'pen' || tool === 'fill' ? selectedColorIdx : '0';
    
    if (targetValue === fillWith) return;

    const newPixels = [...pixels];
    const stack = [startIndex];
    const visited = new Set();

    while (stack.length > 0) {
      const idx = stack.pop()!;
      if (visited.has(idx)) continue;
      visited.add(idx);

      if (newPixels[idx] === targetValue) {
        newPixels[idx] = fillWith;
        const x = idx % 32;
        const y = Math.floor(idx / 32);
        if (x > 0) stack.push(idx - 1);
        if (x < 31) stack.push(idx + 1);
        if (y > 0) stack.push(idx - 32);
        if (y < 31) stack.push(idx + 32);
      }
    }
    setPixels(newPixels);
  };

  const handlePaletteColorChange = (idx: number, color: string) => {
    const newPalette = [...palette];
    newPalette[idx] = color;
    setPalette(newPalette);
  };

  const handlePointerEvent = (e: React.PointerEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.floor(((e.clientX - rect.left) / rect.width) * 32);
    const y = Math.floor(((e.clientY - rect.top) / rect.height) * 32);
    const index = y * 32 + x;
    updatePixel(index);
  };

  const handleSave = () => {
    setPet(prev => ({ 
      ...prev, 
      customSprite: pixels.join(''),
      palette: palette 
    }));
    onSave();
  };

  return (
    <div className="flex flex-col gap-4 items-center">
      {/* Tools */}
      <div className="flex gap-2 flex-wrap justify-center">
        <button 
          onClick={() => setTool('pen')}
          className={`p-2 win95-outset flex items-center gap-1 text-[10px] uppercase font-bold ${tool === 'pen' ? 'win95-inset bg-black/20' : ''}`}
        >
          <Pen className="w-3 h-3" /> Pen
        </button>
        <button 
          onClick={() => setTool('fill')}
          className={`p-2 win95-outset flex items-center gap-1 text-[10px] uppercase font-bold ${tool === 'fill' ? 'win95-inset bg-black/20' : ''}`}
        >
          <PaintBucket className="w-3 h-3" /> Fill
        </button>
        <button 
          onClick={() => setTool('eraser')}
          className={`p-2 win95-outset flex items-center gap-1 text-[10px] uppercase font-bold ${tool === 'eraser' ? 'win95-inset bg-black/20' : ''}`}
        >
          <Eraser className="w-3 h-3" /> Eraser
        </button>
        <button 
          onClick={clearCanvas}
          className="p-2 win95-outset flex items-center gap-1 text-[10px] uppercase font-bold hover:bg-red-900/20"
        >
          <Trash2 className="w-3 h-3" /> Clear
        </button>
      </div>

      {/* Palette Slots */}
      <div className="flex gap-4 p-2 win95-inset bg-black/40 rounded w-full justify-center">
        {palette.map((color, idx) => {
          const slotIdx = (idx + 1).toString();
          return (
            <div key={idx} className="flex flex-col items-center gap-1">
              <button
                onClick={() => { setSelectedColorIdx(slotIdx); setTool('pen'); }}
                className={`w-8 h-8 win95-outset relative ${selectedColorIdx === slotIdx ? 'ring-2 ring-white scale-110 z-10' : ''}`}
                style={{ backgroundColor: color }}
              >
                {selectedColorIdx === slotIdx && <div className="absolute inset-0 border-2 border-black/20" />}
              </button>
              <input 
                type="color" 
                value={color}
                onChange={(e) => handlePaletteColorChange(idx, e.target.value)}
                className="w-8 h-4 bg-transparent border-none cursor-pointer"
              />
              <span className="text-[8px] font-bold opacity-40">{slotIdx}</span>
            </div>
          );
        })}
      </div>

      <div 
        ref={containerRef}
        onPointerDown={(e) => { 
          if (tool === 'fill') handlePointerEvent(e);
          else { setIsDrawing(true); handlePointerEvent(e); }
        }}
        onPointerMove={(e) => { if (isDrawing && tool !== 'fill') handlePointerEvent(e); }}
        onPointerUp={() => setIsDrawing(false)}
        onPointerLeave={() => setIsDrawing(false)}
        className="w-[320px] h-[320px] bg-black/40 grid grid-cols-[repeat(32,1fr)] win95-inset cursor-crosshair touch-none overflow-hidden shrink-0"
      >
        {pixels.map((p, i) => {
          const color = p === '0' ? 'transparent' : palette[parseInt(p) - 1];
          return (
            <div 
              key={i} 
              className="w-full h-full border-[0.1px] border-white/5"
              style={{ backgroundColor: color }}
            />
          );
        })}
      </div>

      <button 
        onClick={handleSave}
        className="w-full py-2 win95-outset bg-blue-900/20 text-[10px] uppercase font-bold flex items-center justify-center gap-2 hover:bg-blue-900/40"
      >
        <Save className="w-4 h-4" /> Save Design
      </button>
    </div>
  );
};
