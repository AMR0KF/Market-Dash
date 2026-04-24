import { useQuery } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../api';
import { Package, ChevronRight, Clock, CheckCircle2, Truck, XCircle, ChevronLeft } from 'lucide-react';
import EmptyState from '../components/ui/EmptyState';
import ErrorBoundary from '../components/ui/ErrorBoundary';
import SkeletonCard from '../components/ui/SkeletonCard';

function OrdersContent() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = parseInt(searchParams.get('page') || '1', 10);

  const { data: ordersData, isLoading, isError } = useQuery({
    queryKey: ['orders', page],
    queryFn: async () => {
      const { data } = await api.get('/orders/my-orders', { params: { page, limit: 10 } });
      return data.data;
    }
  });

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'PENDING': return <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1"><Clock className="w-3 h-3"/> Pending</span>;
      case 'CONFIRMED': return <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> Confirmed</span>;
      case 'PREPARING': return <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1"><Package className="w-3 h-3"/> Preparing</span>;
      case 'OUT_FOR_DELIVERY': return <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1"><Truck className="w-3 h-3"/> Out for Delivery</span>;
      case 'DELIVERED': return <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> Delivered</span>;
      case 'CANCELLED': return <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1"><XCircle className="w-3 h-3"/> Cancelled</span>;
      default: return <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-xs font-bold">{status}</span>;
    }
  };

  if (isError) {
    throw new Error('Failed to load orders');
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Orders</h1>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-gray-100 animate-pulse rounded-2xl h-32"></div>
          ))}
        </div>
      ) : ordersData?.data?.length === 0 ? (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
          <EmptyState
            icon={<Package className="w-8 h-8" />}
            title="No orders yet"
            description="You haven't placed any orders. Start shopping now!"
            actionText="Start Shopping"
            actionTo="/"
          />
        </div>
      ) : (
        <div className="space-y-4">
          {ordersData?.data?.map((order: any) => (
            <Link 
              key={order.id} 
              to={`/orders/${order.id}`}
              className="block bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-green-200 transition-all group"
            >
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-4 pb-4 border-b border-gray-50">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-bold text-gray-900">Order #{order.id.slice(-8).toUpperCase()}</span>
                    {getStatusBadge(order.status)}
                  </div>
                  <p className="text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString('en-US', { 
                      month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit'
                    })}
                  </p>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-xl font-extrabold text-green-600">${order.total.toFixed(2)}</p>
                  <p className="text-sm text-gray-500">{order.items.length} items</p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex -space-x-2 overflow-hidden">
                  {order.items.slice(0, 5).map((item: any, idx: number) => (
                    <div key={idx} className="inline-block h-10 w-10 rounded-full ring-2 ring-white bg-gray-50 border border-gray-200 flex items-center justify-center overflow-hidden">
                      {item.product.images?.[0] ? (
                        <img src={item.product.images[0]} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <Package className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                  ))}
                  {order.items.length > 5 && (
                    <div className="inline-block h-10 w-10 rounded-full ring-2 ring-white bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600">
                      +{order.items.length - 5}
                    </div>
                  )}
                </div>
                <div className="flex items-center text-green-600 font-medium group-hover:translate-x-1 transition-transform">
                  View Details <ChevronRight className="w-5 h-5 ml-1" />
                </div>
              </div>
            </Link>
          ))}

          {/* Pagination */}
          {ordersData?.totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-8">
              <button 
                disabled={page === 1}
                onClick={() => setSearchParams({ page: (page - 1).toString() })}
                className="p-2 rounded-lg border border-gray-200 disabled:opacity-50 hover:bg-gray-50 min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <ChevronLeft size={20} />
              </button>
              <span className="font-medium text-gray-700">
                Page {page} of {ordersData.totalPages}
              </span>
              <button 
                disabled={page === ordersData.totalPages}
                onClick={() => setSearchParams({ page: (page + 1).toString() })}
                className="p-2 rounded-lg border border-gray-200 disabled:opacity-50 hover:bg-gray-50 min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function OrdersPage() {
  return (
    <ErrorBoundary>
      <OrdersContent />
    </ErrorBoundary>
  );
}
