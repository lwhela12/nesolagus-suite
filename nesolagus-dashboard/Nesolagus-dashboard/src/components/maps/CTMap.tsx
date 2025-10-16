'use client';

import { useMemo, useState } from 'react';
import AppHeader from '@/components/ui/app-header';
import CTMap from '@/components/maps/CTMap';

// Brand palette
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

const humanStories = [
  { role: "Theater Professor & Arts Ambassador", quote: "I am a co-founder and current ensemble member of HartBeat Ensemble. I serve as an Arts Ambassador for GHAC.", connection: "Professional & Volunteer" },
  { role: "Former GHAC Staff & Parent", quote: "I worked for the GHAC for a few years... I believe in the importance of having art within the community.", connection: "Multi-generational Supporter" },
  { role: "CEO & Arts Administrator", quote: "I operate The 224 EcoSpace, which provides a creative and entrepreneurial hub for artists of color.", connection: "Community Builder" },
  { role: "State Arts Leader", quote: "Chair of CT