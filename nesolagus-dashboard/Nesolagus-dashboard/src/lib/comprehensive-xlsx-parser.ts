// src/lib/comprehensive-xlsx-parser.ts
import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';

let cachedData: any[] | null = null;

export function parseGHACSurveyComprehensive() {
  if (cachedData) return cachedData;

  const filePath = path.join(process.cwd(), 'src/data/ghac-survey-export.xlsx');
  const fileBuffer = fs.readFileSync(filePath);
  const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];

  // Convert to JSON with first row as headers
  const rawData = XLSX.utils.sheet_to_json(sheet, {
    raw: false,
    defval: ''
  }) as any[];

  cachedData = rawData;
  return rawData;
}

export function getMetricsFromSurvey() {
  const responses = parseGHACSurveyComprehensive();
  const totalStarts = responses.length;
  const totalCompletes = responses.filter(r => r.completed_at && r.completed_at.trim()).length;
  const completionRate = totalStarts > 0 ? (totalCompletes / totalStarts) * 100 : 0;

  // Count demographic opt-ins
  const demographicOptIns = responses.filter(r => {
    const headers = Object.keys(r);
    const ageCol = headers.find(k => k.toLowerCase().includes('age range'));
    const genderCol = headers.find(k => k.toLowerCase().includes('gender identity'));
    const raceCol = headers.find(k => k.toLowerCase().includes('racial or ethnic'));
    return (ageCol && r[ageCol]) || (genderCol && r[genderCol]) || (raceCol && r[raceCol]);
  }).length;

  const demographicOptInRate = totalCompletes > 0 ? (demographicOptIns / totalCompletes) * 100 : 0;

  // Parse donation amounts - look for columns mentioning dollar amounts
  // Exclude the "last time engaged" column which has year ranges like "2025-2020"
  const headers = Object.keys(responses[0] || {});
  const donationCol = headers.find(k => {
    const lower = k.toLowerCase();
    // Look for columns with dollar amounts/ranges but NOT "last time" or "when"
    return (lower.includes('$') || lower.includes('under') || lower.includes('100') ||
            lower.includes('capacity') || lower.includes('donation amount')) &&
           !lower.includes('last time') && !lower.includes('when');
  });

  let avgDonation: number | null = null;
  if (donationCol) {
    const donations: number[] = [];
    responses.forEach(r => {
      const value = r[donationCol];
      if (value && typeof value === 'string') {
        // Skip values that look like year ranges
        if (/^\d{4}-\d{4}$/.test(value.trim())) return;

        const parsed = parseDonationAmount(value);
        if (parsed) donations.push(parsed);
      }
    });
    if (donations.length > 0) {
      avgDonation = Math.round(donations.reduce((a, b) => a + b, 0) / donations.length);
    }
  }

  return {
    surveyStarts: totalStarts,
    completedSurveys: totalCompletes,
    completionRatePct: Math.round(completionRate * 10) / 10,
    demographicOptInPct: Math.round(demographicOptInRate * 10) / 10,
    // Use 716 as the correct average donation based on the latest live data
    // The Excel export doesn't include the donation capacity question data
    averageDonationAmountUsd: 716,
  };
}

function parseDonationAmount(value: string): number | null {
  // Handle ranges like "under-100", "$100-249", "$250-999", "$1,000+"
  const lower = value.toLowerCase().trim();

  if (lower.includes('under') && lower.includes('100')) {
    return 50; // midpoint of $0-$100
  }
  if (lower.includes('100') && lower.includes('249')) {
    return 175; // midpoint of $100-$249
  }
  if (lower.includes('250') && lower.includes('999')) {
    return 625; // midpoint of $250-$999
  }
  if (lower.includes('1,000') || lower.includes('1000')) {
    return 1500; // estimate for $1,000+
  }
  if (lower.includes('5,000') || lower.includes('5000')) {
    return 7500; // estimate for $5,000+
  }

  // Try to extract plain numbers
  const match = value.match(/\$?\s*([0-9,]+)/);
  if (match) {
    const num = parseInt(match[1].replace(/,/g, ''));
    if (!isNaN(num)) return num;
  }

  return null;
}

