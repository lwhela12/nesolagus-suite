'use client';

import { useEffect, useMemo, useState } from 'react';
import AppHeader from '@/components/ui/app-header';
import CTParticipantMap, { ParticipantPoint } from '@/components/maps/CTParticipantMap';

// Your exact brand palette
const PALETTE = {
  deepestSea: '#032E46',
  cottonKnit: '#F6F4ED',
  riverRock: '#D9D9D9',
  openSky: '#DAEDF0',
  augusta: '#64B37A',
  augustaL2: '#A9D8B7',
  augustaL1: '#86C99B',
  augustaD1: '#479963',
  augustaD2: '#2F7D52',
};

// Process the real data
const artsConnections = [
  { name: 'Attend events', count: 17, percentage: 89 },
  { name: 'Visit museums/galleries', count: 15, percentage: 79 },
  { name: 'See arts as community wellbeing', count: 14, percentage: 74 },
  { name: 'Believe in arts education', count: 13, percentage: 68 },
  { name: 'Donate to arts', count: 12, percentage: 63 },
  { name: 'Creative work involvement', count: 10, percentage: 53 },
  { name: 'Friends/family are artists', count: 9, percentage: 47 },
  { name: 'Other connections', count: 4, percentage: 21 },
];

const relationshipTypes = [
  { type: 'Share skills & expertise', count: 4, percentage: 24 },
  { type: 'Stay informed about impact', count: 6, percentage: 35 },
  { type: 'Connect with like-minded people', count: 3, percentage: 18 },
  { type: 'Participate in decisions', count: 4, percentage: 24 },
];

const engagementBarriers = [
  { barrier: 'Time constraints', count: 4, percentage: 36 },
  { barrier: 'Financial limitations', count: 3, percentage: 27 },
  { barrier: 'Lack of information', count: 2, percentage: 18 },
  { barrier: 'Unclear impact', count: 2, percentage: 18 },
  { barrier: 'Nothing prevents me', count: 2, percentage: 18 },
  { barrier: 'Past impersonal experiences', count: 1, percentage: 9 },
  { barrier: 'Not feeling welcomed', count: 1, percentage: 9 },
];

const ecosystemPriorities = [
  { priority: 'Sustainable funding', rank: 1, mentions: 11 },
  { priority: 'Youth education', rank: 2, mentions: 9 },
  { priority: 'Emerging artists support', rank: 3, mentions: 8 },
  { priority: 'Economic development', rank: 4, mentions: 6 },
  { priority: 'Creative spaces', rank: 5, mentions: 4 },
  { priority: 'Public art', rank: 6, mentions: 4 },
  { priority: 'Wellness & healing', rank: 7, mentions: 3 },
];

const zipCodeData = [
  { zip: '06112', city: 'Hartford', count: 2 },
  { zip: '06105', city: 'Hartford', count: 3 },
  { zip: '06117', city: 'West Hartford', count: 2 },
  { zip: '06001', city: 'Avon', count: 1 },
  { zip: '06002', city: 'Bloomfield', count: 1 },
  { zip: '06107', city: 'West Hartford', count: 1 },
  { zip: '06111', city: 'Newington', count: 1 },
  { zip: '06085', city: 'Farmington', count: 1 },
  { zip: '06335', city: 'Gales Ferry', count: 1 },
  { zip: '06415', city: 'Colchester', count: 1 },
];

// Demo archetype breakdowns by ZIP (sums roughly match counts above)
const archetypesByZip: Record<string, Record<string, number>> = {
  '06112': { 'Cultural Connectors': 1, 'Community Builders': 1 },
  '06105': { 'Cultural Connectors': 1, 'Creative Catalysts': 1, 'Community Builders': 1 },
  '06117': { 'Creative Catalysts': 1, 'Heritage Keepers': 1 },
  '06001': { 'Heritage Keepers': 1 },
  '06002': { 'Community Builders': 1 },
  '06107': { 'Cultural Connectors': 1 },
  '06111': { 'Creative Catalysts': 1 },
  '06085': { 'Community Builders': 1 },
  '06335': { 'Heritage Keepers': 1 },
  '06415': { 'Community Builders': 1 },
};

const mapPoints: ParticipantPoint[] = zipCodeData.map((z) => ({
  ...z,
  archetypes: archetypesByZip[z.zip] || undefined,
}));

const humanStories = [
  {
    role: "Theater Professor & Arts Ambassador",
    quote: "I am a co-founder and current ensemble member of HartBeat Ensemble. I serve as an Arts Ambassador for GHAC.",
    connection: "Professional & Volunteer"
  },
  {
    role: "Former GHAC Staff & Parent",
    quote: "I worked for the GHAC for a few years... I believe in the importance of having art within the community.",
    connection: "Multi-generational Supporter"
  },
  {
    role: "CEO & Arts Administrator",
    quote: "I operate The 224 EcoSpace, which provides a creative and entrepreneurial hub for artists of color.",
    connection: "Community Builder"
  },
  {
    role: "State Arts Leader",
    quote: "Chair of CT arts under Gov. Weiker",
    connection: "Policy & Leadership"
  }
];

