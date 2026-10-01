import Sidebar from "./Sidebar"
import BottomNav from "./BottomNav"

/**
 * <AppLayout />
 * Root shell for all authenticated app pages.
 *
 * Layout breakdown:
 *  - Desktop (md+): Fixed left <Sidebar /> + scrollable main content offset by sidebar width
 *  - Mobile (<md):  Full-width main content + fixed <BottomNav /> at the bottom
 *
 * Usage:
 *   <AppLayout>
 *     <YourPageContent />
 *   </AppLayout>
 */
export default function AppLayout({ children, wide = false }) {
  return (
    <div className="min-h-screen bg-[#0e0e0e] text-[#e8e0d4]">

      {/* Persistent desktop sidebar */}
      <Sidebar />

      {/*
       * Main content area
       * md: offset left by 72px (icon-only sidebar width: w-18)
       * xl: offset left by 240px (full sidebar width: w-60)
       * Bottom padding on mobile to clear the BottomNav bar
       */}
      <main
        className="md:ml-18 xl:ml-60
                   pb-20 md:pb-0
                   min-h-screen
                   transition-[margin] duration-300"
      >
        {/*
         * Inner content wrapper:
         * Centers content with a max-width suitable for editorial reading.
         * wide: used by the Messages inbox so the thread can use more width.
         */}
        <div className={wide ? "max-w-5xl mx-auto px-0 md:px-4 py-0 md:py-6" : "max-w-2xl mx-auto px-4 py-6"}>
          {children}
        </div>
      </main>

      {/* Persistent mobile bottom navigation */}
      <BottomNav />
    </div>
  )
}
