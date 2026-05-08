import React, { Suspense, lazy, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import { Leapfrog } from 'ldrs/react'
import 'ldrs/react/Leapfrog.css'

/**
 * A centered wrapper for the Leapfrog loader 
 * to be shown during route transitions.
 */
const FullPageLoader = () => (
  <div style={{
    position: "fixed",
    inset: 0,
    zIndex: 9999,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(249,250,251,0.94)",
  }}>
    <Leapfrog size={45} speed={3.5} color="#1e3a5f" />
  </div>
);

// Lazy load your pages
const LandingPage = lazy(() => import('./pages/LandingPage'));
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Feed = lazy(() => import("./pages/Feed"));
const AdminPanel = lazy(() => import("./pages/AdminPanel"));
const MyPosts = lazy(() => import("./pages/MyPosts"));
const SavedPosts = lazy(() => import("./pages/SavedPosts"));
const AlumniMentorship = lazy(() => import("./pages/AlumniMentorship"));
const Notifications = lazy(() => import("./pages/Notifications"));
const ProfileSettings = lazy(() => import("./pages/ProfileSettings"));
const PendingRequests = lazy(() => import("./pages/PendingRequests"));

function App() {
  return (
    <BrowserRouter>
      {/* Suspense catches the "loading" state of lazy components */}
      <Suspense fallback={<FullPageLoader />}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Protected Routes */}
          <Route
            path="/feed"
            element={
              <ProtectedRoute>
                <Feed />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminPanel />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-posts"
            element={
              <ProtectedRoute>
                <MyPosts />
              </ProtectedRoute>
            }
          />
          <Route
            path="/saved-posts"
            element={
              <ProtectedRoute>
                <SavedPosts />
              </ProtectedRoute>
            }
          />
          <Route
            path="/mentorship"
            element={
              <ProtectedRoute>
                <AlumniMentorship />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <Notifications />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfileSettings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/requests"
            element={
              <ProtectedRoute>
                <PendingRequests />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;