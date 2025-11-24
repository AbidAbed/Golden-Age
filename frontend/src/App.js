import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { motion } from 'framer-motion';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LoadingSpinner from './components/LoadingSpinner';
import ProtectedRoute from './components/ProtectedRoute';
import ThreeJSBackground from './components/ThreeJSBackground'; // Import ThreeJSBackground
import { useAuth } from './context/AuthContext';

// Lazy load pages for better performance
const Home = React.lazy(() => import('./pages/Home')); // Changed to Home.js
const Browse = React.lazy(() => import('./pages/Browse'));
const Login = React.lazy(() => import('./pages/Login'));
const Register = React.lazy(() => import('./pages/Register'));
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const PostDetail = React.lazy(() => import('./pages/PostDetail'));
const Requests = React.lazy(() => import('./pages/Requests'));
const Profile = React.lazy(() => import('./pages/Profile'));
const About = React.lazy(() => import('./pages/About'));
const TwoFactorAuth = React.lazy(() => import('./pages/TwoFactorAuth')); // Lazy load the new 2FA page

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 10, // 10 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  const { loading } = useAuth();

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <div className="App">
          <ThreeJSBackground /> {/* Add ThreeJSBackground here */}
          <Navbar />
          <motion.main
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Suspense fallback={<LoadingSpinner />}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/browse" element={<Browse />} />
                <Route path="/about" element={<About />} />
                <Route 
                  path="/login" 
                  element={
                    <ProtectedRoute publicOnly>
                      <Login />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/register" 
                  element={
                    <ProtectedRoute publicOnly>
                      <Register />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/verify-2fa" 
                  element={
                    <ProtectedRoute publicOnly> {/* This page can be accessed by unauthenticated users for 2FA setup/login */}
                      <TwoFactorAuth />
                    </ProtectedRoute>
                  } 
                />
                <Route path="/post/:id" element={<PostDetail />} />
                <Route 
                  path="/requests" 
                  element={
                    <ProtectedRoute>
                      <Requests />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/dashboard" 
                  element={
                    <ProtectedRoute adminOnly>
                      <Dashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/profile" 
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="*" 
                  element={
                    <div className="container text-center mt-5 pt-5">
                      <h1>404 - Page Not Found</h1>
                      <p className="text-muted">The page you're looking for doesn't exist.</p>
                    </div>
                  } 
                />
              </Routes>
            </Suspense>
          </motion.main>
          <Footer />
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
