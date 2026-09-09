import React, { useEffect, useRef } from 'react'

const FEATURES = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
      </svg>
    ),
    title: 'Rich Text Editor',
    desc: 'Write beautifully with our distraction-free Markdown editor. Format, embed images, and publish with one click.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
      </svg>
    ),
    title: 'Grow Your Audience',
    desc: 'Connect with readers who care about your niche. Share your story and build a loyal following over time.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    ),
    title: 'Engage & Discuss',
    desc: 'Spark conversations. Readers can respond, highlight passages, and build on your ideas.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
        <line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
      </svg>
    ),
    title: 'Publish Everywhere',
    desc: 'Distribute your newsletter via email, or embed your articles anywhere with clean embed codes.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/>
        <line x1="6" y1="20" x2="6" y2="14"/>
      </svg>
    ),
    title: 'Deep Analytics',
    desc: 'Track reads, time-on-page, and subscriber growth. Understand what resonates with your audience.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
    title: 'Your Words, Your Rights',
    desc: 'Full ownership of your content. Export anytime. We believe writers should own what they create.',
  },
]

export default function FeaturesSection() {
  const cardRefs = useRef([])

  // Scroll-reveal via IntersectionObserver
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.setAttribute('data-revealed', 'true')
          }
        })
      },
      { threshold: 0.12 }
    )
    cardRefs.current.forEach((el) => el && observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <section id="features" className="py-28 bg-[#0a0a0a]">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-20">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-px w-8 bg-[#c9a84c]/40" />
            <p className="font-sans-ui text-xs tracking-[0.2em] text-[#c9a84c] uppercase">
              Why Inkspace
            </p>
            <div className="h-px w-8 bg-[#c9a84c]/40" />
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-[#f5e6c8] mb-5">
            Everything a writer needs
          </h2>
          <p className="font-sans-ui text-[#5a5248] max-w-xl mx-auto leading-relaxed">
            We built Inkspace so you can focus on the craft. The tools take care of everything else.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-[#1e1c18]">
          {FEATURES.map((f, i) => (
            <div
              key={f.title}
              ref={(el) => (cardRefs.current[i] = el)}
              className="reveal bg-[#0a0a0a] p-8 group hover:bg-[#0f0e0b] transition-all duration-300 hover:-translate-y-0.5 relative overflow-hidden"
              style={{ transitionDelay: `${i * 0.07}s` }}
            >
              {/* Hover top-border accent */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#c9a84c]/0 to-transparent group-hover:via-[#c9a84c]/60 transition-all duration-500" />

              <div className="w-10 h-10 rounded-xl bg-[#1a1600] border border-[#2e2a1a] text-[#c9a84c] flex items-center justify-center mb-5 group-hover:border-[#c9a84c]/60 group-hover:bg-[#221e00] group-hover:animate-pulse-gold transition-all duration-300">
                {f.icon}
              </div>
              <h3 className="text-lg font-semibold text-[#e8e0d4] mb-2 group-hover:text-[#f5e6c8] transition-colors">{f.title}</h3>
              <p className="font-sans-ui text-sm text-[#5a5248] leading-relaxed group-hover:text-[#6a6258] transition-colors">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
