import React, { createContext, useContext, useReducer, useEffect } from 'react';
import api from '../utils/api';
import toast, { Toaster } from 'react-hot-toast'; // Import Toaster

const AuthContext = createContext();

const initialState = {
  user: null,
  token: null,
  loading: true,
  isAuthenticated: false,
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: action.payload,
      };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    console.log('checkAuthStatus: Starting authentication check...');
    try {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      console.log('checkAuthStatus: Retrieved token:', token ? 'exists' : 'null');
      console.log('checkAuthStatus: Retrieved userData:', userData ? 'exists' : 'null');

      if (token && userData) {
        const user = JSON.parse(userData);
        console.log('checkAuthStatus: User data parsed:', user);
        
        // Verify token with backend with timeout
        try {
          console.log('checkAuthStatus: Attempting to verify token with backend...');
          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Timeout')), 3000)
          );
          
          const verifyPromise = api.get('/auth/me', {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          const response = await Promise.race([verifyPromise, timeoutPromise]);
          console.log('checkAuthStatus: Token verification successful, response:', response.data);
          
          // Update localStorage with fresh user data from backend
          localStorage.setItem('user', JSON.stringify(response.data.user));
          
          dispatch({
            type: 'LOGIN_SUCCESS',
            payload: { user: response.data.user, token },
          });
          console.log('checkAuthStatus: Dispatched LOGIN_SUCCESS. isAuthenticated should be true.');
        } catch (verifyError) {
          console.error('checkAuthStatus: Token verification failed:', verifyError);
          // Clear invalid token
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          console.log('checkAuthStatus: Cleared invalid token and user data from localStorage.');
          dispatch({ type: 'SET_LOADING', payload: false });
          console.log('checkAuthStatus: Dispatched SET_LOADING(false) after verification failure.');
        }
      } else {
        console.log('checkAuthStatus: No token or user data found in localStorage.');
        dispatch({ type: 'SET_LOADING', payload: false });
        console.log('checkAuthStatus: Dispatched SET_LOADING(false) because no token/user data.');
      }
    } catch (error) {
      console.error('checkAuthStatus: Auth check error:', error);
      dispatch({ type: 'SET_LOADING', payload: false });
      console.log('checkAuthStatus: Dispatched SET_LOADING(false) after general auth check error.');
    }
  };

  const login = async (credentials) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const response = await api.post('/auth/login', credentials);
      
      const { token, user, need2fa, userId } = response.data;

      if (need2fa) {
        dispatch({ type: 'SET_LOADING', payload: false });
        return { success: true, need2fa: true, userId };
      }

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user, token },
      });

      toast.success(`Welcome back, ${user.username}!`);
      return { success: true, user, need2fa: false };
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      const message = error.response?.data?.message || 'Login failed';
      return { success: false, message };
    }
  };

  const register = async (userData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const response = await api.post('/auth/register', userData);
      // Do not automatically log in after registration, wait for 2FA setup
      dispatch({ type: 'SET_LOADING', payload: false });
      toast.success(`Account created! Please set up 2FA.`);
      return { 
        success: true, 
        userId: response.data.userId, // Return userId
        secret: response.data.secret, // Use 'secret' from backend response
        otpauthUrl: response.data.otpauthUrl, // Use 'otpauthUrl' from backend response
        qrCodeUrl: response.data.qrCodeUrl, // Add qrCodeUrl
      }; // Return user data and 2FA setup data
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      const message = error.response?.data?.message || 'Registration failed';
      return { success: false, message };
    }
  };

  const verify2FA = async (userId, twoFactorToken, secret = null) => { // Updated to accept optional secret
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await api.post('/auth/verify-2fa', { userId, twoFactorToken, secret }); // Pass secret if provided
      
      const { token, user } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user, token },
      });

      toast.success('2FA verified and login successful!');
      return { success: true, user };
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      const message = error.response?.data?.message || '2FA verification failed';
      return { success: false, message };
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      dispatch({ type: 'LOGOUT' });
      toast.success('Logged out successfully');
    }
  };

  const updateUser = (userData) => {
    const updatedUser = { ...state.user, ...userData };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    dispatch({ type: 'UPDATE_USER', payload: updatedUser });
  };

  const generate2FASecret = async () => {
    try {
      const response = await api.post('/auth/2fa/generate');
      return { success: true, ...response.data };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to generate 2FA secret';
      toast.error(message);
      return { success: false, message };
    }
  };

  const verify2FAToken = async (token) => {
    try {
      const response = await api.post('/auth/2fa/verify', { token });
      return { success: true, ...response.data };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to verify 2FA token';
      toast.error(message);
      return { success: false, message };
    }
  };

  const disable2FA = async () => {
    try {
      const response = await api.post('/auth/2fa/disable');
      return { success: true, ...response.data };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to disable 2FA';
      toast.error(message);
      return { success: false, message };
    }
  };

  const value = {
    ...state,
    login,
    register,
    logout,
    updateUser,
    verify2FA, // Use the unified verify2FA for both login and registration
    generate2FASecret,
    verify2FAToken,
    disable2FA,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          className: 'react-hot-toast-dark',
          style: {
            padding: '16px',
            borderRadius: '12px',
            background: '#1a1a1a',
            color: '#fff',
            border: '1px solid #333',
          },
          error: {
            iconTheme: {
              primary: '#dc3545',
              secondary: '#ffffff',
            },
          },
          success: {
            iconTheme: {
              primary: '#28a745',
              secondary: '#ffffff',
            },
          },
        }}
      />
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
