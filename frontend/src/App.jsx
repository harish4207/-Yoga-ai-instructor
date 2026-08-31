import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { UserProvider, useUser } from './context/UserContext';
import { AppProvider } from './context/AppContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import AsanaLibrary from './pages/AsanaLibrary';
import LiveCoach from './pages/LiveCoach';
import PhotoAnalysis from './pages/PhotoAnalysis';
import PosePlayground from './pages/PosePlayground';
import Progress from './pages/Progress';
import Auth from './pages/Auth';

// Guard for routes that require authentication
function ProtectedRoute({ children }) {
  const { user, loading } = useUser();
  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: '#9AA0C4' }}>Loading session…</div>;
  return user ? children : <Navigate to="/auth" replace />;
}

function AppRoutes() {
  return (
    <>
      <Navbar />
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/asanas" element={<AsanaLibrary />} />
          <Route path="/playground" element={<PosePlayground />} />
          <Route path="/live/:asanaId" element={<LiveCoach />} />
          <Route path="/photo/:asanaId" element={<PhotoAnalysis />} />
          <Route
            path="/progress"
            element={
              <ProtectedRoute>
                <Progress />
              </ProtectedRoute>
            }
          />
          <Route path="/auth" element={<Auth />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </>
  );
}

export default function App() {
  return (
    <UserProvider>
      <AppProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AppProvider>
    </UserProvider>
  );
}
