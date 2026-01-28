import React, { useRef, useCallback } from 'react';
import useVisualization from '../hooks/useVisualization.js';
import useDragDrop from '../hooks/useDragDrop.js';
import EducationalOverlay from './overlays/EducationalOverlay.jsx';

/**
 * Single Three.js viewport wrapper.
 * @param {Object} props
 * @param {Function} props.getEngineRef
 * @param {Function} props.onFileDrop
 * @param {Object} props.opts - { pixelRatio }
 */
export default function VisualizationPanel({ getEngineRef, onFileDrop, opts }) {
  const containerRef = useRef(null);

  const stableOnFileDrop = useCallback((file) => onFileDrop?.(file), [onFileDrop]);

  useVisualization(containerRef, getEngineRef, opts);
  const isDragging = useDragDrop(containerRef, stableOnFileDrop);

  return (
    <div className="relative w-full h-full">
      <div ref={containerRef} className="w-full h-full cursor-crosshair" />
      <EducationalOverlay />
      {isDragging && (
        <div className="absolute inset-0 flex items-center justify-center bg-cyan-400/10 border-2 border-dashed border-cyan-400 rounded-xl z-20 pointer-events-none">
          <p className="text-cyan-300 font-bold text-lg">Drop audio file</p>
        </div>
      )}
    </div>
  );
}
