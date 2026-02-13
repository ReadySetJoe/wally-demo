import { DroughtLevel } from '@/types/weather';

export interface WeatherObservation {
  stateCode: string;
  date: string;
  tempAvg: number;      // Fahrenheit
  tempMax: number;
  tempMin: number;
  precipitation: number; // inches
  normalTemp: number;    // historical average
  normalPrecip: number;  // historical average
  tempAnomaly: number;   // degrees from normal
  precipAnomaly: number; // percent from normal (-100 to +100+)
}

export interface StateWeatherSummary {
  stateCode: string;
  stateName: string;
  currentTemp: number;
  tempAnomaly: number;
  last7DaysPrecip: number;
  precipAnomaly: number;
  heatIndex: number;       // 0-100 stress index
  moistureIndex: number;   // 0-100 (0=dry, 100=wet)
  weatherRisk: 'low' | 'moderate' | 'high' | 'extreme';
}

// NOAA Climate Data Online (CDO) API
// Documentation: https://www.ncdc.noaa.gov/cdo-web/webservices/v2
const NOAA_BASE_URL = 'https://www.ncdc.noaa.gov/cdo-web/api/v2';

// State FIPS codes for NOAA API
const STATE_FIPS: Record<string, string> = {
  AL: '01', AK: '02', AZ: '04', AR: '05', CA: '06',
  CO: '08', CT: '09', DE: '10', FL: '12', GA: '13',
  HI: '15', ID: '16', IL: '17', IN: '18', IA: '19',
  KS: '20', KY: '21', LA: '22', ME: '23', MD: '24',
  MA: '25', MI: '26', MN: '27', MS: '28', MO: '29',
  MT: '30', NE: '31', NV: '32', NH: '33', NJ: '34',
  NM: '35', NY: '36', NC: '37', ND: '38', OH: '39',
  OK: '40', OR: '41', PA: '42', RI: '44', SC: '45',
  SD: '46', TN: '47', TX: '48', UT: '49', VT: '50',
  VA: '51', WA: '53', WV: '54', WI: '55', WY: '56',
};

// Historical climate normals (simplified averages for demo)
const STATE_CLIMATE_NORMALS: Record<string, { avgTemp: number; avgPrecip: number }> = {
  IA: { avgTemp: 50, avgPrecip: 3.5 },
  IL: { avgTemp: 52, avgPrecip: 3.8 },
  IN: { avgTemp: 52, avgPrecip: 4.0 },
  OH: { avgTemp: 51, avgPrecip: 3.6 },
  NE: { avgTemp: 49, avgPrecip: 2.5 },
  MN: { avgTemp: 45, avgPrecip: 2.8 },
  SD: { avgTemp: 46, avgPrecip: 2.2 },
  KS: { avgTemp: 54, avgPrecip: 2.8 },
  ND: { avgTemp: 42, avgPrecip: 1.8 },
  MT: { avgTemp: 44, avgPrecip: 1.5 },
  OK: { avgTemp: 60, avgPrecip: 3.2 },
  TX: { avgTemp: 65, avgPrecip: 2.8 },
  WA: { avgTemp: 50, avgPrecip: 3.0 },
  MO: { avgTemp: 55, avgPrecip: 4.0 },
  CA: { avgTemp: 60, avgPrecip: 1.5 },
  FL: { avgTemp: 72, avgPrecip: 5.0 },
  AZ: { avgTemp: 68, avgPrecip: 0.8 },
  GA: { avgTemp: 63, avgPrecip: 4.5 },
  LA: { avgTemp: 67, avgPrecip: 5.2 },
  NC: { avgTemp: 59, avgPrecip: 4.2 },
};