const transformativeQuotes = [
  {
    quote: "The arts have touched me deeply, giving me a stronger sense of connection with the community. As a preacher, my role every Sunday is to inspire others—and I use the Word as artistry.",
    role: "Community Leader"
  },
  {
    quote: "My experience with the Neighborhood Studios program is what launched my career as an artist. Without it, I would have likely ended up in a much more boring career path.",
    role: "Program Graduate"
  },
  {
    quote: "I help others identify the story of their life and help them rewrite how they look at the past chapters... I wish there was more opportunity to work with humor in our community.",
    role: "Storyteller & Comedy Advocate"
  },
  {
    quote: "I grew up in the arts and developed into an arts professional because of my childhood experience with creatives.",
    role: "Artist & Curator"
  }
];

const donationRanges = [
  { range: 'Under $100', count: 3, percentage: 20 },
  { range: '$100-249', count: 5, percentage: 33 },
  { range: '$250-499', count: 1, percentage: 7 },
  { range: '$500-999', count: 1, percentage: 7 },
  { range: '$1,000-2,499', count: 2, percentage: 13 },
  { range: '$5,000+', count: 1, percentage: 7 },
  { range: 'Prefer not to say', count: 2, percentage: 13 },
];

const perceptionData = [
  { spectrum: 'Traditional ↔ Innovative', average: 3.4, responses: 16 },
  { spectrum: 'Corporate ↔ Community', average: 3.2, responses: 16 },
  { spectrum: 'Transactional ↔ Relationship', average: 3.4, responses: 16 },
  { spectrum: 'Behind scenes ↔ Visible', average: 3.3, responses: 16 },
  { spectrum: 'Exclusive ↔ Inclusive', average: 3.6, responses: 16 },
];

