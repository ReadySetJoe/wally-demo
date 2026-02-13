import { DroughtData, DroughtLevel } from '@/types/weather';

const DROUGHT_LEVELS: DroughtLevel[] = ['None', 'D0', 'D1', 'D2', 'D3', 'D4'];

interface USDMStateData {
  state: string;
  None: number;
  D0: number;
  D1: number;
  D2: number;
  D3: number;
  D4: number;
}

const STATE_NAMES: Record<string, string> = {
  AL: 'Alabama', AK: 'Alaska', AZ: 'Arizona', AR: 'Arkansas', CA: 'California',
  CO: 'Colorado', CT: 'Connecticut', DE: 'Delaware', FL: 'Florida', GA: 'Georgia',
  HI: 'Hawaii', ID: 'Idaho', IL: 'Illinois', IN: 'Indiana', IA: 'Iowa',
  KS: 'Kansas', KY: 'Kentucky', LA: 'Louisiana', ME: 'Maine', MD: 'Maryland',
  MA: 'Massachusetts', MI: 'Michigan', MN: 'Minnesota', MS: 'Mississippi', MO: 'Missouri',
  MT: 'Montana', NE: 'Nebraska', NV: 'Nevada', NH: 'New Hampshire', NJ: 'New Jersey',
  NM: 'New Mexico', NY: 'New York', NC: 'North Carolina', ND: 'North Dakota', OH: 'Ohio',
  OK: 'Oklahoma', OR: 'Oregon', PA: 'Pennsylvania', RI: 'Rhode Island', SC: 'South Carolina',
  SD: 'South Dakota', TN: 'Tennessee', TX: 'Texas', UT: 'Utah', VT: 'Vermont',
  VA: 'Virginia', WA: 'Washington', WV: 'West Virginia', WI: 'Wisconsin', WY: 'Wyoming',
};

function getDominantDroughtLevel(data: USDMStateData): DroughtLevel {
  // Find the most severe drought level affecting significant area (>10%)
  if (data.D4 > 10) return 'D4';
  if (data.D3 > 10) return 'D3';
  if (data.D2 > 10) return 'D2';
  if (data.D1 > 10) return 'D1';
  if (data.D0 > 10) return 'D0';
  return 'None';
}

export async function fetchDroughtData(): Promise<DroughtData[]> {
  // US Drought Monitor provides CSV/JSON data
  // Using their statistics API endpoint
  const url = 'https://usdmdataservices.unl.edu/api/StateStatistics/GetDroughtSeverityStatisticsByAreaPercent?aoi=state&startdate=&enddate=&statisticsType=1';

  try {
    const response = await fetch(url, {
      next: { revalidate: 86400 }, // Cache for 24 hours (updates weekly)
    });

    if (!response.ok) {
      console.error('USDM API error:', response.status);
      return getMockDroughtData();
    }

    const rawData: USDMStateData[] = await response.json();

    // Get the most recent data for each state
    const latestByState = new Map<string, USDMStateData>();
    for (const entry of rawData) {
      if (STATE_NAMES[entry.state]) {
        latestByState.set(entry.state, entry);
      }
    }

    return Array.from(latestByState.values()).map((state): DroughtData => ({
      stateCode: state.state,
      stateName: STATE_NAMES[state.state] || state.state,
      droughtLevel: getDominantDroughtLevel(state),
      percentArea: {
        none: state.None || 0,
        d0: state.D0 || 0,
        d1: state.D1 || 0,
        d2: state.D2 || 0,
        d3: state.D3 || 0,
        d4: state.D4 || 0,
      },
      dominantLevel: getDominantDroughtLevel(state),
      updatedAt: new Date().toISOString(),
    }));
  } catch (error) {
    console.error('Failed to fetch drought data:', error);
    return getMockDroughtData();
  }
}

// Mock data for demo/fallback
function getMockDroughtData(): DroughtData[] {
  const mockData: Record<string, { level: DroughtLevel; d0: number; d1: number; d2: number; d3: number; d4: number }> = {
    // Corn Belt - varying conditions
    IA: { level: 'D1', d0: 30, d1: 25, d2: 10, d3: 0, d4: 0 },
    IL: { level: 'None', d0: 15, d1: 5, d2: 0, d3: 0, d4: 0 },
    IN: { level: 'None', d0: 10, d1: 0, d2: 0, d3: 0, d4: 0 },
    NE: { level: 'D2', d0: 40, d1: 30, d2: 20, d3: 5, d4: 0 },
    OH: { level: 'None', d0: 5, d1: 0, d2: 0, d3: 0, d4: 0 },
    MN: { level: 'D0', d0: 25, d1: 10, d2: 0, d3: 0, d4: 0 },
    SD: { level: 'D2', d0: 45, d1: 35, d2: 25, d3: 10, d4: 0 },
    // Wheat Belt - more severe
    KS: { level: 'D3', d0: 60, d1: 50, d2: 40, d3: 25, d4: 5 },
    ND: { level: 'D1', d0: 35, d1: 20, d2: 5, d3: 0, d4: 0 },
    MT: { level: 'D2', d0: 50, d1: 40, d2: 30, d3: 10, d4: 0 },
    OK: { level: 'D3', d0: 65, d1: 55, d2: 45, d3: 30, d4: 10 },
    TX: { level: 'D4', d0: 70, d1: 60, d2: 50, d3: 40, d4: 25 },
    WA: { level: 'None', d0: 10, d1: 5, d2: 0, d3: 0, d4: 0 },
    // Soybean Belt (overlaps corn)
    MO: { level: 'D1', d0: 30, d1: 20, d2: 5, d3: 0, d4: 0 },
    // Other states - generally milder
    CA: { level: 'D1', d0: 40, d1: 25, d2: 10, d3: 0, d4: 0 },
    AZ: { level: 'D2', d0: 55, d1: 45, d2: 30, d3: 10, d4: 0 },
    NM: { level: 'D2', d0: 50, d1: 40, d2: 25, d3: 5, d4: 0 },
    CO: { level: 'D1', d0: 35, d1: 20, d2: 10, d3: 0, d4: 0 },
    WY: { level: 'D1', d0: 30, d1: 15, d2: 5, d3: 0, d4: 0 },
    UT: { level: 'D1', d0: 40, d1: 25, d2: 10, d3: 0, d4: 0 },
    NV: { level: 'D2', d0: 50, d1: 35, d2: 20, d3: 5, d4: 0 },
    OR: { level: 'None', d0: 15, d1: 5, d2: 0, d3: 0, d4: 0 },
    ID: { level: 'D0', d0: 25, d1: 10, d2: 0, d3: 0, d4: 0 },
  };

  return Object.entries(STATE_NAMES).map(([code, name]): DroughtData => {
    const mock = mockData[code] || { level: 'None' as DroughtLevel, d0: 5, d1: 0, d2: 0, d3: 0, d4: 0 };
    const none = 100 - mock.d0;
    return {
      stateCode: code,
      stateName: name,
      droughtLevel: mock.level,
      percentArea: {
        none,
        d0: mock.d0,
        d1: mock.d1,
        d2: mock.d2,
        d3: mock.d3,
        d4: mock.d4,
      },
      dominantLevel: mock.level,
      updatedAt: new Date().toISOString(),
    };
  });
}

export function droughtLevelToScore(level: DroughtLevel): number {
  const scores: Record<DroughtLevel, number> = {
    'None': 0,
    'D0': 1,
    'D1': 2,
    'D2': 3,
    'D3': 4,
    'D4': 5,
  };
  return scores[level];
}
