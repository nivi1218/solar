import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import { ProtectedRoute } from './components/shared/ProtectedRoute';
import { Layout } from './components/shared/Layout';

const IntroPage = lazy(() => import('./components/pages/IntroPage').then(m => ({ default: m.IntroPage })));
const LoginPage = lazy(() => import('./components/pages/LoginPage').then(m => ({ default: m.LoginPage })));
const SignupPage = lazy(() => import('./components/pages/SignupPage').then(m => ({ default: m.SignupPage })));
const DashboardPage = lazy(() => import('./components/pages/DashboardPage').then(m => ({ default: m.DashboardPage })));
const InvertersPage = lazy(() => import('./components/pages/InvertersPage').then(m => ({ default: m.InvertersPage })));
const AlertsPage = lazy(() => import('./components/pages/AlertsPage').then(m => ({ default: m.AlertsPage })));
const ReportsPage = lazy(() => import('./components/pages/ReportsPage').then(m => ({ default: m.ReportsPage })));
const SitePage = lazy(() => import('./components/pages/SitePage').then(m => ({ default: m.SitePage })));
const ProfilePage = lazy(() => import('./components/pages/ProfilePage').then(m => ({ default: m.ProfilePage })));

const PageLoader: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
  </div>
);

const AuthRedirect: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <DataProvider>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<AuthRedirect><IntroPage /></AuthRedirect>} />
                <Route path="/login" element={<AuthRedirect><LoginPage /></AuthRedirect>} />
                <Route path="/signup" element={<AuthRedirect><SignupPage /></AuthRedirect>} />
                <Route path="/dashboard" element={<ProtectedRoute><Layout><DashboardPage /></Layout></ProtectedRoute>} />
                <Route path="/inverters" element={<ProtectedRoute><Layout><InvertersPage /></Layout></ProtectedRoute>} />
                <Route path="/alerts" element={<ProtectedRoute><Layout><AlertsPage /></Layout></ProtectedRoute>} />
                <Route path="/reports" element={<ProtectedRoute><Layout><ReportsPage /></Layout></ProtectedRoute>} />
                <Route path="/site" element={<ProtectedRoute><Layout><SitePage /></Layout></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><Layout><ProfilePage /></Layout></ProtectedRoute>} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </DataProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
