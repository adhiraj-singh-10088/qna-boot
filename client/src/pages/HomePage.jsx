import React, { useState } from "react"
import Navbar from "../components/Navbar"
import HeroSection from "../components/HeroSection"
import FeaturesSection from "../components/FeaturesSection"
import CategoriesSection from "../components/CategoriesSection"
import Footer from "../components/Footer"

export default function HomePage() {
  const [authMode, setAuthMode] = useState("signin")

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

