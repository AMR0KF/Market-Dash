import { create } from 'zustand';

interface AdminState {
  admin: any | null;
  token: string | null;
  login: (data: { admin: any; token: string }) => void;
  logout: () => void;
}

const defaultAdmin = {
  id: 'admin-super',
  email: 'admin@marketdash.com',
  name: 'Super Admin',
  role: 'SUPER_ADMIN'
};

// Drop sign in mode: ensure admin token is ready in localStorage
if (typeof window !== 'undefined') {
  if (!localStorage.getItem('admin_token')) {
    localStorage.setItem('admin_token', 'dev-admin-token');
  }
}

export const useAdminStore = create<AdminState>((set) => ({
  admin: defaultAdmin,
  token: typeof window !== 'undefined' ? (localStorage.getItem('admin_token') || 'dev-admin-token') : 'dev-admin-token',
  login: (data) => {
    localStorage.setItem('admin_token', data.token);
    set({ admin: data.admin, token: data.token });
  },
  logout: () => {
    localStorage.removeItem('admin_token');
    set({ admin: null, token: null });
  },
}));
