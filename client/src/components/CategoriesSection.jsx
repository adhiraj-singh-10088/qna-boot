import React from 'react'

const CATEGORIES = [
  { name: 'Long-form Articles', icon: '📰', color: 'hover:border-[#c9a84c]/40' },
  { name: 'Editorials', icon: '✍️', color: 'hover:border-[#8b9dc3]/40' },
  { name: 'Book Reviews', icon: '📚', color: 'hover:border-[#8bc38b]/40' },
  { name: 'Newsletters', icon: '📬', color: 'hover:border-[#b88bc3]/40' },
  { name: 'Poetry', icon: '🖋️', color: 'hover:border-[#c3b88b]/40' },
  { name: 'Opinion Pieces', icon: '💭', color: 'hover:border-[#c38b8b]/40' },
  { name: 'Essays', icon: '📝', color: 'hover:border-[#8bc3c3]/40' },
  { name: 'Interviews', icon: '🎙️', color: 'hover:border-[#c38bc3]/40' },
]

export default function CategoriesSection() {
  return (
    <section id="categories" className="py-28 bg-[#0a0a0a]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <p className="font-sans-ui text-xs tracking-[0.2em] text-[#c9a84c] uppercase mb-4">
            Explore by Category
          </p>
          <h2 className="text-4xl font-bold text-[#f5e6c8] mb-4">
            Find what moves you
          </h2>
          <p className="font-sans-ui text-[#5a5248] max-w-md mx-auto">
            Dive into any category and discover thousands of voices on every topic imaginable.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.name}
              className={`group bg-[#0f0d0a] border border-[#1e1c18] rounded-2xl p-6 text-left transition-all duration-300 ${cat.color} hover:bg-[#141210]`}
            >
              <span className="text-2xl mb-4 block">{cat.icon}</span>
              <p className="font-semibold text-[#c8bea8] mb-1 group-hover:text-[#f5e6c8] transition-colors text-sm leading-snug">
                {cat.name}
              </p>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}

