import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Search, User, Menu, Store, LogOut, Package, Settings, X, ChevronRight } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';
import { useUiStore } from '../../store/uiStore';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../api';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const { itemCount } = useCartStore();
  const { toggleCart } = useUiStore();
  const navigate = useNavigate();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await api.get('/categories');
      return res.data.data;
    }
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsMenuOpen(false);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            
            {/* Logo & Mobile Menu Toggle */}
            <div className="flex items-center gap-2">
              <button 
                className="md:hidden p-2 -ml-2 text-gray-600 hover:text-green-600 min-h-[44px] min-w-[44px] flex items-center justify-center"
                onClick={() => setIsMobileMenuOpen(true)}
              >
                <Menu className="h-6 w-6" />
              </button>
              <Link to="/" className="flex items-center gap-2 text-green-600">
                <Store className="h-8 w-8" />
                <span className="font-bold text-xl tracking-tight hidden sm:block">MarketDash</span>
              </Link>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-2xl px-4 sm:px-6 lg:px-8 hidden md:block">
              <form onSubmit={handleSearch} className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-full leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-green-500 focus:border-green-500 text-[16px] transition-colors"
                  placeholder="Search for groceries..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </form>
            </div>

            {/* Right Nav */}
            <div className="flex items-center gap-2 md:gap-4">
              <Link to="/categories" className="text-gray-600 hover:text-green-600 font-medium text-sm hidden md:flex items-center min-h-[44px]">
                Categories
              </Link>

              {/* User Menu (Desktop) */}
              <div className="relative hidden md:block">
                {isAuthenticated ? (
                  <div>
                    <button 
                      onClick={() => setIsMenuOpen(!isMenuOpen)}
                      className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-all min-h-[44px] min-w-[44px] justify-center"
                    >
                      <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold">
                        {user?.name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                    </button>

                    {/* Dropdown */}
                    {isMenuOpen && (
                      <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-xl shadow-lg bg-white ring-1 ring-black ring-opacity-5 divide-y divide-gray-100 focus:outline-none">
                        <div className="px-4 py-3">
                          <p className="text-sm">Signed in as</p>
                          <p className="text-sm font-medium text-gray-900 truncate">{user?.email}</p>
                        </div>
                        <div className="py-1">
                          <Link to="/orders" onClick={() => setIsMenuOpen(false)} className="group flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-green-600 min-h-[44px]">
                            <Package className="mr-3 h-4 w-4 text-gray-400 group-hover:text-green-500" />
                            My Orders
                          </Link>
                          <Link to="/account" onClick={() => setIsMenuOpen(false)} className="group flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-green-600 min-h-[44px]">
                            <Settings className="mr-3 h-4 w-4 text-gray-400 group-hover:text-green-500" />
                            Account Settings
                          </Link>
                        </div>
                        <div className="py-1">
                          <button onClick={handleLogout} className="group flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 min-h-[44px]">
                            <LogOut className="mr-3 h-4 w-4 text-red-400 group-hover:text-red-500" />
                            Logout
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Link to="/login" className="text-gray-600 hover:text-green-600 font-medium text-sm px-3 py-2 min-h-[44px] flex items-center">
                      Log in
                    </Link>
                    <Link to="/register" className="bg-green-600 hover:bg-green-700 text-white font-medium text-sm px-4 py-2 rounded-lg transition-colors shadow-sm min-h-[44px] flex items-center">
                      Sign up
                    </Link>
                  </div>
                )}
              </div>

              {/* Cart Button */}
              <button 
                onClick={() => toggleCart(true)}
                className="relative p-2 text-gray-600 hover:text-green-600 transition-colors rounded-full hover:bg-green-50 min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <ShoppingCart className="h-6 w-6" />
                {itemCount > 0 && (
                  <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-green-600 rounded-full">
                    {itemCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Overlay */}
          <div 
            className="fixed inset-0 bg-white bg-opacity-60 transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          
          {/* Drawer */}
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white shadow-xl">
            <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100">
              <Link to="/" className="flex items-center gap-2 text-green-600" onClick={() => setIsMobileMenuOpen(false)}>
                <Store className="h-8 w-8" />
                <span className="font-bold text-xl tracking-tight">MarketDash</span>
              </Link>
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 text-gray-500 hover:text-gray-700 min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="flex-1 h-0 overflow-y-auto">
              <nav className="px-4 py-6 space-y-6">
                {/* Search */}
                <form onSubmit={handleSearch} className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-green-500 focus:border-green-500 text-[16px] transition-colors"
                    placeholder="Search for groceries..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </form>

                {/* Categories */}
                <div>
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Categories</h3>
                  <div className="space-y-1">
                    <Link 
                      to="/categories" 
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center justify-between px-3 py-3 text-base font-medium text-gray-900 rounded-lg hover:bg-gray-50 min-h-[44px]"
                    >
                      All Categories
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    </Link>
                    {categories?.map((cat: any) => (
                      <Link 
                        key={cat.id}
                        to={`/category/${cat.slug}`} 
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center justify-between px-3 py-3 text-base font-medium text-gray-600 rounded-lg hover:bg-gray-50 hover:text-gray-900 min-h-[44px]"
                      >
                        {cat.name}
                        <ChevronRight className="h-5 w-5 text-gray-400" />
                      </Link>
                    ))}
                  </div>
                </div>
              </nav>
            </div>

            {/* Auth Footer */}
            <div className="p-4 border-t border-gray-100 bg-gray-50">
              {isAuthenticated ? (
                <div className="space-y-4">
                  <div className="flex items-center px-3">
                    <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-lg">
                      {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                      <p className="text-xs font-medium text-gray-500">{user?.email}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Link 
                      to="/orders" 
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center justify-center px-4 py-3 border border-gray-200 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 min-h-[44px]"
                    >
                      My Orders
                    </Link>
                    <Link 
                      to="/account" 
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center justify-center px-4 py-3 border border-gray-200 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 min-h-[44px]"
                    >
                      Account
                    </Link>
                  </div>
                  <button 
                    onClick={handleLogout}
                    className="flex w-full items-center justify-center px-4 py-3 border border-transparent rounded-lg shadow-sm text-base font-medium text-red-600 bg-red-50 hover:bg-red-100 min-h-[44px]"
                  >
                    <LogOut className="mr-2 h-5 w-5" />
                    Logout
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <Link 
                    to="/login" 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50 min-h-[44px]"
                  >
                    Log in
                  </Link>
                  <Link 
                    to="/register" 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-center px-4 py-3 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-green-600 hover:bg-green-700 min-h-[44px]"
                  >
                    Sign up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
