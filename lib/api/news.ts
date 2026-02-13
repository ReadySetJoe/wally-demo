import {
  GeopoliticalEvent,
  GeopoliticalRisk,
  GeopoliticalSummary,
  EventCategory,
  COMMODITY_KEYWORDS,
  CATEGORY_KEYWORDS,
  COMMODITY_REGIONS,
} from '@/types/geopolitical';
import { CommodityName } from '@/types/commodity';

interface GDELTArticle {
  title: string;
  url: string;
  source: string;
  seendate: string;
  domain: string;
  language: string;
  socialimage?: string;
}

interface GDELTResponse {
  articles?: GDELTArticle[];
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

function detectCategory(text: string): EventCategory {
  const lowerText = text.toLowerCase();

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const keyword of keywords) {
      if (lowerText.includes(keyword)) {
        return category as EventCategory;
      }
    }
  }
  return 'policy';
}

function detectCommodities(text: string): CommodityName[] {
  const lowerText = text.toLowerCase();
  const commodities: CommodityName[] = [];

  for (const [commodity, keywords] of Object.entries(COMMODITY_KEYWORDS)) {
    for (const keyword of keywords) {
      if (lowerText.includes(keyword)) {
        commodities.push(commodity as CommodityName);
        break;
      }
    }
  }

  return commodities.length > 0 ? commodities : ['corn', 'wheat', 'soybeans'];
}

function detectRegion(text: string): string {
  const lowerText = text.toLowerCase();
  const regions = [
    'russia', 'ukraine', 'china', 'brazil', 'argentina', 'united states',
    'india', 'australia', 'canada', 'european union', 'black sea', 'mexico'
  ];

  for (const region of regions) {
    if (lowerText.includes(region)) {
      return region.charAt(0).toUpperCase() + region.slice(1);
    }
  }
  return 'Global';
}

function analyzeSentiment(title: string, category: EventCategory): number {
  const lowerTitle = title.toLowerCase();

  // Negative sentiment keywords (bearish for supply, could be bullish for prices)
  const negativeWords = ['ban', 'halt', 'stop', 'war', 'conflict', 'shortage', 'crisis', 'threat', 'sanction', 'tariff', 'restrict', 'damage', 'destroy', 'fall', 'drop', 'cut'];
  // Positive sentiment keywords (bearish for prices)
  const positiveWords = ['deal', 'agreement', 'boost', 'surge', 'record', 'increase', 'grow', 'lift', 'peace', 'resume', 'expand', 'rise', 'gain'];

  let score = 0;

  for (const word of negativeWords) {
    if (lowerTitle.includes(word)) score -= 0.3;
  }
  for (const word of positiveWords) {
    if (lowerTitle.includes(word)) score += 0.3;
  }

  // Clamp between -1 and 1
  return Math.max(-1, Math.min(1, score));
}

function calculateImpactScore(sentiment: number, category: EventCategory, commodities: CommodityName[]): number {
  // Supply disruptions (negative sentiment) are bullish for prices
  // So we invert: negative news = positive price impact
  let impact = -sentiment;

  // Weight by category importance
  const categoryWeights: Record<EventCategory, number> = {
    conflict: 1.5,
    sanctions: 1.3,
    trade: 1.2,
    supply: 1.1,
    policy: 0.8,
    weather: 1.0,
  };

  impact *= categoryWeights[category] || 1;

  return Math.max(-1, Math.min(1, impact));
}

export async function fetchCommodityNews(): Promise<GeopoliticalEvent[]> {
  // GDELT DOC 2.0 API - free, no key required
  const queries = [
    'grain export wheat corn soybean',
    'agriculture trade tariff',
    'russia ukraine grain',
    'china soybean trade',
    'commodity supply shortage',
  ];

  const allArticles: GeopoliticalEvent[] = [];

  for (const query of queries) {
    try {
      const url = `https://api.gdeltproject.org/api/v2/doc/doc?query=${encodeURIComponent(query)}&mode=artlist&maxrecords=10&format=json&timespan=7d`;

      const response = await fetch(url, {
        next: { revalidate: 1800 }, // Cache for 30 minutes
      });

      if (!response.ok) continue;

      const data: GDELTResponse = await response.json();

      if (data.articles) {
        for (const article of data.articles) {
          const category = detectCategory(article.title);
          const sentiment = analyzeSentiment(article.title, category);
          const commodities = detectCommodities(article.title);
          const impact = calculateImpactScore(sentiment, category, commodities);

          allArticles.push({
            id: generateId(),
            title: article.title,
            summary: article.title, // GDELT doesn't provide summaries in basic API
            url: article.url,
            source: article.source || article.domain,
            publishedAt: article.seendate,
            category,
            sentiment,
            relevance: commodities.length > 0 ? 0.8 : 0.5,
            affectedCommodities: commodities,
            region: detectRegion(article.title),
            impactScore: impact,
          });
        }
      }
    } catch (error) {
      console.error('GDELT fetch error:', error);
    }
  }

  // Remove duplicates by URL and sort by date
  const uniqueArticles = Array.from(
    new Map(allArticles.map(a => [a.url, a])).values()
  ).sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  // Return top 20 most recent
  return uniqueArticles.slice(0, 20);
}

