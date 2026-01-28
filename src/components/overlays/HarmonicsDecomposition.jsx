import React, { useRef, useEffect, useState, useCallback } from 'react';
import Slider from '../ui/Slider.jsx';

const HARMONIC_COUNT = 6;
const CANVAS_W = 260;
const CANVAS_H = 60;

function MiniWaveCanvas({ frequency, amplitude, color }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;

    let frame;
    let time = 0;

    const draw = () => {
      time += 0.03;
      ctx.clearRect(0, 0, w, h);
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.beginPath();

      for (let x = 0; x < w; x++) {
        const t = x / w;
        const y = h / 2 + Math.sin(t * Math.PI * 2 * frequency + time * 3) * amplitude * (h / 2 - 4);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }

      ctx.stroke();
      frame = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(frame);
  }, [frequency, amplitude, color]);

  return (
    <canvas
      ref={canvasRef}
      width={CANVAS_W}
      height={CANVAS_H}
      className="w-full rounded bg-white/5"
      style={{ height: `${CANVAS_H}px` }}
    />
  );
}

function CompositeCanvas({ harmonics }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;

    let frame;
    let time = 0;

    const draw = () => {
      time += 0.03;
      ctx.clearRect(0, 0, w, h);
      ctx.strokeStyle = '#00ffcc';
      ctx.lineWidth = 2;
      ctx.beginPath();

      for (let x = 0; x < w; x++) {
        const t = x / w;
        let y = 0;
        for (let i = 0; i < harmonics.length; i++) {
          y += Math.sin(t * Math.PI * 2 * (i + 1) + time * 3) * harmonics[i];
        }
        // Normalize
        const maxSum = harmonics.reduce((a, b) => a + Math.abs(b), 0) || 1;
        const normalized = y / maxSum;
        const py = h / 2 + normalized * (h / 2 - 4);
        if (x === 0) ctx.moveTo(x, py);
        else ctx.lineTo(x, py);
      }

      ctx.stroke();
      frame = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(frame);
  }, [harmonics]);

  return (
    <canvas
      ref={canvasRef}
      width={CANVAS_W}
      height={CANVAS_H + 20}
      className="w-full rounded bg-white/5"
      style={{ height: `${CANVAS_H + 20}px` }}
    />
  );
}

const COLORS = ['#00ccff', '#ff6644', '#44ff88', '#ffcc00', '#cc44ff', '#ff4488'];

export default function HarmonicsDecomposition() {
  const [amplitudes, setAmplitudes] = useState(() =>
    Array.from({ length: HARMONIC_COUNT }, (_, i) => (i === 0 ? 1.0 : 0.0))
  );

  const setHarmonic = useCallback((idx, val) => {
    setAmplitudes((prev) => {
      const next = [...prev];
      next[idx] = val;
      return next;
    });
  }, []);

  return (
    <div className="space-y-3">
      <p className="text-[10px] text-gray-400">
        Every sound is a combination of simple sine waves (harmonics). Adjust the sliders to see how they add up.
      </p>

      {/* Composite view */}
      <div>
        <p className="text-xs text-cyan-300 font-bold mb-1">Combined Sound</p>
        <CompositeCanvas harmonics={amplitudes} />
      </div>

      {/* Individual harmonics */}
      <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
        {amplitudes.map((amp, i) => (
          <div key={i}>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold min-w-[70px]" style={{ color: COLORS[i] }}>
                {i === 0 ? 'Fundamental' : `Harmonic ${i + 1}`}
              </span>
              <div className="flex-1">
                <Slider
                  value={amp}
                  min={0}
                  max={1}
                  step={0.01}
                  onChange={(v) => setHarmonic(i, v)}
                  ariaLabel={`Harmonic ${i + 1} amplitude`}
                />
              </div>
            </div>
            {amp > 0 && (
              <MiniWaveCanvas frequency={i + 1} amplitude={amp} color={COLORS[i]} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
