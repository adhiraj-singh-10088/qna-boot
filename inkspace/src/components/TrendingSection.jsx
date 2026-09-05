import React, { useState } from 'react'

const ARTICLES = [
  {
    id: 1,
    category: 'Editorial',
    tag_color: 'text-[#c9a84c] bg-[#c9a84c]/10',
    title: 'The Quiet Revolution of Long-Form Journalism',
    excerpt: 'As attention spans shrink, a counter-movement of devoted readers is choosing depth over dopamine. What does this mean for the future of writing?',
    author: 'Elena Marsh',
    avatar: 'EM',
    avatar_bg: 'bg-[#3a2e1a]',
    read_time: '8 min read',
    date: 'Sep 3',
    likes: 1420,
  },
  {
    id: 2,
    category: 'Essay',
    tag_color: 'text-[#8b9dc3] bg-[#8b9dc3]/10',
    title: 'On Solitude and the Creative Mind: Why Writers Need Silence',
    excerpt: 'Virginia Woolf demanded a room of one\'s own. Today, the challenge isn\'t the room — it\'s the phone buzzing in it.',
    author: 'Rohan Verma',
    avatar: 'RV',
    avatar_bg: 'bg-[#1a2a3a]',
    read_time: '6 min read',
    date: 'Sep 2',
    likes: 986,
  },
  {
    id: 3,
    category: 'Book Review',
    tag_color: 'text-[#8bc38b] bg-[#8bc38b]/10',
    title: '\'Orbital\' by Samantha Harvey: A Meditation on Earth from Above',
    excerpt: 'The Booker Prize-winning novel asks what we see when we strip away everything human — and whether that\'s a blessing or a curse.',
    author: 'Claire Dubois',
    avatar: 'CD',
    avatar_bg: 'bg-[#1a3a2a]',
    read_time: '5 min read',
    date: 'Sep 1',
    likes: 743,
  },
  {
    id: 4,
    category: 'Opinion',
    tag_color: 'text-[#c38b8b] bg-[#c38b8b]/10',
    title: 'AI Can Write — But Can It Mean Anything?',
    excerpt: 'Meaning requires stakes. Until a machine can lose something, its words will always be an echo, not a voice.',
    author: 'James Okafor',
    avatar: 'JO',
    avatar_bg: 'bg-[#3a1a1a]',
    read_time: '7 min read',
    date: 'Aug 31',
    likes: 2103,
  },
  {
    id: 5,
    category: 'Newsletter',
    tag_color: 'text-[#b88bc3] bg-[#b88bc3]/10',
    title: 'This Week in Ideas: What Philosophers Got Wrong About Boredom',
    excerpt: 'A weekly digest of the most interesting ideas in philosophy, culture, and the art of living well.',
    author: 'Sofía Reyes',
    avatar: 'SR',
    avatar_bg: 'bg-[#2a1a3a]',
    read_time: '4 min read',
    date: 'Aug 30',
    likes: 567,
  },
  {
    id: 6,
    category: 'Poetry',
    tag_color: 'text-[#c3b88b] bg-[#c3b88b]/10',
    title: 'Ekphrasis: Three Poems Inspired by Paintings You\'ve Never Seen',
    excerpt: 'Language reaching toward image. Art that began as stone, ending as word. These poems live in the space between.',
    author: 'Amara Osei',
    avatar: 'AO',
    avatar_bg: 'bg-[#3a3a1a]',
    read_time: '3 min read',
    date: 'Aug 29',
    likes: 831,
  },
]

function HeartIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
    </svg>
  )
}

function ArticleCard({ article }) {
  const [liked, setLiked] = useState(false)
  return (
    <article className="bg-[#0f0d0a] border border-[#1e1c18] rounded-2xl p-6 flex flex-col gap-4 group hover:border-[#2e2a20] transition-all duration-300 cursor-pointer">
      {/* Top row */}
      <div className="flex items-center justify-between">
        <span className={`font-sans-ui text-[10px] tracking-widest uppercase px-2.5 py-1 rounded-full ${article.tag_color}`}>
          {article.category}
        </span>
        <span className="font-sans-ui text-xs text-[#3a3329]">{article.date}</span>
      </div>

      {/* Title + Excerpt */}
      <div>
        <h3 className="text-base font-semibold text-[#e8e0d4] leading-snug mb-2 group-hover:text-[#f5e6c8] transition-colors line-clamp-2">
          {article.title}
        </h3>
        <p className="font-sans-ui text-xs text-[#4a4438] leading-relaxed line-clamp-3">
          {article.excerpt}
        </p>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-auto pt-3 border-t border-[#1e1c18]">
        <div className="flex items-center gap-2.5">
          <div className={`w-7 h-7 rounded-full ${article.avatar_bg} flex items-center justify-center text-[10px] font-bold text-[#c9a84c] font-sans-ui`}>
            {article.avatar}
          </div>
          <div>
            <p className="font-sans-ui text-xs text-[#7a7060]">{article.author}</p>
            <p className="font-sans-ui text-[10px] text-[#3a3329]">{article.read_time}</p>
          </div>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); setLiked(!liked) }}
          className={`flex items-center gap-1.5 font-sans-ui text-xs transition-colors ${
            liked ? 'text-rose-400' : 'text-[#3a3329] hover:text-[#7a7060]'
          }`}
        >
          <HeartIcon />
          {liked ? article.likes + 1 : article.likes}
        </button>
      </div>
    </article>
  )
}

const FILTERS = ['All', 'Editorial', 'Essay', 'Book Review', 'Opinion', 'Poetry']

export default function TrendingSection() {
  const [activeFilter, setActiveFilter] = useState('All')

  const filtered = activeFilter === 'All'
    ? ARTICLES
    : ARTICLES.filter(a => a.category === activeFilter)

  return (
    <section id="trending" className="py-28">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
          <div>
            <p className="font-sans-ui text-xs tracking-[0.2em] text-[#c9a84c] uppercase mb-3">
              Trending Now
            </p>
            <h2 className="text-4xl font-bold text-[#f5e6c8]">
              Stories worth your time
            </h2>
          </div>
          <a href="#" className="font-sans-ui text-sm text-[#c9a84c] hover:text-[#e2c97e] transition-colors whitespace-nowrap">
            Browse all →
          </a>
        </div>

        {/* Filter pills */}
        <div className="flex gap-2 flex-wrap mb-10">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`font-sans-ui text-xs px-4 py-1.5 rounded-full border transition-all duration-200 ${
                activeFilter === f
                  ? 'bg-[#c9a84c] text-[#0e0e0e] border-[#c9a84c] font-semibold'
                  : 'border-[#2a2520] text-[#5a5248] hover:border-[#3a3329] hover:text-[#7a7060]'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Cards grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      </div>
    </section>
  )
}
