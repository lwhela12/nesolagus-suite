// src/lib/xlsx-parser.ts
import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';

export interface SurveyResponse {
  response_id: string;
  respondent_name: string;
  started_at: string;
  completed_at: string;
  [key: string]: any;
}

export function parseGHACSurvey() {
  const filePath = path.join(process.cwd(), 'src/data/ghac-survey-export.xlsx');
  const fileBuffer = fs.readFileSync(filePath);
  const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];

  // Convert to JSON with first row as headers
  const rawData = XLSX.utils.sheet_to_json(sheet, {
    raw: false,
    defval: null
  }) as any[];

  return rawData;
}

export function calculateMetrics(responses: any[]) {
  const totalStarts = responses.length;
  const totalCompletes = responses.filter(r => r.completed_at).length;
  const completionRate = totalStarts > 0 ? (totalCompletes / totalStarts) * 100 : 0;

  // Count demographic opt-ins (responses that have age or gender or race data)
  const demographicOptIns = responses.filter(r => {
    const ageCol = Object.keys(r).find(k => k.includes('age range'));
    const genderCol = Object.keys(r).find(k => k.includes('gender identity'));
    const raceCol = Object.keys(r).find(k => k.includes('racial or ethnic'));
    return r[ageCol as string] || r[genderCol as string] || r[raceCol as string];
  }).length;

  const demographicOptInRate = totalCompletes > 0 ? (demographicOptIns / totalCompletes) * 100 : 0;

  return {
    totalStarts,
    totalCompletes,
    completionRate: Math.round(completionRate * 10) / 10,
    demographicOptInRate: Math.round(demographicOptInRate * 10) / 10,
  };
}

export function analyzeConnectionTypes(responses: any[]) {
  const connectionCol = Object.keys(responses[0] || {}).find(k =>
    k.includes('connection to the Greater Hartford Arts Council')
  );

  if (!connectionCol) return [];

  const connections: Record<string, number> = {};
  responses.forEach(r => {
    const value = r[connectionCol];
    if (value) {
      connections[value] = (connections[value] || 0) + 1;
    }
  });

  return Object.entries(connections)
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);
}

export function analyzeArtsEssential(responses: any[]) {
  const essentialCol = Object.keys(responses[0] || {}).find(k =>
    k.includes('how essential do you believe they are')
  );

  if (!essentialCol) return 0;

  const values = responses
    .map(r => parseFloat(r[essentialCol]))
    .filter(v => !isNaN(v));

  const average = values.length > 0
    ? values.reduce((sum, v) => sum + v, 0) / values.length
    : 0;

  return Math.round(average * 10) / 10;
}

export function analyzeCreativityTypes(responses: any[]) {
  const creativityCol = Object.keys(responses[0] || {}).find(k =>
    k.includes('relationship to creativity')
  );

  if (!creativityCol) return [];

  const types: Record<string, number> = {};
  responses.forEach(r => {
    const value = r[creativityCol];
    if (value && typeof value === 'string') {
      const items = value.split(';').map(s => s.trim());
      items.forEach(item => {
        if (item) {
          types[item] = (types[item] || 0) + 1;
        }
      });
    }
  });

  return Object.entries(types)
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 4);
}

export function analyzePriorities(responses: any[]) {
  const prioritiesCol = Object.keys(responses[0] || {}).find(k =>
    k.includes('strengthened in Greater Hartford')
  );

  if (!prioritiesCol) return [];

  const priorities: Record<string, number> = {};
  responses.forEach(r => {
    const value = r[prioritiesCol];
    if (value && typeof value === 'string') {
      const items = value.split(';').map(s => s.trim());
      items.forEach(item => {
        if (item) {
          priorities[item] = (priorities[item] || 0) + 1;
        }
      });
    }
  });

  return Object.entries(priorities)
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 4);
}

export function analyzeEngagementBarriers(responses: any[]) {
  const barriersCol = Object.keys(responses[0] || {}).find(k =>
    k.includes('makes it challenging to engage')
  );

  if (!barriersCol) return [];

  const barriers: Record<string, number> = {};
  responses.forEach(r => {
    const value = r[barriersCol];
    if (value && typeof value === 'string') {
      const items = value.split(';').map(s => s.trim());
      items.forEach(item => {
        if (item) {
          barriers[item] = (barriers[item] || 0) + 1;
        }
      });
    }
  });

  return Object.entries(barriers)
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 4);
}
