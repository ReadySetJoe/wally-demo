export type DroughtLevel = 'None' | 'D0' | 'D1' | 'D2' | 'D3' | 'D4';

export interface DroughtData {
  stateCode: string;
  stateName: string;
  droughtLevel: DroughtLevel;
  percentArea: {
    none: number;
    d0: number;
    d1: number;
    d2: number;
    d3: number;
    d4: number;
  };
  dominantLevel: DroughtLevel;
  updatedAt: string;
}

export interface WeatherCondition {
  stateCode: string;
  temperature: {
    current: number;
    anomaly: number; // deviation from normal
  };
  precipitation: {
    last30Days: number; // inches
    anomalyPercent: number; // % deviation from normal
  };
}

export interface RegionalWeather {
  region: string;
  states: string[];
  avgDroughtLevel: number; // 0-4 scale
  avgPrecipAnomaly: number;
  avgTempAnomaly: number;
}
