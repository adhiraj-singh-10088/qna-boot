import React from 'react'

const WRITERS = [
  {
    name: 'Elena Marsh',
    avatar: 'EM',
    bg: 'bg-[#3a2e1a]',
    niche: 'Journalism & Culture',
    followers: '18.4K',
    bio: 'Covering the intersections of media, politics and storytelling for over a decade.',
    articles: 94,
  },
  {
    name: 'Rohan Verma',
    avatar: 'RV',
    bg: 'bg-[#1a2a3a]',
    niche: 'Philosophy & Mind',
    followers: '12.9K',
    bio: 'Writing at the edge of consciousness, identity, and what it means to be present.',
    articles: 67,
  },
  {
    name: 'Claire Dubois',
    avatar: 'CD',
    bg: 'bg-[#1a3a2a]',
    niche: 'Literature & Books',
    followers: '9.2K',
    bio: 'Unboxing the world through literature. Reading 2 books a week since 2015.',
    articles: 112,
  },
  {
    name: 'James Okafor',
    avatar: 'JO',
    bg: 'bg-[#3a1a1a]',
    niche: 'Technology & Society',
    followers: '24.1K',
    bio: 'Tech doesn\'t exist in a vacuum. I write about who pays the price when it goes wrong.',
    articles: 88,
  },
]

function FollowIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <line x1="19" y1="8" x2="19" y2="14"/>
      <line x1="22" y1="11" x2="16" y2="11"/>
    </svg>
  )
}

export default function WritersSection() {
  return (
    <section id="writers" className="py-28">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-16">
          <div>
            <p className="font-sans-ui text-xs tracking-[0.2em] text-[#c9a84c] uppercase mb-3">
              Featured Writers
            </p>
            <h2 className="text-4xl font-bold text-[#f5e6c8]">
              Voices worth following
            </h2>
          </div>
          <a href="#" className="font-sans-ui text-sm text-[#c9a84c] hover:text-[#e2c97e] transition-colors whitespace-nowrap">
            Discover all writers →
          </a>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {WRITERS.map((writer) => (
            <div
              key={writer.name}
              className="bg-[#0f0d0a] border border-[#1e1c18] rounded-2xl p-6 flex flex-col gap-4 hover:border-[#2e2a20] transition-colors group"
            >
              {/* Avatar + name */}
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-full ${writer.bg} flex items-center justify-center text-sm font-bold text-[#c9a84c] font-sans-ui flex-shrink-0`}>
                  {writer.avatar}
                </div>
                <div>
                  <p className="font-semibold text-[#e8e0d4] text-sm group-hover:text-[#f5e6c8] transition-colors">{writer.name}</p>
                  <p className="font-sans-ui text-xs text-[#c9a84c]/70">{writer.niche}</p>
                </div>
              </div>

              {/* Bio */}
              <p className="font-sans-ui text-xs text-[#4a4438] leading-relaxed flex-1">{writer.bio}</p>

              {/* Stats */}
              <div className="flex items-center justify-between text-xs font-sans-ui border-t border-[#1e1c18] pt-3">
                <div>
                  <span className="text-[#c8bea8] font-semibold">{writer.followers}</span>
                  <span className="text-[#3a3329] ml-1">followers</span>
                </div>
                <div>
                  <span className="text-[#c8bea8] font-semibold">{writer.articles}</span>
                  <span className="text-[#3a3329] ml-1">articles</span>
                </div>
              </div>

              {/* Follow button */}
              <button className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-[#2e2a24] text-[#7a7060] font-sans-ui text-xs hover:border-[#c9a84c]/40 hover:text-[#c9a84c] transition-all duration-200">
                <FollowIcon />
                Follow
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
