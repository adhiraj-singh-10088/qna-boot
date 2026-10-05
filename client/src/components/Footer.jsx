import React from 'react'
import { useTranslation } from 'react-i18next'

const FOOTER_LINKS = {
  product: ['explore', 'forWriters', 'forReaders', 'newsletters', 'pricing'],
  company: ['aboutUs', 'blog', 'careers', 'pressKit', 'contact'],
  legal: ['terms', 'privacy', 'cookies', 'dmca'],
  community: ['discord', 'twitter', 'instagram', 'rss'],
}

export default function Footer() {
  const { t } = useTranslation()
  return (
    <footer id="about" className="border-t border-[#1a1814] bg-[#0e0e0e]">
      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Top row */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-10 mb-16">
          {/* Brand col */}
          <div className="col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-7 h-7 border border-[#c9a84c] rounded flex items-center justify-center">
                <svg width="14" height="15" viewBox="0 0 16 18" fill="none">
                  <path d="M8 1L14 4.5V11.5L8 15L2 11.5V4.5L8 1Z" stroke="#c9a84c" strokeWidth="1.2" fill="none"/>
                  <path d="M8 6V12M6 8l2-2 2 2" stroke="#c9a84c" strokeWidth="1.2" strokeLinecap="round"/>
                </svg>
              </div>
              <span className="text-lg font-bold text-[#f5e6c8]">Inkspace</span>
            </div>
            <p className="font-sans-ui text-xs text-[#4a4438] leading-relaxed max-w-[180px]">
              {t('footer.tagline')}
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([section, links]) => (
            <div key={section}>
              <p className="font-sans-ui text-[10px] tracking-widest text-[#5a5248] uppercase mb-4">{t(`footer.${section}`)}</p>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link}>
                    <a href="#" className="font-sans-ui text-xs text-[#4a4438] hover:text-[#7a7060] transition-colors">
                      {t(`footer.${link}`)}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-[#1a1814]">
          <p className="font-sans-ui text-xs text-[#3a3329]">
            {t('footer.rights', { year: new Date().getFullYear() })}
          </p>
          <p className="font-sans-ui text-xs text-[#3a3329] italic">
            "The pen is the tongue of the mind." — Cervantes
          </p>
        </div>
      </div>
    </footer>
  )
}
