import React from "react"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider, useAuth } from "./context/AuthContext"
import { MessagesProvider } from "./context/MessagesContext"
import { NotificationsProvider } from "./context/NotificationsContext"

// Landing / marketing pages
import HomePage       from "./pages/HomePage"
import CreatePostPage from "./pages/CreatePostPage"
import LoginPage      from "./pages/LoginPage"

// App pages (require auth)
import FeedPage     from "./pages/FeedPage"
import DiscoverPage from "./pages/DiscoverPage"
import ProfilePage  from "./pages/ProfilePage"
import MessagesPage from "./pages/MessagesPage"
import PostPage     from "./pages/PostPage"
import NotificationsPage from "./pages/NotificationsPage"

import GuestPrompt    from "./components/ui/GuestPrompt"

/** Wraps routes that need authentication — redirects guests to a login prompt inside the app shell */
function GuestGuard({ children, title, message }) {
  const { isAuthenticated } = useAuth()
  if (isAuthenticated) return children
  return <GuestPrompt title={title} message={message} />
}

export default function App() {
  return (
    <AuthProvider>
      <MessagesProvider>
      <NotificationsProvider>
      <BrowserRouter>
        <Routes>
          {/* Public landing page — redirects logged-in users to /feed (handled inside HomePage) */}
          <Route path="/"      element={<HomePage />} />

          {/* Standalone login page — redirects logged-in users to /feed (handled inside LoginPage) */}
          <Route path="/login" element={<LoginPage />} />

          {/* Public post permalink — this is what shared URLs point to */}
          <Route path="/post/:id" element={<PostPage />} />

          {/* Authenticated app routes & public feed */}
          <Route path="/feed"     element={<FeedPage />} />
          <Route path="/search"   element={
            <GuestGuard title="Join the Community" message="Sign in or create an account to discover new writers, find specific articles, and accept follow requests.">
              <DiscoverPage />
            </GuestGuard>
          } />
          <Route path="/profile"  element={
            <GuestGuard title="Your Profile" message="Create an account to save your favorite articles, track your reading history, and build your own audience.">
              <ProfilePage />
            </GuestGuard>
          } />
          <Route path="/u/:username" element={<ProfilePage />} />
          <Route path="/notifications" element={
            <GuestGuard title="Your Notifications" message="Sign in to see who liked your posts, commented, or started following you.">
              <NotificationsPage />
            </GuestGuard>
          } />
          <Route path="/messages" element={
            <GuestGuard title="Your Inbox" message="Sign in to receive notes from friends and writers you follow.">
              <MessagesPage />
            </GuestGuard>
          } />
          <Route path="/create"   element={
            <GuestGuard title="Start Writing" message="Sign in to draft articles, publish to your audience, and join the conversation.">
              <CreatePostPage />
            </GuestGuard>
          } />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      </NotificationsProvider>
      </MessagesProvider>
    </AuthProvider>
  )
}
