import { Store, Facebook, Twitter, Instagram, Database, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../api';
import { useUiStore } from '../../store/uiStore';
import { useState } from 'react';

export default function Footer() {
  const { showNotification } = useUiStore();
  const [isLoading, setIsLoading] = useState(false);

  const handleSeed = async () => {
    setIsLoading(true);
    try {
      await api.post('/dev/seed');
      showNotification('Dummy data seeded successfully! Refresh the page.', 'success');
      setTimeout(() => window.location.reload(), 1500);
    } catch (error: any) {
      showNotification(error.response?.data?.message || 'Failed to seed data', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = async () => {
    if (!window.confirm('Are you sure you want to clear all dummy data?')) return;
    setIsLoading(true);
    try {
      await api.post('/dev/clear');
      showNotification('Dummy data cleared successfully! Refresh the page.', 'success');
      setTimeout(() => window.location.reload(), 1500);
    } catch (error: any) {
      showNotification(error.response?.data?.message || 'Failed to clear data', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <footer className="bg-white border-t border-gray-100 pt-12 pb-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-8">
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center gap-2 text-green-600 mb-4">
              <Store className="h-8 w-8" />
              <span className="font-bold text-xl tracking-tight">MarketDash</span>
            </Link>
            <p className="text-gray-500 text-sm leading-relaxed mb-4 max-w-sm">
              Your favorite supermarket, delivered to your door in minutes. Fresh groceries, everyday essentials, and more.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-gray-400 hover:text-green-600 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"><Facebook className="h-5 w-5" /></a>
              <a href="#" className="text-gray-400 hover:text-green-600 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"><Twitter className="h-5 w-5" /></a>
              <a href="#" className="text-gray-400 hover:text-green-600 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"><Instagram className="h-5 w-5" /></a>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Shop</h3>
            <ul className="space-y-1 text-sm text-gray-500">
              <li><Link to="/categories" className="flex items-center hover:text-green-600 transition-colors min-h-[44px]">All Categories</Link></li>
              <li><Link to="/category/fresh-produce" className="flex items-center hover:text-green-600 transition-colors min-h-[44px]">Fresh Produce</Link></li>
              <li><Link to="/category/dairy-eggs" className="flex items-center hover:text-green-600 transition-colors min-h-[44px]">Dairy & Eggs</Link></li>
              <li><Link to="/category/meat-seafood" className="flex items-center hover:text-green-600 transition-colors min-h-[44px]">Meat & Seafood</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Company</h3>
            <ul className="space-y-1 text-sm text-gray-500">
              <li><a href="#" className="flex items-center hover:text-green-600 transition-colors min-h-[44px]">About Us</a></li>
              <li><a href="#" className="flex items-center hover:text-green-600 transition-colors min-h-[44px]">Careers</a></li>
              <li><a href="#" className="flex items-center hover:text-green-600 transition-colors min-h-[44px]">Blog</a></li>
              <li><a href="#" className="flex items-center hover:text-green-600 transition-colors min-h-[44px]">Press</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Dev Tools</h3>
            <ul className="space-y-3 text-sm text-gray-500">
              <li>
                <button 
                  onClick={handleSeed} 
                  disabled={isLoading}
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors disabled:opacity-50 min-h-[44px]"
                >
                  <Database className="w-4 h-4" /> Seed Dummy Data
                </button>
              </li>
              <li>
                <button 
                  onClick={handleClear} 
                  disabled={isLoading}
                  className="flex items-center gap-2 text-red-600 hover:text-red-700 transition-colors disabled:opacity-50 min-h-[44px]"
                >
                  <Trash2 className="w-4 h-4" /> Clear Dummy Data
                </button>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-400">
            © {new Date().getFullYear()} MarketDash Inc. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-gray-400">
            <a href="#" className="hover:text-gray-600">Privacy Policy</a>
            <a href="#" className="hover:text-gray-600">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
