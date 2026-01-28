import React from 'react';
import useAppStore from '../../stores/useAppStore.js';
import { COLOR_SCHEMES } from '../../utils/constants.js';
import { hexToCSS } from '../../utils/mathUtils.js';
import Tooltip from '../ui/Tooltip.jsx';

export default function ColorSchemeSelector() {
  const colorScheme = useAppStore((s) => s.colorScheme);
  const setColorScheme = useAppStore((s) => s.setColorScheme);

  return (
    <div className="flex gap-2 justify-center" id="color-selector">
      {COLOR_SCHEMES.map((scheme, i) => (
        <Tooltip key={i} text={scheme.name}>
          <button
            onClick={() => setColorScheme(i)}
            className={`w-8 h-8 min-w-[48px] min-h-[48px] rounded-full transition-all duration-300
              ${colorScheme === i
                ? 'ring-2 ring-white ring-offset-2 ring-offset-black scale-110'
                : 'hover:scale-105'}`}
            style={{
              background: `linear-gradient(135deg, ${hexToCSS(scheme.a)}, ${hexToCSS(scheme.b)}, ${hexToCSS(scheme.c)})`,
              boxShadow: colorScheme === i ? `0 0 20px ${hexToCSS(scheme.b)}` : 'none',
            }}
            aria-label={`Color scheme: ${scheme.name}`}
          />
        </Tooltip>
      ))}
    </div>
  );
}
