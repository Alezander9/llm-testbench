import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import { Toaster } from "./components/ui/toaster";
import Home from "./pages/Home";
import Landing from "./pages/Landing";

// Lazy load the Slides component
const Slides = React.lazy(() => import("./slides"));

function LoadingState() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
    </div>
  );
}

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<AuthRedirect />} />
        <Route path="/landing" element={<Landing />} />
        <Route
          path="/home/*"
          element={
            <RequireAuth>
              <Home />
            </RequireAuth>
          }
        />
        <Route
          path="/slides/*"
          element={
            <React.Suspense fallback={<LoadingState />}>
              <Slides />
            </React.Suspense>
          }
        />
      </Routes>
      <Toaster />
    </>
  );
}

// Authentication wrapper component
function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) {
    return <LoadingState />;
  }

  if (!isSignedIn) {
    return <Navigate to="/landing" replace />;
  }

  return <>{children}</>;
}

// Root redirect component
function AuthRedirect() {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) {
    return <LoadingState />;
  }

  if (isSignedIn) {
    return <Navigate to="/home" replace />;
  }

  return <Navigate to="/landing" replace />;
}

export default App;