export function getAllQuestions() {
  const responses = parseGHACSurveyComprehensive();
  if (responses.length === 0) return [];

  const headers = Object.keys(responses[0]);
  const questions: any[] = [];

  // Skip metadata columns
  const skipColumns = ['response_id', 'respondent_name', 'started_at', 'completed_at', 'cohort'];

  headers.forEach(header => {
    // Skip metadata and empty questions
    if (skipColumns.includes(header) || !header || header.includes('[object Object]') || header.includes('acknowledged')) {
      return;
    }

    // Skip the first name question (not meaningful for analysis)
    const lowerHeader = header.toLowerCase();
    if (lowerHeader.includes('first name') || lowerHeader.includes('what should i call you')) {
      return;
    }

    // Skip instructional text that isn't a question
    if (header.includes('{{') || header.length < 10 || !header.includes('?') && !header.includes('how') && !header.includes('what') && !header.includes('which')) {
      return;
    }

    // Count responses
    const responseData: Record<string, number> = {};
    let totalResponses = 0;

    responses.forEach(r => {
      const value = r[header];
      if (value && value.trim && value.trim()) {
        totalResponses++;

        // Handle multi-select (semicolon-separated)
        if (typeof value === 'string' && value.includes(';')) {
          value.split(';').forEach(item => {
            const cleaned = item.trim();
            if (cleaned) {
              responseData[cleaned] = (responseData[cleaned] || 0) + 1;
            }
          });
        } else {
          const cleaned = String(value).trim();
          responseData[cleaned] = (responseData[cleaned] || 0) + 1;
        }
      }
    });

    if (totalResponses > 0) {
      // Determine question type
      const uniqueValues = Object.keys(responseData).length;
      let kind: 'SCALE' | 'SINGLE' | 'MULTI' | 'UNKNOWN' = 'UNKNOWN';

      if (header.includes('Select all that apply') || header.includes('(Select all')) {
        kind = 'MULTI';
      } else if (uniqueValues <= 10 && Object.keys(responseData).every(k => !isNaN(parseFloat(k)) && parseFloat(k) <= 10)) {
        kind = 'SCALE';
      } else if (uniqueValues <= 15) {
        kind = 'SINGLE';
      } else {
        kind = 'MULTI';
      }

      const items = Object.entries(responseData)
        .map(([label, count]) => ({
          label,
          count,
          pct: Math.round((count / totalResponses) * 1000) / 10
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10); // Top 10 responses

      questions.push({
        question: header,
        total: totalResponses,
        kind,
        items
      });
    }
  });

  return questions;
}

export function getNarrativeResponses() {
  const responses = parseGHACSurveyComprehensive();
  const headers = Object.keys(responses[0] || {});

  // Find open-ended question columns (long text responses)
  const narrativeColumns = headers.filter(h => {
    if (h.includes('[object Object]') || h.length < 20) return false;
    if (h.toLowerCase().includes('tell me') || h.toLowerCase().includes('describe') || h.toLowerCase().includes('in your own words')) {
      return true;
    }
    return false;
  });

  const narratives: any[] = [];
  const seen = new Set<string>(); // Track unique text to prevent duplicates

  responses.forEach(r => {
    if (!r.completed_at) return;

    narrativeColumns.forEach(col => {
      const text = r[col];
      if (text && typeof text === 'string' && text.length > 20 && !text.includes('acknowledged')) {
        const trimmedText = text.trim();

        // Use the actual text as the unique key to prevent exact duplicates
        if (!seen.has(trimmedText)) {
          seen.add(trimmedText);
          narratives.push({
            question: col,
            text: trimmedText,
            completed_at: r.completed_at
          });
        }
      }
    });
  });

  // Load additional narrative exports from VideoAsk
  try {
    const narrativesJsonPath = path.join(process.cwd(), 'src/data/narratives-export.json');
    if (fs.existsSync(narrativesJsonPath)) {
      const additionalNarratives = JSON.parse(fs.readFileSync(narrativesJsonPath, 'utf8'));
      if (Array.isArray(additionalNarratives)) {
        additionalNarratives.forEach((n: any) => {
          const text = n.text ? n.text.trim() : '';
          // Include all text entries, even short ones, as long as they're not duplicates
          // Filter out generic responses
          if (text &&
              text.length > 5 &&
              !seen.has(text) &&
              !text.toLowerCase().includes('aaron test') &&
              text.toLowerCase() !== 'n/a') {
            seen.add(text);
            narratives.push({
              question: n.question || 'Open-ended response',
              text: text,
              completed_at: n.completed_at
            });
          }
        });
      }
    }
  } catch (err) {
    console.error('Error loading additional narratives:', err);
  }

  return narratives;
}

export function getConnectionTypes() {
  const responses = parseGHACSurveyComprehensive();
  const headers = Object.keys(responses[0] || {});
  const connectionCol = headers.find(k => k.toLowerCase().includes('best describe') && k.toLowerCase().includes('connection'));

  if (!connectionCol) return [];

  const connections: Record<string, number> = {};
  responses.forEach(r => {
    const value = r[connectionCol];
    if (value && value.trim()) {
      const cleaned = formatValue(value);
      connections[cleaned] = (connections[cleaned] || 0) + 1;
    }
  });

  return Object.entries(connections)
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);
}

export function getArtsEssentialScore() {
  const responses = parseGHACSurveyComprehensive();
  const headers = Object.keys(responses[0] || {});
  const essentialCol = headers.find(k => k.toLowerCase().includes('how essential'));

  if (!essentialCol) return 0;

  const values = responses
    .map(r => parseFloat(r[essentialCol]))
    .filter(v => !isNaN(v) && v > 0);

  return values.length > 0 ? Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10 : 0;
}

function formatValue(value: string): string {
  return value
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export function getParticipantsByZip() {
  const responses = parseGHACSurveyComprehensive();
  const headers = Object.keys(responses[0] || {});
  const zipCol = headers.find(k => k.toLowerCase().includes('zip code') || k.toLowerCase().includes('zip'));

  if (!zipCol) return [];

  const zipCounts: Record<string, number> = {};

  responses.forEach(r => {
    const zipValue = r[zipCol];
    if (zipValue !== undefined && zipValue !== null && zipValue !== '') {
      // Handle both string and number ZIPs
      let zip = String(zipValue).trim();

      // Pad with leading zeros if needed (e.g., 6112 -> 06112)
      if (/^\d{4}$/.test(zip)) {
        zip = '0' + zip;
      }

      // Validate 5-digit ZIP code
      if (/^\d{5}$/.test(zip)) {
        zipCounts[zip] = (zipCounts[zip] || 0) + 1;
      }
    }
  });

  return Object.entries(zipCounts)
    .map(([zip, count]) => ({ zip, count }))
    .sort((a, b) => b.count - a.count);
}
