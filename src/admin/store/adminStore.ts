import { create } from 'zustand';

interface AdminState {
  admin: any | null;
  token: string | null;
  login: (data: { admin: any; token: string }) => void;
  logout: () => void;
}

export const useAdminStore = create<AdminState>((set) => ({
  admin: null,
  token: localStorage.getItem('admin_token'),
  login: (data) => {
    localStorage.setItem('admin_token', data.token);
    set({ admin: data.admin, token: data.token });
  },
  logout: () => {
    localStorage.removeItem('admin_token');
    set({ admin: null, token: null });
  },
}));
