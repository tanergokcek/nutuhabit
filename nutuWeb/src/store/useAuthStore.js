import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  loading: true,

  setUser: (user) => set({ user, isAuthenticated: !!user, loading: false }),
  setLoading: (loading) => set({ loading }),
  logout: () => set({ user: null, isAuthenticated: false, loading: false }),
}));
