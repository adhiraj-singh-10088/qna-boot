import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import Navbar from "../components/Navbar"
import HeroSection from "../components/HeroSection"
import FeaturesSection from "../components/FeaturesSection"
import CategoriesSection from "../components/CategoriesSection"
import Footer from "../components/Footer"

export default function HomePage() {
  const [authMode, setAuthMode] = useState("signin")
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()

  /*
   * If the user is already logged in, skip the landing page entirely
   * and send them straight to their feed.
   */
  useEffect(() => {
    if (isAuthenticated) navigate("/feed", { replace: true })
  }, [isAuthenticated, navigate])

  /* Don't flash the landing page while the redirect is processing */
  if (isAuthenticated) return null

  return (
    <div className="min-h-screen bg-[#0e0e0e] text-[#e8e0d4]">
      <Navbar authMode={authMode} setAuthMode={setAuthMode} />
      <main>
        <HeroSection authMode={authMode} setAuthMode={setAuthMode} />
        <FeaturesSection />
        <CategoriesSection />
      </main>
      <Footer />
    </div>
  )
}

