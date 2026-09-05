import React, { useState } from 'react'

export default function NewsletterSection() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (email) setSubmitted(true)
  }

  return (
    <section className="py-28 bg-[#0a0a0a] relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-[#c9a84c]/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-3xl mx-auto px-6 text-center">
        <p className="font-sans-ui text-xs tracking-[0.2em] text-[#c9a84c] uppercase mb-5">
          Stay in the loop
        </p>
        <h2 className="text-4xl lg:text-5xl font-bold text-[#f5e6c8] mb-5 leading-tight">
          The best ideas,<br />
          <span className="italic text-[#c9a84c]">in your inbox.</span>
        </h2>
        <p className="font-sans-ui text-[#5a5248] mb-10 max-w-md mx-auto leading-relaxed">
          Join 40,000+ readers who get a weekly digest of the most thought-provoking articles on Inkspace — curated by our editors.
        </p>

        {submitted ? (
          <div className="flex flex-col items-center gap-3 animate-fade-in">
            <div className="w-14 h-14 rounded-full bg-[#c9a84c]/10 border border-[#c9a84c]/30 flex items-center justify-center text-[#c9a84c] text-2xl">
              ✓
            </div>
            <p className="font-sans-ui text-[#e8e0d4] font-medium">You're on the list!</p>
            <p className="font-sans-ui text-sm text-[#5a5248]">Check your inbox for a welcome note from us.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              className="flex-1 bg-[#141210] border border-[#2e2a24] rounded-xl px-5 py-3.5 text-sm text-[#e8e0d4] placeholder-[#3a3329] font-sans-ui focus:outline-none focus:border-[#c9a84c]/50 focus:ring-1 focus:ring-[#c9a84c]/20 transition-all"
            />
            <button
              type="submit"
              className="bg-[#c9a84c] hover:bg-[#e2c97e] text-[#0e0e0e] font-sans-ui font-semibold text-sm px-6 py-3.5 rounded-xl transition-all duration-200 whitespace-nowrap"
            >
              Subscribe Free
            </button>
          </form>
        )}

        <p className="font-sans-ui text-xs text-[#3a3329] mt-5">
          No spam. Unsubscribe anytime. Free forever.
        </p>
      </div>
    </section>
  )
}
