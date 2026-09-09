import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

/* Google "G" coloured SVG icon */
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
      <path d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962L3.964 7.294C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  )
}

function EyeIcon({ open }) {
  return open ? (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  ) : (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  )
}

export default function AuthPanel({ authMode, setAuthMode }) {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [dob, setDob] = useState({ day: '', month: '', year: '' })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)

  const isSignIn = authMode === 'signin'

  const handleSubmit = (e) => {
    e.preventDefault()
    setLoading(true)
    // Simulated auth — redirect to post creation after 1.5s
    setTimeout(() => {
      setLoading(false)
      navigate('/create')
    }, 1500)
  }

  return (
    <div className="w-full max-w-[420px] bg-[#141210] border border-[#2a2520] rounded-2xl p-8 shadow-2xl shadow-black/60">
      {/* Tab switcher */}
      <div className="flex gap-1 bg-[#1a1814] rounded-xl p-1 mb-8">
        {['signin', 'signup'].map((mode) => (
          <button
            key={mode}
            onClick={() => setAuthMode(mode)}
            className={`flex-1 font-sans-ui text-sm py-2.5 rounded-lg transition-all duration-200 ${
              authMode === mode
                ? 'bg-[#c9a84c] text-[#0e0e0e] font-semibold shadow-sm'
                : 'text-[#7a7060] hover:text-[#a09880]'
            }`}
          >
            {mode === 'signin' ? 'Sign In' : 'Create Account'}
          </button>
        ))}
      </div>

      {/* Heading */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-[#f5e6c8] mb-1">
          {isSignIn ? 'Welcome back.' : 'Join Inkspace.'}
        </h2>
        <p className="font-sans-ui text-sm text-[#5a5248]">
          {isSignIn
            ? 'Sign in to continue to your Inkspace.'
            : 'Create an account and start writing today.'}
        </p>
      </div>

      {/* Google OAuth */}
      <button className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-[#1e1c18] border border-[#2e2a24] text-[#c8bea8] font-sans-ui text-sm hover:border-[#4a4438] hover:bg-[#242018] transition-all duration-200 mb-5">
        <GoogleIcon />
        Continue with Google
      </button>

      {/* Divider */}
      <div className="flex items-center gap-4 mb-5">
        <div className="flex-1 h-px bg-[#2a2520]" />
        <span className="font-sans-ui text-xs text-[#4a4438]">or continue with email</span>
        <div className="flex-1 h-px bg-[#2a2520]" />
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name field (signup only) */}
        {!isSignIn && (
          <div>
            <label className="font-sans-ui text-[10px] tracking-widest text-[#5a5248] uppercase block mb-2">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              required={!isSignIn}
              className="w-full bg-[#1a1814] border border-[#2e2a24] rounded-xl px-4 py-3 text-sm text-[#e8e0d4] placeholder-[#3a3329] font-sans-ui focus:outline-none focus:border-[#c9a84c]/50 focus:ring-1 focus:ring-[#c9a84c]/20 transition-all"
            />
          </div>
        )}

        {/* Username field (signup only) */}
        {!isSignIn && (
          <div>
            <label className="font-sans-ui text-[10px] tracking-widest text-[#5a5248] uppercase block mb-2">
              Username
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5a5248] font-sans-ui text-sm select-none">@</span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value.replace(/\s/g, '').toLowerCase())}
                placeholder="yourhandle"
                required={!isSignIn}
                className="w-full bg-[#1a1814] border border-[#2e2a24] rounded-xl pl-8 pr-4 py-3 text-sm text-[#e8e0d4] placeholder-[#3a3329] font-sans-ui focus:outline-none focus:border-[#c9a84c]/50 focus:ring-1 focus:ring-[#c9a84c]/20 transition-all"
              />
            </div>
          </div>
        )}

        {/* Date of Birth field (signup only) */}
        {!isSignIn && (() => {
          // Compute real max days for the chosen month/year
          // new Date(y, m, 0).getDate() → last day of month m in year y
          const refYear  = dob.year  ? Number(dob.year)  : 2000   // 2000 = leap year fallback
          const refMonth = dob.month ? Number(dob.month) : 0
          const maxDays  = refMonth ? new Date(refYear, refMonth, 0).getDate() : 31

          const handleMonth = (e) => {
            const newMonth = e.target.value
            const newMax   = new Date(refYear, Number(newMonth), 0).getDate()
            setDob(p => ({
              ...p,
              month: newMonth,
              day: p.day && Number(p.day) > newMax ? '' : p.day,
            }))
          }
          const handleYear = (e) => {
            const newYear = e.target.value
            const newMax  = refMonth ? new Date(Number(newYear), refMonth, 0).getDate() : 31
            setDob(p => ({
              ...p,
              year: newYear,
              day: p.day && Number(p.day) > newMax ? '' : p.day,
            }))
          }

          return (
            <div>
              <label className="font-sans-ui text-[10px] tracking-widest text-[#5a5248] uppercase flex items-center gap-1.5 mb-2">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                Date of Birth
              </label>
              <div className="flex gap-2">
                {/* Day — only shows valid days for the chosen month/year */}
                <select
                  value={dob.day}
                  onChange={(e) => setDob(p => ({ ...p, day: e.target.value }))}
                  required={!isSignIn}
                  style={{ color: dob.day ? '#e8e0d4' : '#3a3329' }}
                  className="flex-1 bg-[#1a1814] border border-[#2e2a24] rounded-xl px-3 py-3 text-sm font-sans-ui focus:outline-none focus:border-[#c9a84c]/50 focus:ring-1 focus:ring-[#c9a84c]/20 transition-all appearance-none cursor-pointer"
                >
                  <option value="" disabled style={{ color: '#3a3329' }}>DD</option>
                  {Array.from({ length: maxDays }, (_, i) => i + 1).map(d => (
                    <option key={d} value={d} style={{ color: '#e8e0d4', background: '#1a1814' }}>
                      {String(d).padStart(2, '0')}
                    </option>
                  ))}
                </select>

                {/* Month */}
                <select
                  value={dob.month}
                  onChange={handleMonth}
                  required={!isSignIn}
                  style={{ color: dob.month ? '#e8e0d4' : '#3a3329' }}
                  className="flex-[1.4] bg-[#1a1814] border border-[#2e2a24] rounded-xl px-3 py-3 text-sm font-sans-ui focus:outline-none focus:border-[#c9a84c]/50 focus:ring-1 focus:ring-[#c9a84c]/20 transition-all appearance-none cursor-pointer"
                >
                  <option value="" disabled style={{ color: '#3a3329' }}>Month</option>
                  {['January','February','March','April','May','June','July','August','September','October','November','December'].map((m, i) => (
                    <option key={m} value={i + 1} style={{ color: '#e8e0d4', background: '#1a1814' }}>{m}</option>
                  ))}
                </select>

                {/* Year */}
                <select
                  value={dob.year}
                  onChange={handleYear}
                  required={!isSignIn}
                  style={{ color: dob.year ? '#e8e0d4' : '#3a3329' }}
                  className="flex-[1.2] bg-[#1a1814] border border-[#2e2a24] rounded-xl px-3 py-3 text-sm font-sans-ui focus:outline-none focus:border-[#c9a84c]/50 focus:ring-1 focus:ring-[#c9a84c]/20 transition-all appearance-none cursor-pointer"
                >
                  <option value="" disabled style={{ color: '#3a3329' }}>YYYY</option>
                  {Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i).map(y => (
                    <option key={y} value={y} style={{ color: '#e8e0d4', background: '#1a1814' }}>{y}</option>
                  ))}
                </select>
              </div>
            </div>
          )
        })()}


        {/* Email */}
        <div>
          <label className="font-sans-ui text-[10px] tracking-widest text-[#5a5248] uppercase block mb-2">
            Email Address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="inkspace@gmail.com"
            required
            className="w-full bg-[#1a1814] border border-[#2e2a24] rounded-xl px-4 py-3 text-sm text-[#e8e0d4] placeholder-[#3a3329] font-sans-ui focus:outline-none focus:border-[#c9a84c]/50 focus:ring-1 focus:ring-[#c9a84c]/20 transition-all"
          />
        </div>

        {/* Password */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="font-sans-ui text-[10px] tracking-widest text-[#5a5248] uppercase">
              Password
            </label>
            {isSignIn && (
              <button type="button" className="font-sans-ui text-xs text-[#c9a84c] hover:text-[#e2c97e] transition-colors">
                Forgot password?
              </button>
            )}
          </div>
          <div className="relative">
            <input
              type={showPw ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full bg-[#1a1814] border border-[#2e2a24] rounded-xl px-4 py-3 pr-11 text-sm text-[#e8e0d4] placeholder-[#3a3329] font-sans-ui focus:outline-none focus:border-[#c9a84c]/50 focus:ring-1 focus:ring-[#c9a84c]/20 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPw(!showPw)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#4a4438] hover:text-[#7a7060] transition-colors"
              aria-label={showPw ? 'Hide password' : 'Show password'}
            >
              <EyeIcon open={showPw} />
            </button>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 bg-[#c9a84c] hover:bg-[#e2c97e] active:bg-[#b8943e] text-[#0e0e0e] font-sans-ui font-semibold text-sm py-3.5 rounded-xl transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
          ) : null}
          {isSignIn ? 'Sign In to Inkspace' : 'Create Free Account'}
        </button>
      </form>

      {/* Footer link */}
      <p className="font-sans-ui text-xs text-center text-[#4a4438] mt-5">
        {isSignIn ? (
          <>New to Inkspace?{' '}
            <button onClick={() => setAuthMode('signup')} className="text-[#c9a84c] hover:text-[#e2c97e] font-medium transition-colors">
              Create a free account
            </button>
          </>
        ) : (
          <>Already have an account?{' '}
            <button onClick={() => setAuthMode('signin')} className="text-[#c9a84c] hover:text-[#e2c97e] font-medium transition-colors">
              Sign in
            </button>
          </>
        )}
      </p>
    </div>
  )
}
