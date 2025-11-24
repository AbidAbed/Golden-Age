import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../utils/api';

// Query keys
export const authKeys = {
  user: ['auth', 'user'],
  posts: ['posts'],
  comments: ['comments'],
};

// User profile query
export const useUser = () => {
  return useQuery({
    queryKey: authKeys.user,
    queryFn: async () => {
      const response = await api.get('/auth/me');
      return response.data.user;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Update user mutation
export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userData) => {
      const response = await api.put('/auth/me', userData);
      return response.data.user;
    },
    onSuccess: (data) => {
      // Update the cached user data
      queryClient.setQueryData(authKeys.user, data);
    },
  });
};

// Generate 2FA secret
export const useGenerate2FA = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await api.post('/auth/2fa/generate');
      return response.data;
    },
    onSuccess: () => {
      // Invalidate user query to refetch with new 2FA data
      queryClient.invalidateQueries({ queryKey: authKeys.user });
    },
  });
};

// Verify 2FA
export const useVerify2FA = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (token) => {
      const response = await api.post('/auth/2fa/verify', { token });
      return response.data;
    },
    onSuccess: () => {
      // Invalidate user data to refetch fresh data
      queryClient.invalidateQueries({ queryKey: authKeys.user });
    },
  });
};

// Disable 2FA
export const useDisable2FA = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await api.post('/auth/2fa/disable');
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.user });
    },
  });
};