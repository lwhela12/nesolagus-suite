'use client'

import { use, useState } from 'react'
import AppHeader from '@/components/ui/app-header'
import Link from 'next/link'
import { ArrowLeft, Copy, Mail, Send, Sparkles, Download } from 'lucide-react'

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={["rounded-2xl border bg-white shadow-sm p-6", className].join(' ')}>{children}</div>
}

const personaConfig: Record<string, any> = {
  'strategist': {
    name: 'The Strategist',
    color: '#2F6D49',
    bgColor: '#F0F8F4',
    templates: [
      {
        id: 'board-ask',
        name: 'Board Recruitment',
        subject: 'A Conversation: The Arts Aren\'t Charity—They\'re Infrastructure',
        body: `Dear [Name],

We just finished listening to 179 people from Greater Hartford about the role of arts in our region's future. One quote stopped me in my tracks:

*"The arts aren't charity—they're infrastructure. I invest in what makes this region competitive."*

That came from someone in your world—a strategic thinker who gets that Hartford competes with Boston and Providence for talent, and our cultural ecosystem is part of that equation.

**Here's what we heard—in people's own words:**

82% said arts are critical to talent retention. But it wasn't just "yes" answers. Listen to how they said it:
• *"People come here because of the arts. That's why I stayed."*
• *"If we want young professionals, we need a vibrant creative scene."*
• *"Arts orgs are businesses. Treat them like the economic engines they are."*

The data's compelling ($47M annual economic impact), but the *why* behind the data? That's the real story.

**We're not asking you to join a charity board.**

We're building a regional economic development strategy where artists are paid fairly, creative organizations thrive, and Hartford becomes the place people move *to*, not away from.

Your expertise in [specific area] is exactly what we need at the table—not to fundraise (though that helps), but to think strategically about scaling impact.

Can we grab coffee? I'd love to share what these 179 voices taught us and co-create the roadmap forward with you.

Are you available for 30 minutes in the next two weeks?

Looking forward,

[Your Name]
CEO, Greater Hartford Arts Council

P.S. Street Stages pays artists $200/hour—not as a nice gesture, but because creative work is skilled labor. This is systems change, not charity.`
      },
      {
        id: 'major-gift',
        name: 'Major Gift Proposal',
        subject: 'What We Learned from 179 Voices (And What It Means for You)',
        body: `Dear [Name],

Thank you for coffee last week. Your question—"How do we measure ROI on arts investment?"—stayed with me because it's the same question our community asked themselves.

Not explicitly. But when we listened to 179 people talk about Hartford's future, they told us stories about why they stayed, why they left, and what would bring them back.

**Here's what we heard about economic impact:**

One person said: *"I chose Hartford over Boston because of the arts scene. Then Travelers cut workplace giving, and I realized we're more fragile than I thought."*

Another: *"My company recruits here because we can offer culture without New York costs. But if the creative ecosystem dies, so does our competitive advantage."*

These aren't feel-good anecdotes. They're economic signals.

When we asked people what would make Hartford thrive, they co-created a vision where:
• Artists make sustainable livings (not side hustles)
• Creative businesses stay here (not flee to Providence)
• Regional equity means talent across all 34 towns

Your $[amount] investment would fund the systems infrastructure they described:
• **Street Stages expansion**: Fair wages ($200/hr) for 50+ artists across the region
• **Skills Development**: Business training so creatives build sustainable careers here
• **Multi-generational incubators**: Long-term capacity, not short-term grants

**The ROI they care about?**
• Retention: People staying because Hartford feels vibrant
• Recruitment: Companies citing cultural ecosystem in hiring
• Resilience: Creative economy that survives economic shifts

I'm not asking you to fund a charity. I'm asking you to co-invest in the infrastructure these 179 voices said they need.

Can we schedule a studio visit next month? I'd love for you to meet the artists whose careers your partnership would sustain—and hear firsthand why they chose Hartford.

Would [date options] work?

This is economic development. The ROI is talent retention and regional competitiveness.

With respect,

[Your Name]
CEO, Greater Hartford Arts Council

P.S. The data backs up the stories: $4.20 returns per dollar invested, 23 artist jobs per program. But the *why* behind those numbers? That's what these conversations revealed.`
      }
    ]
  },
  'enthusiast': {
    name: 'The Enthusiast',
    color: '#64B37A',
    bgColor: '#E6F4EA',
    templates: [
      {
        id: 'creative-circle',
        name: 'Creative Circle Upgrade',
        subject: 'You\'re Making Artists\' Dreams Possible—Want to Do More?',
        body: `Dear [Name],

I wanted to share a story that made me think of you immediately.

Last month, a painter named Jasmine told me: "For the first time in my career, I'm being paid what my work is worth. $200 an hour through Street Stages. I cried when I got that first check."

That's *your* gift at work.

Your $[amount] donation didn't just fund a program—it changed an artist's life. It said: "Your work matters. Your talent has value. Hartford sees you."

**Here's the impact you've made:**
• 12 artists paid fairly through Street Stages
• 3 emerging artists received business skills training
• 47 schoolchildren experienced live performance
• 1 regional equity expansion pilot (West Hartford)

I'm writing today because we're launching the **Creative Circle**—a community of supporters like you who give $500+ annually and get behind-the-scenes access to the artists you're supporting.

**Creative Circle perks:**
• Private studio tours with featured artists
• Exclusive previews of new work
• Quarterly artist spotlight emails (see your gift in action)
• Invitation to intimate donor gatherings

Would you consider joining at the $750 level? Your impact would support 3.75 hours of artist work at fair wages—or one skills training session that changes a creative career.

[DONATE BUTTON]

Thank you for believing artists deserve to be paid for their genius.

With deep gratitude,

[Your Name]
CEO, Greater Hartford Arts Council

P.S. Next month's Creative Circle event: meet the muralist transforming downtown Hartford. I'll save you a spot.`
      },
      {
        id: 'impact-update',
        name: 'Impact Story Update',
        subject: 'Your Gift in Action: Meet the Artist You Supported',
        body: `Dear [Name],

Remember when you donated last spring? Here's what happened with your gift.

**Meet Marcus, Percussionist & Teaching Artist:**

"I never thought I could make a living doing what I love in Hartford. Then GHAC's Street Stages changed everything."

Marcus is a 34-year-old drummer who spent 10 years teaching by day, gigging by night, and wondering if he should give up on music entirely.

Your gift helped us pay Marcus $200/hour to perform at 6 community events this summer. He reached 800 people. But more than that—he reached stability.

"For the first time, I'm not choosing between rent and my art. I'm thriving."

**This is what you made possible:**
• Fair wages for 23 local artists (avg. $185/hour)
• 8 new venues in underserved communities
• 1,200+ residents experienced live local art
• 100% of artists reported increased financial stability

Your $[amount] doesn't feel like much to you. But to Marcus? It's everything.

**Want to do it again?**
We're expanding Street Stages to 34 towns next year. More artists. More communities. More impact.

[DONATE BUTTON]

Thank you for making Hartford a place where artists can stay, thrive, and create.

Gratefully,

[Your Name]
CEO, Greater Hartford Arts Council

P.S. Marcus teaches drum circles for kids now too. Your gift keeps giving.`
      }
    ]
  },
  'community-builder': {
    name: 'The Community Builder',
    color: '#86C99B',
    bgColor: '#F6F9F7',
    templates: [
      {
        id: 'ambassador',
        name: 'Ambassador Invitation',
        subject: 'Help Us Bring Arts to Every Corner of Greater Hartford',
        body: `Dear [Name],

Your name came up in three different conversations this month. Three separate people said: "If you want to reach [community], talk to [Name]. They know everyone."

So here I am.

We're expanding GHAC's reach from Hartford-centric to truly regional—all 34 towns. Not just serving affluent suburbs, but ensuring every community has access to quality arts programming.

**The challenge:** We can't do this alone.

**The opportunity:** You're already a connector. You know your community's needs, its leaders, its hidden champions. You're exactly who we need.

**What being a GHAC Ambassador looks like:**
• Host one house party or coffee gathering per year (we provide toolkit)
• Refer 3-5 potential supporters or partners
• Share our work on social media when something excites you
• Provide community intel: what does [your town] need from us?

**What you get:**
• Insider access to regional expansion planning
• Quarterly ambassador gatherings (learn + network)
• Recognition as a community champion
• Satisfaction of making arts accessible to everyone

Your town deserves the same cultural vibrancy Hartford has. You can make that happen.

Are you in? Reply with "YES" and I'll send the Ambassador toolkit.

Together we build this,

[Your Name]
CEO, Greater Hartford Arts Council

P.S. Our first regional pilot is in [nearby town]. Want to help us learn from it?`
      }
    ]
  },
  'creative-mind': {
    name: 'The Creative Mind',
    color: '#A9D8B7',
    bgColor: '#FAFCFB',
    templates: [
      {
        id: 'welcome-back',
        name: 'Welcome Back Campaign',
        subject: 'We Miss You (And Here\'s What You\'ve Missed)',
        body: `Dear [Name],

It's been a while. The last time we connected, you were giving through the Travelers workplace campaign. Then... life happened. Job changed, maybe. Priorities shifted. We get it.

But I wanted to reach out personally because *so much has changed* at GHAC—and I think you'd be excited about where we're headed.

**Remember when you used to give because you loved the arts?**

That passion you had? It's still valid. And GHAC is doing something completely different now.

**What's new:**
• **Street Stages**: We're paying artists $200/hour (yes, really)
• **34-Town Expansion**: Hartford AND West Hartford, Bloomfield, Simsbury, etc.
• **Artist-First Model**: No more "pass-through." We're building careers.
• **Economic Impact**: $47M annually in the creative economy

You stopped giving because the old model didn't feel impactful. We heard you. We changed.

**Come back?**

Your old $[amount] gift used to fund... honestly, we're not sure. It got distributed without much visibility.

Now? $500 funds 2.5 hours of fair-wage artist work. You'd know *exactly* where it goes and who it helps.

[MAKE YOUR COMEBACK GIFT]

Start with $100 if that feels right. We just want you back in the fold.

Welcome home,

[Your Name]
CEO, Greater Hartford Arts Council

P.S. New workplace giving options too. If your current employer offers it, GHAC is on the list. Easy.`
      }
    ]
  }
}

