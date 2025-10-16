// src/lib/data.ts
import {
  parseGHACSurvey,
  calculateMetrics,
  analyzeConnectionTypes,
  analyzeArtsEssential,
  analyzeCreativityTypes,
  analyzePriorities
} from './xlsx-parser'

// tiny helper to simulate latency
const sleep = (ms = 250) => new Promise((r) => setTimeout(r, ms))

/** COMMUNITY PULSE */
export async function getMetrics() {
  await sleep()

  try {
    const responses = parseGHACSurvey()
    const metrics = calculateMetrics(responses)
    const connectionTypes = analyzeConnectionTypes(responses)
    const artsEssential = analyzeArtsEssential(responses)
    const creativityTypes = analyzeCreativityTypes(responses)
    const priorities = analyzePriorities(responses)

    return {
      communityPulse: {
        totalRespondents: metrics.totalStarts,
        avgCompletionRate: metrics.completionRate,
        avgTrustScore: artsEssential,
        communitySpectrum: connectionTypes.slice(0, 4).map(ct => ({
          label: formatLabel(ct.label),
          value: ct.value
        })),
        topCommunityDrivers: priorities.slice(0, 3).map(p => ({
          label: formatLabel(p.label),
          value: p.value
        })),
        topConcerns: creativityTypes.slice(0, 3).map(ct => ({
          label: formatLabel(ct.label),
          value: ct.value
        })),
      },
    }
  } catch (error) {
    console.error('Error loading survey data:', error)
    // Return mock data as fallback
    return {
      communityPulse: {
        totalRespondents: 1250,
        avgCompletionRate: 76,
        avgTrustScore: 6.8,
        communitySpectrum: [
          { label: 'Cultural Connectors', value: 22 },
          { label: 'Creative Catalysts', value: 18 },
          { label: 'Community Builders', value: 16 },
          { label: 'Heritage Keepers', value: 15 },
        ],
        topCommunityDrivers: [
          { label: 'Neighborhood Events', value: 80 },
          { label: 'Local Venues', value: 65 },
          { label: 'School Programs', value: 50 },
        ],
        topConcerns: [
          { label: 'Funding', value: 70 },
          { label: 'Access', value: 55 },
          { label: 'Awareness', value: 40 },
        ],
      },
    }
  }
}

function formatLabel(label: string): string {
  if (!label) return ''
  return label
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

/** ECHO PATTERNS */
export async function getEcho() {
  await sleep()
  return {
    topTopic: 'Public Arts Programs',
    mostActiveChannel: 'Instagram',
    dominantSentiment: 'Positive',
    trendingTopics: [
      { label: 'Festival Coverage', value: 74 },
      { label: 'Local Grants', value: 58 },
      { label: 'Youth Workshops', value: 46 },
      { label: 'Venue Access', value: 33 },
    ],
    sentimentByTheme: [
      { label: 'Access', value: 68 },
      { label: 'Funding', value: 54 },
      { label: 'Awareness', value: 49 },
      { label: 'Diversity', value: 45 },
    ],
    conversationSpectrum: [
      { label: 'Inspiration', value: 26 },
      { label: 'Information', value: 21 },
      { label: 'Coordination', value: 14 },
      { label: 'Advocacy', value: 10 },
    ],
  }
}

/** ANALYSIS (new) */
export async function getAnalysis() {
  await sleep()
  return {
    kpis: {
      surveyCount: 32,
      avgSentiment: 7.1,   // /10
      optInRate: 68,       // %
    },
    keyDrivers: [
      { label: 'Program Quality', value: 72 },
      { label: 'Community Partnerships', value: 64 },
      { label: 'Outreach Effectiveness', value: 57 },
      { label: 'Volunteer Capacity', value: 41 },
    ],
    riskSignals: [
      { label: 'Funding Volatility', value: 61 },
      { label: 'Staff Burnout', value: 52 },
      { label: 'Audience Attrition', value: 38 },
      { label: 'Venue Access', value: 28 },
    ],
    engagementSpectrum: [
      { label: 'Explore', value: 24 },
      { label: 'Participate', value: 19 },
      { label: 'Support', value: 13 },
      { label: 'Advocate', value: 9 },
    ],
  }
}
