import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import AuthPanel from './AuthPanel'

const TAGS = ['longForm', 'editorials', 'bookReviews', 'newsletters', 'poetry', 'opinion', 'essays']

const QUOTES = [
  { text: '"The pen is the tongue of the mind."', author: '— MIGUEL DE CERVANTES' },
  { text: '"A writer only begins a book. A reader finishes it."', author: '— SAMUEL JOHNSON' },
  { text: '"There is no greater agony than bearing an untold story inside you."', author: '— MAYA ANGELOU' },
]

export default function HeroSection({ authMode, setAuthMode }) {
  const { t } = useTranslation()
  const [quoteIdx, setQuoteIdx] = useState(0)
  const [quoteVisible, setQuoteVisible] = useState(true)

  // Cycle quotes every 4 seconds with a fade transition
  useEffect(() => {
    const timer = setInterval(() => {
      setQuoteVisible(false)
      setTimeout(() => {
        setQuoteIdx((i) => (i + 1) % QUOTES.length)
        setQuoteVisible(true)
      }, 400)
    }, 4000)
    return () => clearInterval(timer)
  }, [])

  const quote = QUOTES[quoteIdx]

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background layers */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-br from-[#1a1500]/30 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_50%,_#c9a84c08_0%,_transparent_60%)]" />
        {/* Decorative dots grid */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="dots" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="1" fill="#c9a84c" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dots)" />
        </svg>
        {/* Floating accent orb */}
        <div className="absolute top-1/3 right-1/3 w-64 h-64 rounded-full bg-[#c9a84c]/4 blur-3xl animate-float pointer-events-none" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 pt-24 pb-16 w-full">
        <div className="grid lg:grid-cols-2 gap-16 items-center min-h-[calc(100vh-6rem)]">
          {/* Left – Hero Copy */}
          <div className="flex flex-col justify-center">
            {/* Eyebrow with decorative lines */}
            <div className="flex items-center gap-3 mb-6 animate-fade-in-up">
              <div className="h-px w-8 bg-[#c9a84c]/50" />
              <p className="font-sans-ui text-xs tracking-[0.25em] text-[#c9a84c] uppercase">
                {t('landing.eyebrow')}
              </p>
              <div className="h-px w-8 bg-[#c9a84c]/50" />
            </div>

            {/* Headline */}
            <h1 className="text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight mb-6 animate-fade-in-up delay-100">
              <span className="text-[#f5e6c8]">{t('landing.headline1')}</span>
              <br />
              <span className="italic text-[#c9a84c]">{t('landing.headline2')}</span>
            </h1>

            {/* Description */}
            <p className="text-base lg:text-lg text-[#7a7060] leading-relaxed max-w-md mb-10 animate-fade-in-up delay-200">
              {t('landing.heroText1')}{' '}
              <span className="text-[#c9a84c]">{t('landing.publishArticles')}</span>, {t('landing.heroText2')}
            </p>

            {/* Tag pills */}
            <div className="flex flex-wrap gap-2 mb-12 animate-fade-in-up delay-300">
              {TAGS.map((tag) => (
                <button
                  key={tag}
                  className="font-sans-ui text-xs px-3.5 py-1.5 rounded-full border border-[#2e2920] text-[#7a7060] hover:border-[#c9a84c]/50 hover:text-[#c9a84c] transition-all duration-200 cursor-pointer"
                >
                  {t(`landingTags.${tag}`)}
                </button>
              ))}
            </div>

            {/* Cycling Quote */}
            <blockquote
              className="border-l-2 border-[#3a3020] pl-4 animate-fade-in-up delay-500"
              style={{
                transition: 'opacity 0.4s ease, transform 0.4s ease',
                opacity: quoteVisible ? 1 : 0,
                transform: quoteVisible ? 'translateY(0)' : 'translateY(6px)',
              }}
            >
              <p className="text-base italic text-[#7a7060]">{quote.text}</p>
              <cite className="font-sans-ui text-xs tracking-widest text-[#5a5248] mt-1.5 block not-italic">
                {quote.author}
              </cite>
            </blockquote>

            {/* Quote dots indicator */}
            <div className="flex gap-1.5 mt-4 animate-fade-in-up delay-600">
              {QUOTES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => { setQuoteIdx(i); setQuoteVisible(true) }}
                  className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                    i === quoteIdx ? 'bg-[#c9a84c] w-4' : 'bg-[#3a3329] hover:bg-[#5a5248]'
                  }`}
                  aria-label={`Quote ${i + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Right – Auth Panel */}
          <div className="flex justify-center lg:justify-end animate-fade-in-up delay-200">
            <AuthPanel authMode={authMode} setAuthMode={setAuthMode} />
          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-[#0e0e0e] to-transparent pointer-events-none" />
    </section>
  )
}