export default function CultivationEmailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [selectedTemplate, setSelectedTemplate] = useState(0)
  const [copied, setCopied] = useState(false)

  const persona = personaConfig[id] || personaConfig['enthusiast']
  const template = persona.templates[selectedTemplate]

  const handleCopy = () => {
    navigator.clipboard.writeText(`Subject: ${template.subject}\n\n${template.body}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    const content = `Subject: ${template.subject}\n\n${template.body}`
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `GHAC_${persona.name.replace(/\s+/g, '_')}_${template.name.replace(/\s+/g, '_')}.txt`
    a.click()
  }

  return (
    <section className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/personas"
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </Link>
        <AppHeader
          title={`${persona.name} Cultivation Emails`}
          subtitle="Pre-written, persona-specific email templates ready to customize"
        />
      </div>

      {/* Info Banner */}
      <div className="rounded-xl p-4 flex items-start gap-3" style={{ backgroundColor: persona.bgColor, borderLeft: `4px solid ${persona.color}` }}>
        <Sparkles className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: persona.color }} />
        <div>
          <h3 className="font-semibold text-gray-900 mb-1">Persona-Specific Email Templates</h3>
          <p className="text-sm text-gray-700">
            These emails are written specifically for {persona.name} segment—leveraging their motivations,
            communication preferences, and barriers identified in the survey. Built from narrative insights
            and co-created strategy. Customize with specific names and details before sending.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Template Selector */}
        <div className="lg:col-span-1">
          <Card>
            <h3 className="font-semibold text-gray-900 mb-4">Email Templates</h3>
            <div className="space-y-2">
              {persona.templates.map((template: any, index: number) => (
                <button
                  key={template.id}
                  onClick={() => setSelectedTemplate(index)}
                  className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                    selectedTemplate === index
                      ? 'shadow-md'
                      : 'hover:bg-gray-50'
                  }`}
                  style={{
                    borderColor: selectedTemplate === index ? persona.color : '#e5e7eb',
                    backgroundColor: selectedTemplate === index ? persona.bgColor : 'white'
                  }}
                >
                  <div className="font-medium text-gray-900 text-sm">{template.name}</div>
                  <div className="text-xs text-gray-600 mt-1">
                    For {persona.name.toLowerCase()} segment
                  </div>
                </button>
              ))}
            </div>

            {/* Stats */}
            <div className="mt-6 p-3 rounded-lg bg-gray-50 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-600">Templates Available:</span>
                <span className="font-semibold text-gray-900">{persona.templates.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Persona Match:</span>
                <span className="font-semibold" style={{ color: persona.color }}>100%</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Email Preview */}
        <div className="lg:col-span-2">
          <Card>
            <div className="space-y-4">
              {/* Email Header */}
              <div className="flex items-start justify-between pb-4 border-b">
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">{template.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Optimized for {persona.name} motivations and preferences
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleCopy}
                    className="px-3 py-2 text-sm font-medium rounded-lg border-2 flex items-center gap-2 hover:bg-gray-50 transition-colors"
                    style={{ borderColor: persona.color, color: persona.color }}
                  >
                    {copied ? (
                      <>
                        <span>✓</span>
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        Copy
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleDownload}
                    className="px-3 py-2 text-sm font-medium rounded-lg text-white flex items-center gap-2 hover:opacity-90"
                    style={{ backgroundColor: persona.color }}
                  >
                    <Download className="h-4 w-4" />
                    Download
                  </button>
                </div>
              </div>

              {/* Subject Line */}
              <div>
                <div className="text-xs font-semibold text-gray-700 mb-2">SUBJECT LINE</div>
                <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
                  <p className="text-sm font-medium text-gray-900">{template.subject}</p>
                </div>
              </div>

              {/* Email Body */}
              <div>
                <div className="text-xs font-semibold text-gray-700 mb-2">EMAIL BODY</div>
                <div
                  className="p-4 rounded-lg border-2 bg-white min-h-[400px] whitespace-pre-wrap text-sm leading-relaxed text-gray-800 font-mono"
                  style={{ borderColor: persona.color }}
                >
                  {template.body}
                </div>
              </div>

              {/* Customization Notes */}
              <div className="rounded-lg p-4" style={{ backgroundColor: persona.bgColor }}>
                <h4 className="font-semibold text-gray-900 mb-2 text-sm">Before Sending: Customize These Fields</h4>
                <ul className="space-y-1 text-xs text-gray-700">
                  <li className="flex items-start gap-1">
                    <span style={{ color: persona.color }}>•</span>
                    <span><strong>[Name]</strong> - Recipient's first name</span>
                  </li>
                  <li className="flex items-start gap-1">
                    <span style={{ color: persona.color }}>•</span>
                    <span><strong>[amount]</strong> - Previous gift amount or capacity</span>
                  </li>
                  <li className="flex items-start gap-1">
                    <span style={{ color: persona.color }}>•</span>
                    <span><strong>[specific area]</strong> - Donor's expertise or interests</span>
                  </li>
                  <li className="flex items-start gap-1">
                    <span style={{ color: persona.color }}>•</span>
                    <span><strong>[Your Name]</strong> - Your name and title</span>
                  </li>
                </ul>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t">
                <button className="flex-1 px-4 py-3 rounded-lg text-sm font-medium text-white flex items-center justify-center gap-2 hover:opacity-90"
                  style={{ backgroundColor: persona.color }}
                >
                  <Mail className="h-4 w-4" />
                  Open in Email Client
                </button>
                <button className="px-4 py-3 rounded-lg text-sm font-medium border-2 flex items-center gap-2 hover:bg-gray-50"
                  style={{ borderColor: persona.color, color: persona.color }}
                >
                  <Send className="h-4 w-4" />
                  Send Test
                </button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  )
}
