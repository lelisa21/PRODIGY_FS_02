import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { EmployeeProvider } from './context/EmployeeContext';
import { useAuthContext } from './context/AuthContext';

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

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuthContext();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500" />
      </div>
    );
  }
  
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuthContext();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500" />
      </div>
    );
  }
  
  return !isAuthenticated ? children : <Navigate to="/app/dashboard" replace />;
};

const RoleRoute = ({ roles = [], children }) => {
  const { isAuthenticated, isLoading, user } = useAuthContext();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const role = user?.role || 'employee';
  if (roles.length > 0 && !roles.includes(role)) {
    return <NotAuthorized />;
  }

  return children;
};

function App() {
  return (
    <BrowserRouter>
      <HelmetProvider>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <ToastProvider>
              <AuthProvider>
                <EmployeeProvider>
                  <Routes>
                    {/* Public routes */}
                    <Route path="/" element={<Landing />} />
                    
                    <Route path="/login" element={
                      <PublicRoute>
                        <Login />
                      </PublicRoute>
                    } />
                    
                    <Route path="/register" element={
                      <PublicRoute>
                        <Register />
                      </PublicRoute>
                    } />

                    <Route path="/forgot-password" element={
                      <PublicRoute>
                        <ForgotPassword />
                      </PublicRoute>
                    } />

                    <Route path="/reset-password/:token" element={
                      <PublicRoute>
                        <ResetPassword />
                      </PublicRoute>
                    } />

                    {/* Protected routes with Layout */}
                    <Route
                      path="/app"
                      element={
                        <PrivateRoute>
                          <Layout />
                        </PrivateRoute>
                      }
                    >
                      <Route index element={<Navigate to="/app/dashboard" replace />} />
                      <Route path="dashboard" element={<Dashboard />} />
                      <Route path="employees" element={
                        <RoleRoute roles={['admin', 'manager']}>
                          <Employees />
                        </RoleRoute>
                      } />
                      <Route path="employees/:id" element={
                        <RoleRoute roles={['admin', 'manager']}>
                          <EmployeeDetails />
                        </RoleRoute>
                      } />
                      <Route path="departments" element={
                        <RoleRoute roles={['admin', 'manager']}>
                          <Departments />
                        </RoleRoute>
                      } />
                      <Route path="attendance" element={
                        <RoleRoute roles={['admin', 'manager']}>
                          <Attendance />
                        </RoleRoute>
                      } />
                      <Route path="performance" element={
                        <RoleRoute roles={['admin', 'manager']}>
                          <Performance />
                        </RoleRoute>
                      } />
                      <Route path="documents" element={
                        <RoleRoute roles={['admin', 'manager']}>
                          <Documents />
                        </RoleRoute>
                      } />
                      <Route path="messages" element={<Messages />} />
                      <Route path="profile" element={<Profile />} />
                      <Route path="settings" element={<Settings />} />
                      <Route path="reports" element={
                        <RoleRoute roles={['admin', 'manager']}>
                          <Reports />
                        </RoleRoute>
                      } />
                    </Route>

                    {/* 404 */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </EmployeeProvider>
              </AuthProvider>
            </ToastProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </HelmetProvider>
    </BrowserRouter>
  );
}

export default App;
