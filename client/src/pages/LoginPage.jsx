import { useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'
import AuthPanel from '../components/AuthPanel'

/**
 * <LoginPage />
 * Standalone /login route — only for sign-in.
 *
 * Behaviour:
 *  - If user is already authenticated → immediately redirect to /feed.
 *  - If coming from ?registered=1 → show a success banner.
 *  - On successful sign-in (handled inside AuthPanel) → AuthPanel navigates to /feed.
 */
export default function LoginPage() {
  const { isAuthenticated } = useAuth()
  const { t } = useTranslation()
  const navigate            = useNavigate()
  const [searchParams]      = useSearchParams()
  const justRegistered      = searchParams.get('registered') === '1'

  /* Redirect already-logged-in users away from this page */
  useEffect(() => {
    if (isAuthenticated) navigate('/feed', { replace: true })
  }, [isAuthenticated, navigate])

  /* Don't flash the login UI while redirect is pending */
  if (isAuthenticated) return null

  return (
    <div className="min-h-screen bg-[#0e0e0e] flex flex-col items-center justify-center px-4 py-12">

      {/* ── Brand header ───────────────────────────────────────────── */}
      <Link
        to="/"
        className="flex items-center gap-3 mb-10 group"
        aria-label="Back to Inkspace home"
      >
        <span
          className="w-10 h-10 rounded-xl bg-[#c9a84c] flex items-center justify-center
                     text-[#0e0e0e] font-bold text-xl leading-none
                     group-hover:scale-105 transition-transform duration-200"
          style={{ fontFamily: "'Georgia', serif" }}
        >
          I
        </span>
        <span
          className="text-2xl font-bold text-[#e8e0d4] tracking-tight"
          style={{ fontFamily: "'Georgia', serif" }}
        >
          Inkspace
        </span>
      </Link>

      {/* ── "Account created" success banner ───────────────────────── */}
      {justRegistered && (
        <div
          className="w-full max-w-[420px] mb-6 px-4 py-3 rounded-xl
                     bg-emerald-900/30 border border-emerald-700/40
                     flex items-center gap-3
                     animate-fade-in-up"
        >
          <svg viewBox="0 0 20 20" className="w-5 h-5 text-emerald-400 flex-shrink-0" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd"/>
          </svg>
          <div>
            <p className="text-emerald-300 text-sm font-medium font-sans-ui">
              {t('auth.accountCreated')}
            </p>
            <p className="text-emerald-500 text-xs font-sans-ui mt-0.5">
              {t('auth.signinBelow')}
            </p>
          </div>
        </div>
      )}

      {/* ── Auth Panel locked to sign-in mode ──────────────────────── */}
      {/*
       * lockedMode=true hides the signup tab so this page is
       * purely a sign-in screen. Users create accounts on the landing page.
       */}
      <AuthPanel
        authMode="signin"
        setAuthMode={() => {}}   /* noop — mode is locked */
        lockedMode={true}
        justRegistered={justRegistered}
      />

      {/* ── Decorative background orb ──────────────────────────────── */}
      <div
        className="fixed top-1/3 right-1/4 w-72 h-72 rounded-full
                   bg-[#c9a84c]/4 blur-3xl pointer-events-none"
        aria-hidden="true"
      />
    </div>
  )
}
