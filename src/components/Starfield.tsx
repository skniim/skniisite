import React, { useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';

export const Starfield: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { theme } = useTheme();
  const mouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let w = window.innerWidth;
    let h = window.innerHeight;

    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w;
      canvas.height = h;
    };

    window.addEventListener('resize', resize);
    resize();

    const starCount = 400;
    const stars = Array.from({ length: starCount }, () => ({
      x: Math.random() * w * 4 - w * 2,
      y: Math.random() * h * 4 - h * 2,
      z: Math.random() * w,
      size: Math.random() * 2 + 0.5,
      baseSpeed: Math.random() * 0.5 + 0.1
    }));

    const handleMouseMove = (e: MouseEvent) => {
      mouse.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', handleMouseMove);

    const render = () => {
      // Clear background explicitly
      ctx.globalAlpha = 1;
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, w, h);

      stars.forEach((star) => {
        const speedMultiplier = theme.starSpeed || 1;
        const currentSpeed = star.baseSpeed * speedMultiplier;
        
        let renderX = star.x;
        let renderY = star.y;
        let renderSize = star.size;
        let opacity = 1;

        const direction = theme.starDirection || 'down';
        
        // Direction Logic
        if (direction === 'down') {
          star.y += currentSpeed;
          if (star.y > h) star.y = 0;
        } else if (direction === 'up') {
          star.y -= currentSpeed;
          if (star.y < 0) star.y = h;
        } else if (direction === 'right') {
          star.x += currentSpeed;
          if (star.x > w) star.x = 0;
        } else if (direction === 'left') {
          star.x -= currentSpeed;
          if (star.x < 0) star.x = w;
        } else if (direction === 'towards' || direction === 'away') {
          const isTowards = direction === 'towards';
          star.z += isTowards ? -currentSpeed * 5 : currentSpeed * 5;

          if (isTowards && star.z <= 0) {
            star.z = w;
            star.x = Math.random() * w * 4 - w * 2;
            star.y = Math.random() * h * 4 - h * 2;
          } else if (!isTowards && star.z >= w) {
            star.z = 1;
            star.x = Math.random() * w * 4 - w * 2;
            star.y = Math.random() * h * 4 - h * 2;
          }

          const k = 128 / (star.z || 1);
          renderX = (star.x) * k + w / 2;
          renderY = (star.y) * k + h / 2;
          renderSize = Math.max(0.5, (1 - star.z / w) * 4);
          opacity = 1 - (star.z / w);
        }

        // Mouse warp (repel)
        const dx = renderX - mouse.current.x;
        const dy = renderY - mouse.current.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < 150) {
          const angle = Math.atan2(dy, dx);
          const force = (150 - dist) / 10;
          renderX += Math.cos(angle) * force;
          renderY += Math.sin(angle) * force;
        }

        ctx.globalAlpha = Math.max(0, opacity);
        ctx.fillStyle = theme.starColor;
        ctx.fillRect(Math.floor(renderX), Math.floor(renderY), Math.max(1, Math.floor(renderSize)), Math.max(1, Math.floor(renderSize)));
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();
    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, [theme.starDirection, theme.starSpeed, theme.starColor]);

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed top-0 left-0 w-full h-full" 
      style={{ 
        zIndex: 0,
        pointerEvents: 'none',
        display: 'block',
        backgroundColor: 'black'
      }} 
    />
  );
};