function Card({ title, children, className = '' }: { title?: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border bg-white shadow-sm ${className}`}>
      {title && (
        <div className="border-b px-5 py-3 font-medium text-gray-900">
          {title}
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  );
}

export default function CommunityPulsePage() {
  const [selectedStory, setSelectedStory] = useState(0);
  const [selectedZip, setSelectedZip] = useState<string | null>(null);
  const [points, setPoints] = useState<ParticipantPoint[]>(mapPoints);
  const [rankItems, setRankItems] = useState<{ label: string; pct: number; value: number }[]>([]);

  // Load live participants (CSV/JSON) if present via API
  useEffect(() => {
    let cancelled = false;
    fetch('/api/participants')
      .then((r) => r.json())
      .then((res) => {
        if (cancelled) return;
        if (Array.isArray(res?.data) && res.data.length) {
          setPoints(res.data as ParticipantPoint[]);
        }
      })
      .catch(() => {/* ignore */});
    return () => { cancelled = true };
  }, []);

  // Load ranked priorities (weighted by rank)
  useEffect(() => {
    fetch('/api/rank/priorities')
      .then((r) => r.json())
      .then((res) => setRankItems(res.items || []))
      .catch(() => setRankItems([]));
  }, []);

  return (
    <section className="p-6 space-y-6">
      <AppHeader 
        title="Community Pulse" 
        subtitle="The human stories behind the connections - how your community really engages with arts" 
      />

      {/* Arts Connections */}
      <Card title="How Our Community Connects with the Arts">
        <div className="space-y-6">
          <p className="text-gray-600">Multiple touchpoints show the rich, interconnected ways people engage with arts in your region</p>
          
          <div className="space-y-4">
            {artsConnections.map((connection, index) => (
              <div key={index} className="flex items-center space-x-4">
                <div className="w-40 text-sm text-gray-700 font-medium">{connection.name}</div>
                <div className="flex-1 relative">
                  <div className="w-full bg-gray-100 rounded-full h-6 relative overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-1000 ease-out flex items-center justify-end pr-2"
                      style={{ 
                        width: `${connection.percentage}%`,
                        backgroundColor: index < 4 ? PALETTE.augusta : index < 6 ? PALETTE.augustaL1 : PALETTE.augustaL2,
                      }}
                    >
                      <span className="text-white text-xs font-medium">{connection.count}</span>
                    </div>
                  </div>
                </div>
                <div className="w-12 text-sm text-gray-500 text-right">{connection.percentage}%</div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Relationship Types & Barriers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card title="Most Meaningful Relationships">
          <div className="space-y-4">
            <p className="text-sm text-gray-600">How supporters want to connect with arts organizations</p>
            {relationshipTypes.map((type, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: PALETTE.augusta, opacity: 0.9 - (index * 0.15) }}
                  />
                  <span className="text-sm text-gray-700">{type.type}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-900">{type.count}</span>
                  <span className="text-xs text-gray-500">({type.percentage}%)</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Engagement Barriers">
          <div className="space-y-4">
            <p className="text-sm text-gray-600">What prevents deeper arts engagement</p>
            {engagementBarriers.map((barrier, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: PALETTE.openSky, opacity: 0.9 - (index * 0.1) }}
                  />
                  <span className="text-sm text-gray-700">{barrier.barrier}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-900">{barrier.count}</span>
                  <span className="text-xs text-gray-500">({barrier.percentage}%)</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Geographic Distribution */}
      <Card title="Archetype Geography">
        <div className="space-y-4">
          <div className="text-sm text-gray-600 flex items-center justify-between">
            <span>Showing {zipCodeData.length} ZIP codes across Greater Hartford and surrounding towns.</span>
            <button
              className="text-xs text-gray-600 hover:text-gray-900 underline decoration-dotted"
              onClick={() => setSelectedZip(null)}
            >
              Reset map
            </button>
          </div>

          {/* Location chips rail */}
          <div className="flex gap-2 overflow-x-auto py-1">
            <button
              className={[
                'shrink-0 rounded-full border px-3 py-1 text-xs',
                selectedZip == null ? 'bg-[#E6F4EA] border-[#CDEBD8] text-[#0E2A23]' : 'hover:bg-[#E6F4EA]'
              ].join(' ')}
              onClick={() => setSelectedZip(null)}
            >
              All Locations
            </button>
            {points.map((z) => {
              const label = z.city && z.city.trim().length ? z.city : `ZIP ${z.zip}`;
              return (
              <button
                key={z.zip}
                className={[
                  'shrink-0 rounded-full border px-3 py-1 text-xs flex items-center gap-2 transition',
                  selectedZip === z.zip
                    ? 'bg-[#E6F4EA] border-[#CDEBD8] text-[#0E2A23] ring-2 ring-[#64B37A]/50'
                    : 'hover:bg-[#E6F4EA]'
                ].join(' ')}
                onClick={() => setSelectedZip(z.zip)}
                title={`${z.city} ${z.zip}`}
              >
                <span className="font-medium">{label}</span>
                <span className="text-gray-500">{z.zip}</span>
                <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-emerald-500 text-white px-1 text-[10px]">
                  {z.count}
                </span>
              </button>
              )})}
          </div>

          <CTParticipantMap points={points} selectedZip={selectedZip ?? undefined} onSelectZip={setSelectedZip} />
        </div>
      </Card>

      {/* Ecosystem Priorities */}
      <Card title="Arts Ecosystem Priorities">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">Weighted by rank (1st = N, 2nd = N−1, …). Percentage shows share of total points.</p>
          <div className="space-y-2">
            {rankItems.length ? (
              rankItems.map((it, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-800">{it.label}</span>
                    <span className="text-gray-600">{it.pct}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className="h-2 rounded-full" style={{ width: `${it.pct}%`, background: 'linear-gradient(90deg,#64B37A 0%, #2F6D49 100%)' }} />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">No ranking data yet.</p>
            )}
          </div>
        </div>
      </Card>

      {/* Human Stories */}
      {/* Omitted: narrative spotlight duplicates dedicated Narrative Data */}

      {/* Two Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card title="Giving Patterns">
          <div className="space-y-4">
            {donationRanges.map((range, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ 
                      backgroundColor: range.range === 'Prefer not to say' ? PALETTE.riverRock : PALETTE.augusta,
                      opacity: 0.8 - (index * 0.1)
                    }}
                  />
                  <span className="text-sm text-gray-700">{range.range}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-900">{range.count}</span>
                  <span className="text-xs text-gray-500">({range.percentage}%)</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Community Perception of GHAC">
          <div className="space-y-4">
            <p className="text-sm text-gray-600 mb-4">Where the community places GHAC on key spectrums (1-5 scale)</p>
            {perceptionData.map((item, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700">{item.spectrum}</span>
                  <span className="font-medium" style={{ color: PALETTE.augusta }}>{item.average.toFixed(1)}</span>
                </div>
                <div className="relative">
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div 
                      className="h-full rounded-full"
                      style={{ 
                        width: `${(item.average / 5) * 100}%`,
                        backgroundColor: PALETTE.augusta,
                        opacity: 0.8
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>1</span>
                    <span>3</span>
                    <span>5</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Transformative Stories */}
      <Card title="How Arts Transform Lives">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {transformativeQuotes.map((story, index) => (
            <div key={index} className="space-y-3 p-4 rounded-lg" style={{ backgroundColor: '#E6F4EA' }}>
              <blockquote className="text-gray-800 leading-relaxed">
                "{story.quote}"
              </blockquote>
              <div className="text-sm font-medium" style={{ color: PALETTE.augustaD1 }}>
                — {story.role}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Bottom Summary */}
      <Card>
        <div className="text-center space-y-4">
          <h3 className="text-xl font-semibold text-gray-900">The Three-Dimensional Story</h3>
          <p className="text-gray-700 max-w-3xl mx-auto leading-relaxed">
            Your community spans from Hartford to Farmington, from Avon to Colchester - a regional network united by shared values. 
            They want sustainable funding as the top priority, followed by youth education and emerging artist support. 
            Time constraints challenge 36% of supporters, but they're seeking meaningful relationships through sharing skills 
            and staying informed about impact. They're not just donors - they're theater professors, CEOs, preachers, and 
            storytellers who see arts as essential community infrastructure for building bridges across different backgrounds.
          </p>
        </div>
      </Card>
    </section>
  );
}
