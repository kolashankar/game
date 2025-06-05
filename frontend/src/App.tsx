import React, { useEffect, lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Layout from './components/layout/Layout';
import LoadingScreen from './components/common/LoadingScreen';

// Lazy-loaded pages for better performance
const HomePage = lazy(() => import('./pages/HomePage'));
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'));
const DashboardPage = lazy(() => import('./pages/dashboard/DashboardPage'));
const GameLobbyPage = lazy(() => import('./pages/game/GameLobbyPage'));
const GameBoardPage = lazy(() => import('./pages/game/GameBoardPage'));
const GameSummaryPage = lazy(() => import('./pages/game/GameSummaryPage'));
const ProfilePage = lazy(() => import('./pages/profile/ProfilePage'));
const LeaderboardPage = lazy(() => import('./pages/leaderboard/LeaderboardPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

// Protected route component
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const App = () => {
  const { checkAuth } = useAuth();

  // Check authentication status on app load
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="leaderboard" element={<LeaderboardPage />} />

          {/* Protected routes */}
          <Route path="dashboard" element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          } />
          <Route path="profile" element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } />
          <Route path="games/:gameId/lobby" element={
            <ProtectedRoute>
              <GameLobbyPage />
            </ProtectedRoute>
          } />
          <Route path="games/:gameId/board" element={
            <ProtectedRoute>
              <GameBoardPage />
            </ProtectedRoute>
          } />
          <Route path="games/:gameId/summary" element={
            <ProtectedRoute>
              <GameSummaryPage />
            </ProtectedRoute>
          } />

          {/* 404 route */}
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </Suspense>
  );
};

export default App;