export function calculateGeopoliticalRisk(events: GeopoliticalEvent[]): GeopoliticalRisk[] {
  const commodities: CommodityName[] = ['corn', 'wheat', 'soybeans'];
  const risks: GeopoliticalRisk[] = [];

  for (const commodity of commodities) {
    const relevantEvents = events.filter(e => e.affectedCommodities.includes(commodity));

    if (relevantEvents.length === 0) {
      risks.push({
        commodity,
        overallRisk: 0.2,
        sentiment: 0,
        signalImpact: 'neutral',
        topEvents: [],
        riskFactors: { trade: 0.1, conflict: 0.1, sanctions: 0.1, policy: 0.1 },
      });
      continue;
    }

    // Calculate average sentiment and impact
    const avgSentiment = relevantEvents.reduce((sum, e) => sum + e.sentiment, 0) / relevantEvents.length;
    const avgImpact = relevantEvents.reduce((sum, e) => sum + e.impactScore, 0) / relevantEvents.length;

    // Calculate risk by category
    const riskFactors = {
      trade: 0,
      conflict: 0,
      sanctions: 0,
      policy: 0,
    };

    for (const event of relevantEvents) {
      if (event.category in riskFactors) {
        riskFactors[event.category as keyof typeof riskFactors] += Math.abs(event.impactScore) / relevantEvents.length;
      }
    }

    // Overall risk is based on number and severity of events
    const overallRisk = Math.min(1, relevantEvents.length * 0.1 + Math.abs(avgImpact) * 0.5);

    // Determine signal impact
    let signalImpact: 'bullish' | 'bearish' | 'neutral' = 'neutral';
    if (avgImpact > 0.2) signalImpact = 'bullish';
    else if (avgImpact < -0.2) signalImpact = 'bearish';

    risks.push({
      commodity,
      overallRisk,
      sentiment: avgSentiment,
      signalImpact,
      topEvents: relevantEvents.slice(0, 3),
      riskFactors,
    });
  }

  return risks;
}

export async function getGeopoliticalSummary(): Promise<GeopoliticalSummary> {
  let events: GeopoliticalEvent[];

  try {
    events = await fetchCommodityNews();
  } catch {
    events = getMockEvents();
  }

  // If no events from API, use mock data
  if (events.length === 0) {
    events = getMockEvents();
  }

  const commodityRisks = calculateGeopoliticalRisk(events);
  const overallMarketRisk = commodityRisks.reduce((sum, r) => sum + r.overallRisk, 0) / commodityRisks.length;

  return {
    overallMarketRisk,
    commodityRisks,
    recentEvents: events,
    lastUpdated: new Date().toISOString(),
  };
}

// Mock events for fallback/demo
function getMockEvents(): GeopoliticalEvent[] {
  return [
    {
      id: 'mock1',
      title: 'Russia Extends Black Sea Grain Deal Uncertainty',
      summary: 'Negotiations continue over the renewal of the Black Sea grain corridor agreement.',
      url: '#',
      source: 'Reuters',
      publishedAt: new Date().toISOString(),
      category: 'trade',
      sentiment: -0.4,
      relevance: 0.9,
      affectedCommodities: ['wheat', 'corn'],
      region: 'Russia',
      impactScore: 0.4,
    },
    {
      id: 'mock2',
      title: 'China Increases Soybean Imports from Brazil',
      summary: 'Chinese buyers shift purchases to Brazilian soybeans amid trade tensions.',
      url: '#',
      source: 'Bloomberg',
      publishedAt: new Date(Date.now() - 86400000).toISOString(),
      category: 'trade',
      sentiment: 0.2,
      relevance: 0.85,
      affectedCommodities: ['soybeans'],
      region: 'China',
      impactScore: -0.2,
    },
    {
      id: 'mock3',
      title: 'US Imposes New Tariffs on Agricultural Equipment',
      summary: 'New trade measures could increase farming costs across the Midwest.',
      url: '#',
      source: 'WSJ',
      publishedAt: new Date(Date.now() - 172800000).toISOString(),
      category: 'trade',
      sentiment: -0.3,
      relevance: 0.7,
      affectedCommodities: ['corn', 'wheat', 'soybeans'],
      region: 'United States',
      impactScore: 0.2,
    },
    {
      id: 'mock4',
      title: 'Ukraine Grain Exports Hit Record Despite Conflict',
      summary: 'Alternative shipping routes help maintain Ukrainian agricultural exports.',
      url: '#',
      source: 'AP News',
      publishedAt: new Date(Date.now() - 259200000).toISOString(),
      category: 'conflict',
      sentiment: 0.3,
      relevance: 0.95,
      affectedCommodities: ['wheat', 'corn'],
      region: 'Ukraine',
      impactScore: -0.3,
    },
    {
      id: 'mock5',
      title: 'Argentina Peso Devaluation Impacts Soybean Exports',
      summary: 'Currency crisis affects South American commodity pricing.',
      url: '#',
      source: 'Financial Times',
      publishedAt: new Date(Date.now() - 345600000).toISOString(),
      category: 'policy',
      sentiment: -0.5,
      relevance: 0.8,
      affectedCommodities: ['soybeans', 'corn'],
      region: 'Argentina',
      impactScore: 0.4,
    },
  ];
}
