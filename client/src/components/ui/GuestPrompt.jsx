import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import AppLayout from "../layout/AppLayout"

/**
 * <GuestPrompt />
 * A generic fallback component for guests trying to access authenticated routes.
 * Renders inside the AppLayout so the sidebar remains visible.
 */
export default function GuestPrompt({ title, message }) {
  const navigate = useNavigate()
  const { t } = useTranslation()

  return (
    <AppLayout>
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
        <div className="w-16 h-16 rounded-full bg-[#2a2218] border border-[#3a3020] flex items-center justify-center text-[#c9a84c] mb-6">
          <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth={1.5}>
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
        </div>
        <h2 className="text-[#e8e0d4] text-2xl font-bold mb-3" style={{ fontFamily: "'Georgia', serif" }}>
          {title}
        </h2>
        <p className="text-[#7a7060] text-base font-sans-ui max-w-md mb-8 leading-relaxed">
          {message}
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => navigate("/login")}
            className="px-6 py-3 rounded-full bg-[#c9a84c] text-[#0e0e0e] font-semibold font-sans-ui hover:bg-[#e2c97e] transition-colors"
          >
            {t('guest.signIn')}
          </button>
          <button
            onClick={() => navigate("/")}
            className="px-6 py-3 rounded-full border border-[#3a3329] text-[#e8e0d4] font-semibold font-sans-ui hover:border-[#c9a84c] hover:text-[#c9a84c] transition-colors"
          >
            {t('guest.createAccount')}
          </button>
        </div>
      </div>
    </AppLayout>
  )
}
