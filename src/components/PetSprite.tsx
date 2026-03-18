import React, { useEffect, useRef } from 'react';

export type PetMood = 'idle' | 'happy' | 'sad' | 'hungry' | 'sleeping' | 'dead' | 'surprised';

interface PetSpriteProps {
  data?: string;
  size: number;
  palette: string[];
  fallbackColor?: string;
  mood?: PetMood;
}

export const PetSprite: React.FC<PetSpriteProps> = ({ data, size, palette, fallbackColor, mood = 'idle' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 1. Draw the Body
    const pixelSize = canvas.width / 32;
    const p = pixelSize;
    
    if (!data || data.length !== 1024) {
      ctx.fillStyle = palette[0] || fallbackColor || '#d1d5db';
      ctx.beginPath();
      ctx.arc(canvas.width / 2, canvas.height / 2, canvas.width / 3, 0, Math.PI * 2);
      ctx.fill();
    } else {
      for (let y = 0; y < 32; y++) {
        for (let x = 0; x < 32; x++) {
          const char = data[y * 32 + x];
          const colorIdx = parseInt(char);
          
          if (colorIdx > 0 && colorIdx <= palette.length) {
            ctx.fillStyle = palette[colorIdx - 1];
            ctx.fillRect(
              Math.floor(x * p),
              Math.floor(y * p),
              Math.ceil(p),
              Math.ceil(p)
            );
          }
        }
      }
    }

    // 2. Draw the Face
    const centerX = canvas.width / 2;
    const centerY = canvas.height * 0.4;
    const eyeSpacing = p * 8;

    ctx.fillStyle = '#000000';

    const drawEye = (x: number, y: number, type: PetMood) => {
      if (type === 'sleeping') {
        // - - (Longer)
        ctx.fillRect(x - p * 2, y, p * 5, p);
      } else if (type === 'happy' || type === 'idle') {
        // ^ ^ (Simple Sharp Caret)
        //   [#]
        // [#] [#]
        ctx.fillRect(x, y - p, p, p);
        ctx.fillRect(x - p, y, p, p);
        ctx.fillRect(x + p, y, p, p);
      } else if (type === 'sad' || type === 'dead') {
        // X X (Larger)
        ctx.fillRect(x - p * 2, y - p * 2, p, p);
        ctx.fillRect(x + p * 2, y + p * 2, p, p);
        ctx.fillRect(x + p * 2, y - p * 2, p, p);
        ctx.fillRect(x - p * 2, y + p * 2, p, p);
        ctx.fillRect(x - p, y - p, p, p);
        ctx.fillRect(x + p, y + p, p, p);
        ctx.fillRect(x + p, y - p, p, p);
        ctx.fillRect(x - p, y + p, p, p);
        ctx.fillRect(x, y, p, p);
      } else if (type === 'surprised' || type === 'hungry') {
        // o o (Hollow Circle)
        //   ###
        //  #   #
        //   ###
        ctx.fillRect(x - p, y - p * 2, p * 3, p); // Top
        ctx.fillRect(x - p, y + p * 2, p * 3, p); // Bottom
        ctx.fillRect(x - p * 2, y - p, p, p * 3); // Left
        ctx.fillRect(x + p * 2, y - p, p, p * 3); // Right
      }
    };

    const drawMouth = (x: number, y: number, type: PetMood) => {
      if (type === 'happy') {
        // Wide U
        ctx.fillRect(x - p * 2, y, p, p * 2);
        ctx.fillRect(x + p * 2, y, p, p * 2);
        ctx.fillRect(x - p, y + p * 2, p * 3, p);
      } else if (type === 'sad') {
        // Wide n
        ctx.fillRect(x - p * 2, y + p, p, p * 2);
        ctx.fillRect(x + p * 2, y + p, p, p * 2);
        ctx.fillRect(x - p, y + p, p * 3, p);
      } else if (type === 'hungry' || type === 'surprised') {
        // Large O mouth
        ctx.fillRect(x - p, y, p * 3, p);
        ctx.fillRect(x - p, y + p * 2, p * 3, p);
        ctx.fillRect(x - p, y + p, p, p);
        ctx.fillRect(x + p, y + p, p, p);
      } else if (type === 'idle') {
        // Wide _
        ctx.fillRect(x - p, y + p * 2, p * 3, p);
      }
    };

    if (mood !== 'sleeping') {
      drawEye(centerX - eyeSpacing / 2, centerY, mood);
      drawEye(centerX + eyeSpacing / 2, centerY, mood);
    } else {
      drawEye(centerX - eyeSpacing / 2, centerY, 'sleeping');
      drawEye(centerX + eyeSpacing / 2, centerY, 'sleeping');
    }

    if (mood !== 'dead' && mood !== 'sleeping') {
      drawMouth(centerX, centerY + p * 4, mood);
    }

  }, [data, palette, size, fallbackColor, mood]);

  return (
    <canvas 
      ref={canvasRef} 
      width={size} 
      height={size} 
      style={{ imageRendering: 'pixelated' }}
    />
  );
};