// Fetch weather data from NOAA (requires API token)
export async function fetchNOAAWeather(stateCode: string): Promise<WeatherObservation | null> {
  const token = process.env.NOAA_API_TOKEN;

  if (!token) {
    console.warn('NOAA_API_TOKEN not configured, using simulated data');
    return null;
  }

  const fips = STATE_FIPS[stateCode];
  if (!fips) return null;

  const endDate = new Date();
  const startDate = new Date(endDate);
  startDate.setDate(startDate.getDate() - 7);

  const url = `${NOAA_BASE_URL}/data?datasetid=GHCND&locationid=FIPS:${fips}&startdate=${startDate.toISOString().split('T')[0]}&enddate=${endDate.toISOString().split('T')[0]}&datatypeid=TAVG,TMAX,TMIN,PRCP&units=standard&limit=1000`;

  try {
    const response = await fetch(url, {
      headers: {
        token: token,
      },
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!response.ok) {
      console.error(`NOAA API error for ${stateCode}:`, response.status);
      return null;
    }

    const data = await response.json();

    if (!data.results || data.results.length === 0) {
      return null;
    }

    // Aggregate the data
    const normals = STATE_CLIMATE_NORMALS[stateCode] || { avgTemp: 55, avgPrecip: 3.0 };
    let totalPrecip = 0;
    let tempSum = 0;
    let tempCount = 0;
    let maxTemp = -999;
    let minTemp = 999;

    for (const result of data.results) {
      switch (result.datatype) {
        case 'TAVG':
          tempSum += result.value;
          tempCount++;
          break;
        case 'TMAX':
          maxTemp = Math.max(maxTemp, result.value);
          break;
        case 'TMIN':
          minTemp = Math.min(minTemp, result.value);
          break;
        case 'PRCP':
          totalPrecip += result.value;
          break;
      }
    }

    const avgTemp = tempCount > 0 ? tempSum / tempCount : normals.avgTemp;
    const tempAnomaly = avgTemp - normals.avgTemp;
    const precipAnomaly = normals.avgPrecip > 0
      ? ((totalPrecip - normals.avgPrecip) / normals.avgPrecip) * 100
      : 0;

    return {
      stateCode,
      date: endDate.toISOString().split('T')[0],
      tempAvg: avgTemp,
      tempMax: maxTemp > -999 ? maxTemp : avgTemp + 10,
      tempMin: minTemp < 999 ? minTemp : avgTemp - 10,
      precipitation: totalPrecip,
      normalTemp: normals.avgTemp,
      normalPrecip: normals.avgPrecip,
      tempAnomaly,
      precipAnomaly,
    };
  } catch (error) {
    console.error(`Failed to fetch NOAA data for ${stateCode}:`, error);
    return null;
  }
}

// Generate weather summary combining drought and NOAA data
export function generateWeatherSummary(
  stateCode: string,
  stateName: string,
  droughtLevel: DroughtLevel,
  noaaData?: WeatherObservation | null
): StateWeatherSummary {
  // Use NOAA data if available, otherwise generate based on drought level
  const droughtScores: Record<DroughtLevel, number> = {
    'None': 0, 'D0': 1, 'D1': 2, 'D2': 3, 'D3': 4, 'D4': 5,
  };
  const droughtScore = droughtScores[droughtLevel];

  const normals = STATE_CLIMATE_NORMALS[stateCode] || { avgTemp: 55, avgPrecip: 3.0 };

  let tempAnomaly: number;
  let precipAnomaly: number;
  let currentTemp: number;
  let last7DaysPrecip: number;

  if (noaaData) {
    tempAnomaly = noaaData.tempAnomaly;
    precipAnomaly = noaaData.precipAnomaly;
    currentTemp = noaaData.tempAvg;
    last7DaysPrecip = noaaData.precipitation;
  } else {
    // Simulate based on drought level
    // Drought usually correlates with higher temps and lower precip
    const baseTemp = normals.avgTemp + (Math.random() * 10 - 5);
    tempAnomaly = droughtScore * 2 + (Math.random() * 3 - 1.5);
    currentTemp = baseTemp + tempAnomaly;

    // Drought = precipitation deficit
    precipAnomaly = -droughtScore * 15 + (Math.random() * 20 - 10);
    last7DaysPrecip = Math.max(0, normals.avgPrecip * (1 + precipAnomaly / 100));
  }

  // Calculate stress indices
  // Heat index: 0-100 based on temp anomaly (higher = more stress)
  const heatIndex = Math.min(100, Math.max(0, 50 + tempAnomaly * 5));

  // Moisture index: 0-100 (0 = very dry, 100 = very wet)
  const moistureIndex = Math.min(100, Math.max(0, 50 + precipAnomaly * 0.5));

  // Overall weather risk
  let weatherRisk: 'low' | 'moderate' | 'high' | 'extreme' = 'low';
  const riskScore = (heatIndex + (100 - moistureIndex)) / 2;

  if (riskScore >= 80) weatherRisk = 'extreme';
  else if (riskScore >= 60) weatherRisk = 'high';
  else if (riskScore >= 40) weatherRisk = 'moderate';

  return {
    stateCode,
    stateName,
    currentTemp: Math.round(currentTemp),
    tempAnomaly: Math.round(tempAnomaly * 10) / 10,
    last7DaysPrecip: Math.round(last7DaysPrecip * 100) / 100,
    precipAnomaly: Math.round(precipAnomaly),
    heatIndex: Math.round(heatIndex),
    moistureIndex: Math.round(moistureIndex),
    weatherRisk,
  };
}

// Fetch weather data for multiple states
export async function fetchMultiStateWeather(stateCodes: string[]): Promise<Map<string, WeatherObservation>> {
  const results = new Map<string, WeatherObservation>();

  // Fetch in parallel with rate limiting (NOAA has rate limits)
  const batchSize = 5;
  for (let i = 0; i < stateCodes.length; i += batchSize) {
    const batch = stateCodes.slice(i, i + batchSize);
    const promises = batch.map(code => fetchNOAAWeather(code));
    const batchResults = await Promise.all(promises);

    for (let j = 0; j < batch.length; j++) {
      const result = batchResults[j];
      if (result) {
        results.set(batch[j], result);
      }
    }

    // Small delay between batches to avoid rate limiting
    if (i + batchSize < stateCodes.length) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  return results;
}
