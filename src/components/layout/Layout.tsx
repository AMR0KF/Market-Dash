import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import CartDrawer from './CartDrawer';
import Notification from '../ui/Notification';
import BottomNav from './BottomNav';

export default function Layout() {
  const location = useLocation();
  const hideBottomNavPages = ['/cart', '/checkout', '/product/'];
  const isBottomNavHidden = hideBottomNavPages.some(path => location.pathname.startsWith(path));

  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900 font-sans overflow-x-hidden">
      <Navbar />
      <main className={`flex-1 ${isBottomNavHidden ? '' : 'pb-16 md:pb-0'}`}>
        <Outlet />
      </main>
      <Footer />
      <CartDrawer />
      <Notification />
      <BottomNav />
    </div>
  );
}
