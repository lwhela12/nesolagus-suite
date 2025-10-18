import { NextRequest, NextResponse } from 'next/server'

// Mock data - in production this would query actual participant data
const generatePersonaData = (personaId: string) => {
  const baseData: Record<string, any[]> = {
    'strategist': [
      { name: 'Robert Chen', email: 'rchen@example.com', capacity: '$50,000', readiness: '9.5', phone: '(860) 555-0123', lastContact: '2025-09-15', notes: 'Board interested, requested data briefing' },
      { name: 'Elizabeth Morrison', email: 'emorrison@example.com', capacity: '$75,000', readiness: '9.8', phone: '(860) 555-0124', lastContact: '2025-09-20', notes: 'Corporate match available, strategic initiative interest' },
      { name: 'David Park', email: 'dpark@example.com', capacity: '$35,000', readiness: '8.9', phone: '(860) 555-0125', lastContact: '2025-08-30', notes: 'CEO peer-to-peer recommended' },
      { name: 'Margaret Sullivan', email: 'msullivan@example.com', capacity: '$100,000+', readiness: '9.0', phone: '(860) 555-0126', lastContact: '2025-10-01', notes: 'Multi-year commitment potential, naming opportunity' },
      { name: 'James Rodriguez', email: 'jrodriguez@example.com', capacity: '$40,000', readiness: '8.7', phone: '(860) 555-0127', lastContact: '2025-09-10', notes: 'Economic development angle resonates' },
      { name: 'Sarah Johnson', email: 'sjohnson@example.com', capacity: '$60,000', readiness: '9.2', phone: '(860) 555-0128', lastContact: '2025-09-25', notes: 'Board governance background, strategic planning interest' },
    ],
    'enthusiast': [
      { name: 'Maria Garcia', email: 'mgarcia@example.com', capacity: '$750', readiness: '8.5', phone: '(860) 555-0201', lastContact: '2025-09-18', notes: 'Artist connection strong, volunteer interest' },
      { name: 'Thomas Wright', email: 'twright@example.com', capacity: '$500', readiness: '8.2', phone: '(860) 555-0202', lastContact: '2025-09-12', notes: 'Behind-the-scenes access motivates' },
      { name: 'Jennifer Lee', email: 'jlee@example.com', capacity: '$1,000', readiness: '8.8', phone: '(860) 555-0203', lastContact: '2025-10-05', notes: 'Monthly donor, high engagement' },
      { name: 'Michael Brown', email: 'mbrown@example.com', capacity: '$600', readiness: '7.9', phone: '(860) 555-0204', lastContact: '2025-08-22', notes: 'Impact stories resonate' },
      { name: 'Linda Martinez', email: 'lmartinez@example.com', capacity: '$800', readiness: '8.4', phone: '(860) 555-0205', lastContact: '2025-09-28', notes: 'Creative Circle prospect' },
    ],
    'community-builder': [
      { name: 'Christopher Davis', email: 'cdavis@example.com', capacity: '$2,500', readiness: '7.8', phone: '(860) 555-0301', lastContact: '2025-09-22', notes: 'Ambassador program interest, large network' },
      { name: 'Amanda Wilson', email: 'awilson@example.com', capacity: '$1,500', readiness: '8.0', phone: '(860) 555-0302', lastContact: '2025-09-15', notes: 'Regional equity focus, West Hartford connections' },
      { name: 'Daniel Anderson', email: 'danderson@example.com', capacity: '$3,000', readiness: '7.5', phone: '(860) 555-0303', lastContact: '2025-08-30', notes: 'Social media advocate, peer-to-peer potential' },
      { name: 'Patricia Taylor', email: 'ptaylor@example.com', capacity: '$2,000', readiness: '7.9', phone: '(860) 555-0304', lastContact: '2025-10-02', notes: 'Event host candidate' },
      { name: 'Kevin Thomas', email: 'kthomas@example.com', capacity: '$1,800', readiness: '7.6', phone: '(860) 555-0305', lastContact: '2025-09-08', notes: 'Community organizing background' },
    ],
    'creative-mind': [
      { name: 'Rebecca White', email: 'rwhite@example.com', capacity: '$750', readiness: '6.5', phone: '(860) 555-0401', lastContact: '2023-12-15', notes: 'Former Travelers donor, lapsed 18 months' },
      { name: 'Steven Harris', email: 'sharris@example.com', capacity: '$1,000', readiness: '6.8', phone: '(860) 555-0402', lastContact: '2024-03-10', notes: 'Job change, new employer partnership opportunity' },
      { name: 'Michelle Clark', email: 'mclark@example.com', capacity: '$500', readiness: '6.2', phone: '(860) 555-0403', lastContact: '2023-11-20', notes: 'Life change (moved), reactivation target' },
      { name: 'Brian Lewis', email: 'blewis@example.com', capacity: '$900', readiness: '6.9', phone: '(860) 555-0404', lastContact: '2024-01-05', notes: 'Former workplace giving, welcome back campaign' },
      { name: 'Karen Walker', email: 'kwalker@example.com', capacity: '$650', readiness: '6.4', phone: '(860) 555-0405', lastContact: '2024-02-14', notes: 'Artist connection, program update needed' },
    ],
  }

  return baseData[personaId] || []
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const personaId = searchParams.get('persona')

  if (!personaId) {
    return NextResponse.json({ error: 'Persona ID required' }, { status: 400 })
  }

  const data = generatePersonaData(personaId)

  // Convert to CSV
  const headers = Object.keys(data[0] || {})
  const csvRows = [
    headers.join(','), // Header row
    ...data.map(row =>
      headers.map(header => {
        const value = row[header]
        // Escape quotes and wrap in quotes if contains comma
        return typeof value === 'string' && value.includes(',')
          ? `"${value.replace(/"/g, '""')}"`
          : value
      }).join(',')
    )
  ]

  const csv = csvRows.join('\n')

  const personaNames: Record<string, string> = {
    'strategist': 'The_Strategist',
    'enthusiast': 'The_Enthusiast',
    'community-builder': 'The_Community_Builder',
    'creative-mind': 'The_Creative_Mind'
  }

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="GHAC_${personaNames[personaId] || 'Persona'}_Prospects_${new Date().toISOString().split('T')[0]}.csv"`
    }
  })
}
