import { Link, useLocation } from 'react-router-dom';
import { Home, Grid, Search, Package, User } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

export default function BottomNav() {
  const location = useLocation();
  const { isAuthenticated } = useAuthStore();

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/categories', label: 'Categories', icon: Grid },
    { path: '/search', label: 'Search', icon: Search },
    { path: isAuthenticated ? '/orders' : '/login', label: 'Orders', icon: Package },
    { path: isAuthenticated ? '/account' : '/login', label: 'Account', icon: User },
  ];

  // Hide bottom nav on specific pages where we have sticky bottom action bars
  const hideOnPages = ['/cart', '/checkout', '/product/'];
  const shouldHide = hideOnPages.some(path => location.pathname.startsWith(path));

  if (shouldHide) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-safe z-40 md:hidden">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
          
          return (
            <Link
              key={item.label}
              to={item.path}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 min-h-[44px] ${
                isActive ? 'text-green-600' : 'text-gray-500 hover:text-green-600'
              }`}
            >
              <Icon className="h-6 w-6" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
