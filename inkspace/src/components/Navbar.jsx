import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const NAV_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'Categories', href: '#categories' },
  { label: 'About', href: '#about' },
]

const SECTION_IDS = ['features', 'categories', 'about']

export default function Navbar({ authMode, setAuthMode }) {
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('')

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Scrollspy — track which section is in view
  useEffect(() => {
    const handleScroll = () => {
      let closestSection = ''
      let minDistance = Infinity

      for (const id of SECTION_IDS) {
        const el = document.getElementById(id)
        if (el) {
          const rect = el.getBoundingClientRect()
          // Calculate distance from the element's top to the middle-upper part of the screen
          const distance = Math.abs(rect.top - window.innerHeight / 3)
          
          if (distance < minDistance) {
            minDistance = distance
            closestSection = id
          }
        }
      }

      // If we are at the very top (Hero section), no nav item should be active
      if (window.scrollY < window.innerHeight / 2) {
        closestSection = ''
      }

      setActiveSection(closestSection)
    }

    window.addEventListener('scroll', handleScroll)
    handleScroll() // Trigger once on mount

    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#0e0e0e]/95 backdrop-blur-md border-b border-[#2a2520]'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2.5 group flex-shrink-0">
          <div className="w-8 h-8 border border-[#c9a84c] rounded flex items-center justify-center group-hover:bg-[#c9a84c]/10 transition-colors">
            <svg width="16" height="18" viewBox="0 0 16 18" fill="none">
              <path
                d="M8 1L14 4.5V11.5L8 15L2 11.5V4.5L8 1Z"
                stroke="#c9a84c"
                strokeWidth="1.2"
                fill="none"
              />
              <path d="M8 6V12M6 8l2-2 2 2" stroke="#c9a84c" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
          </div>
          <span className="text-xl font-bold tracking-wide text-[#f5e6c8]">Inkspace</span>
        </a>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-6">
          {NAV_LINKS.map((link) => {
            const sectionId = link.href.replace('#', '')
            const isActive = activeSection === sectionId
            return (
              <a
                key={link.label}
                href={link.href}
                className={`font-sans-ui text-sm tracking-wide transition-colors duration-200 relative group ${
                  isActive ? 'text-[#c9a84c]' : 'text-[#a09880] hover:text-[#e8e0d4]'
                }`}
              >
                {link.label}
                {/* Active indicator dot */}
                <span
                  className={`absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#c9a84c] transition-all duration-200 ${
                    isActive ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
                  }`}
                />
              </a>
            )
          })}
        </nav>

        {/* Auth Buttons */}
        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={() => setAuthMode('signin')}
            className={`font-sans-ui text-sm px-5 py-2 rounded-full border transition-all duration-200 ${
              authMode === 'signin'
                ? 'bg-[#c9a84c] text-[#0e0e0e] border-[#c9a84c] font-semibold'
                : 'border-[#3a3329] text-[#a09880] hover:border-[#c9a84c] hover:text-[#c9a84c]'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => navigate('/create')}
            className="font-sans-ui text-sm px-5 py-2 rounded-full border border-[#c9a84c] bg-[#c9a84c] text-[#0e0e0e] font-semibold hover:bg-[#e2c97e] transition-all duration-200"
          >
            Start Writing
          </button>
        </div>

        {/* Mobile Hamburger */}
        <button
          className="md:hidden text-[#a09880] hover:text-[#e8e0d4] transition-colors p-1"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
        >
          <div className="space-y-1.5">
            <span className={`block w-5 h-0.5 bg-current transition-all duration-300 origin-center ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
            <span className={`block w-5 h-0.5 bg-current transition-all duration-300 ${menuOpen ? 'opacity-0 scale-x-0' : ''}`} />
            <span className={`block w-5 h-0.5 bg-current transition-all duration-300 origin-center ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
          </div>
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ${
          menuOpen ? 'max-h-96 border-b border-[#2a2520]' : 'max-h-0'
        } bg-[#0e0e0e]/98 backdrop-blur-md`}
      >
        <div className="px-6 py-5 flex flex-col gap-4">
          {NAV_LINKS.map((link) => {
            const sectionId = link.href.replace('#', '')
            const isActive = activeSection === sectionId
            return (
              <a
                key={link.label}
                href={link.href}
                className={`font-sans-ui text-sm transition-colors ${
                  isActive ? 'text-[#c9a84c]' : 'text-[#a09880] hover:text-[#e8e0d4]'
                }`}
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </a>
            )
          })}
          <div className="flex gap-3 pt-3 border-t border-[#2a2520]">
            <button
              onClick={() => { setAuthMode('signin'); setMenuOpen(false) }}
              className="font-sans-ui text-sm px-4 py-2 rounded-full border border-[#c9a84c] text-[#c9a84c]"
            >
              Sign In
            </button>
            <button
              onClick={() => { navigate('/create'); setMenuOpen(false) }}
              className="font-sans-ui text-sm px-4 py-2 rounded-full bg-[#c9a84c] text-[#0e0e0e] font-semibold"
            >
              Start Writing
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
