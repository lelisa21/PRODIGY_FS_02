import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuthContext } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { EmployeeProvider } from './context/EmployeeContext';

import Layout from './components/layout/Layout';
import Landing from './pages/Landing'; 
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import EmployeeDetails from './pages/EmployeeDetails';
import Departments from './pages/Departments';
import Attendance from './pages/Attendance';
import Performance from './pages/Performance';
import Documents from './pages/Documents';
import Messages from './pages/Messages';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Reports from './pages/Reports';
import NotFound from './pages/NotFound';
import NotAuthorized from './pages/NotAuthorized';

import './styles/globals.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
    },
  },
});

function App() {
  return (
    <BrowserRouter>
      <HelmetProvider>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <ToastProvider>
              <AuthProvider>
                <EmployeeProvider>
                  <AppRoutes />
                </EmployeeProvider>
              </AuthProvider>
            </ToastProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </HelmetProvider>
    </BrowserRouter>
  );
}

// Separate component for routes
function AppRoutes() {
  const { isAuthenticated, isLoading, user } = useAuthContext();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500" />
      </div>
    );
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Landing />} />
      
      <Route 
        path="/login" 
        element={!isAuthenticated ? <Login /> : <Navigate to="/app/dashboard" replace />} 
      />
      
      <Route 
        path="/register" 
        element={!isAuthenticated ? <Register /> : <Navigate to="/app/dashboard" replace />} 
      />

      <Route 
        path="/forgot-password" 
        element={!isAuthenticated ? <ForgotPassword /> : <Navigate to="/app/dashboard" replace />} 
      />

      <Route 
        path="/reset-password/:token" 
        element={!isAuthenticated ? <ResetPassword /> : <Navigate to="/app/dashboard" replace />} 
      />

      {/* Protected routes with Layout */}
      <Route
        path="/app"
        element={isAuthenticated ? <Layout /> : <Navigate to="/login" replace />}
      >
        <Route index element={<Navigate to="/app/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        
        <Route path="employees" element={
          user?.role === 'admin' || user?.role === 'manager' ? <Employees /> : <NotAuthorized />
        } />
        
        <Route path="employees/:id" element={
          user?.role === 'admin' || user?.role === 'manager' ? <EmployeeDetails /> : <NotAuthorized />
        } />
        
        <Route path="departments" element={
          user?.role === 'admin' || user?.role === 'manager' ? <Departments /> : <NotAuthorized />
        } />
        
        <Route path="attendance" element={
          user?.role === 'admin' || user?.role === 'manager' ? <Attendance /> : <NotAuthorized />
        } />
        
        <Route path="performance" element={
          user?.role === 'admin' || user?.role === 'manager' ? <Performance /> : <NotAuthorized />
        } />
        
        <Route path="documents" element={
          user?.role === 'admin' || user?.role === 'manager' ? <Documents /> : <NotAuthorized />
        } />
        
        <Route path="messages" element={<Messages />} />
        <Route path="profile" element={<Profile />} />
        <Route path="profile/:userId" element={<Profile />} />
        <Route path="settings" element={<Settings />} />
        
        <Route path="reports" element={
          user?.role === 'admin' || user?.role === 'manager' ? <Reports /> : <NotAuthorized />
        } />
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
