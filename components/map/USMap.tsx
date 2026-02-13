'use client';

import { useState, useMemo } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
} from 'react-simple-maps';
import { scaleLinear } from 'd3-scale';
import { StateSignal } from '@/types/signal';
import { StateTooltip } from './StateTooltip';
import { MapLegend } from './MapLegend';

const GEO_URL = 'https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json';

interface USMapProps {
  stateSignals: StateSignal[];
}

// Color scale: Red (avoid short) -> Yellow (neutral) -> Green (short opportunity)
// aggregateScore: positive = avoid_short (red), negative = short (green)
const colorScale = scaleLinear<string>()
  .domain([-0.8, 0, 0.8])
  .range(['#22c55e', '#fbbf24', '#ef4444']); // green -> yellow -> red

export function USMap({ stateSignals }: USMapProps) {
  const [hoveredState, setHoveredState] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  const signalMap = useMemo(() => {
    const map = new Map<string, StateSignal>();
    stateSignals.forEach(s => map.set(s.stateCode, s));
    return map;
  }, [stateSignals]);

  const getStateColor = (stateCode: string) => {
    const signal = signalMap.get(stateCode);
    if (!signal || signal.signals.length === 0) {
      return '#e5e7eb'; // gray for states without signals
    }
    return colorScale(signal.aggregateScore);
  };

  const handleMouseEnter = (stateCode: string, event: React.MouseEvent) => {
    setHoveredState(stateCode);
    setTooltipPosition({ x: event.clientX, y: event.clientY });
  };

  const handleMouseMove = (event: React.MouseEvent) => {
    setTooltipPosition({ x: event.clientX, y: event.clientY });
  };

  const handleMouseLeave = () => {
    setHoveredState(null);
  };

  const hoveredSignal = hoveredState ? signalMap.get(hoveredState) : null;

  return (
    <div className="relative w-full">
      <ComposableMap
        projection="geoAlbersUsa"
        projectionConfig={{ scale: 1000 }}
        className="w-full h-auto"
      >
        <Geographies geography={GEO_URL}>
          {({ geographies }) =>
            geographies.map((geo) => {
              const stateCode = geo.properties.name;
              // Map full state name to code for coloring
              const stateCodeMap: Record<string, string> = {
                'Alabama': 'AL', 'Alaska': 'AK', 'Arizona': 'AZ', 'Arkansas': 'AR',
                'California': 'CA', 'Colorado': 'CO', 'Connecticut': 'CT', 'Delaware': 'DE',
                'Florida': 'FL', 'Georgia': 'GA', 'Hawaii': 'HI', 'Idaho': 'ID',
                'Illinois': 'IL', 'Indiana': 'IN', 'Iowa': 'IA', 'Kansas': 'KS',
                'Kentucky': 'KY', 'Louisiana': 'LA', 'Maine': 'ME', 'Maryland': 'MD',
                'Massachusetts': 'MA', 'Michigan': 'MI', 'Minnesota': 'MN', 'Mississippi': 'MS',
                'Missouri': 'MO', 'Montana': 'MT', 'Nebraska': 'NE', 'Nevada': 'NV',
                'New Hampshire': 'NH', 'New Jersey': 'NJ', 'New Mexico': 'NM', 'New York': 'NY',
                'North Carolina': 'NC', 'North Dakota': 'ND', 'Ohio': 'OH', 'Oklahoma': 'OK',
                'Oregon': 'OR', 'Pennsylvania': 'PA', 'Rhode Island': 'RI', 'South Carolina': 'SC',
                'South Dakota': 'SD', 'Tennessee': 'TN', 'Texas': 'TX', 'Utah': 'UT',
                'Vermont': 'VT', 'Virginia': 'VA', 'Washington': 'WA', 'West Virginia': 'WV',
                'Wisconsin': 'WI', 'Wyoming': 'WY',
              };
              const code = stateCodeMap[stateCode] || '';

              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill={getStateColor(code)}
                  stroke="#fff"
                  strokeWidth={0.5}
                  style={{
                    default: { outline: 'none' },
                    hover: { outline: 'none', fill: '#a3a3a3' },
                    pressed: { outline: 'none' },
                  }}
                  onMouseEnter={(e) => handleMouseEnter(code, e)}
                  onMouseMove={handleMouseMove}
                  onMouseLeave={handleMouseLeave}
                />
              );
            })
          }
        </Geographies>
      </ComposableMap>

      <MapLegend />

      {hoveredState && hoveredSignal && (
        <StateTooltip
          stateCode={hoveredState}
          signal={hoveredSignal}
          position={tooltipPosition}
        />
      )}
    </div>
  );
}
