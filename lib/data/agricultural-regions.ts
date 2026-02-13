import { CommodityName } from '@/types/commodity';

export interface AgriculturalRegion {
  name: string;
  states: string[];
  primaryCommodity: CommodityName;
  secondaryCommodities: CommodityName[];
  description: string;
}

export const AGRICULTURAL_REGIONS: AgriculturalRegion[] = [
  // Grains
  {
    name: 'Corn Belt',
    states: ['IA', 'IL', 'IN', 'OH', 'NE', 'MN', 'SD'],
    primaryCommodity: 'corn',
    secondaryCommodities: ['soybeans'],
    description: 'Primary US corn and soybean production region',
  },
  {
    name: 'Wheat Belt',
    states: ['KS', 'ND', 'MT', 'OK', 'WA', 'TX'],
    primaryCommodity: 'wheat',
    secondaryCommodities: [],
    description: 'Major winter and spring wheat production',
  },
  {
    name: 'Soybean Belt',
    states: ['IA', 'IL', 'MN', 'IN', 'OH', 'MO'],
    primaryCommodity: 'soybeans',
    secondaryCommodities: ['corn'],
    description: 'Primary soybean production overlapping Corn Belt',
  },
  // Softs
  {
    name: 'Citrus Belt',
    states: ['FL', 'CA', 'TX', 'AZ'],
    primaryCommodity: 'orange_juice',
    secondaryCommodities: [],
    description: 'Primary US citrus and orange production',
  },
  {
    name: 'Cotton Belt',
    states: ['TX', 'GA', 'MS', 'AR', 'AL', 'NC', 'TN', 'LA', 'AZ', 'CA'],
    primaryCommodity: 'cotton',
    secondaryCommodities: [],
    description: 'Major US cotton production region',
  },
  {
    name: 'Sugar Region',
    states: ['FL', 'LA', 'TX', 'HI'],
    primaryCommodity: 'sugar',
    secondaryCommodities: [],
    description: 'US sugarcane and sugar beet production',
  },
  // Produce (simulated)
  {
    name: 'California Central Valley',
    states: ['CA'],
    primaryCommodity: 'almonds',
    secondaryCommodities: ['tomatoes', 'lettuce', 'avocados'],
    description: 'Major produce and nut production',
  },
  {
    name: 'Florida Produce',
    states: ['FL'],
    primaryCommodity: 'tomatoes',
    secondaryCommodities: ['avocados'],
    description: 'Winter vegetable and tropical fruit production',
  },
  {
    name: 'Southwest Produce',
    states: ['AZ', 'CA'],
    primaryCommodity: 'lettuce',
    secondaryCommodities: ['tomatoes'],
    description: 'Year-round lettuce and vegetable production',
  },
];

export const STATE_TO_REGIONS: Record<string, string[]> = {};

// Build reverse mapping
AGRICULTURAL_REGIONS.forEach(region => {
  region.states.forEach(state => {
    if (!STATE_TO_REGIONS[state]) {
      STATE_TO_REGIONS[state] = [];
    }
    STATE_TO_REGIONS[state].push(region.name);
  });
});

export function getRegionForState(stateCode: string): AgriculturalRegion | null {
  for (const region of AGRICULTURAL_REGIONS) {
    if (region.states.includes(stateCode)) {
      return region;
    }
  }
  return null;
}

export function getRegionsByCommdity(commodity: CommodityName): AgriculturalRegion[] {
  return AGRICULTURAL_REGIONS.filter(
    r => r.primaryCommodity === commodity || r.secondaryCommodities.includes(commodity)
  );
}
