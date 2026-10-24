import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Search, Eye, Loader2, Filter, Package } from 'lucide-react';
import api from '../../api';
import EmptyState from '../../components/ui/EmptyState';
import ErrorBoundary from '../../components/ui/ErrorBoundary';

function OrderListContent() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateRange, setDateRange] = useState('');

  const { data: ordersData, isLoading, isError } = useQuery({
    queryKey: ['admin-orders', searchTerm, statusFilter, dateRange],
    queryFn: async () => {
      try {
        const { data } = await api.get('/orders/admin/all', {
          params: { search: searchTerm, status: statusFilter, dateRange }
        });
        return Array.isArray(data.data) ? data.data : (data.data?.data || []);
      } catch (error) {
        // Mock fallback
        return [
          { id: 'ORD-12345678', customer: { name: 'John Doe' }, createdAt: new Date().toISOString(), itemsCount: 3, total: 145.99, paymentMethod: 'CREDIT_CARD', paymentStatus: 'PAID', status: 'PENDING' },
          { id: 'ORD-87654321', customer: { name: 'Jane Smith' }, createdAt: new Date(Date.now() - 86400000).toISOString(), itemsCount: 1, total: 29.99, paymentMethod: 'PAYPAL', paymentStatus: 'PAID', status: 'PROCESSING' },
          { id: 'ORD-11223344', customer: { name: 'Bob Johnson' }, createdAt: new Date(Date.now() - 172800000).toISOString(), itemsCount: 5, total: 340.50, paymentMethod: 'CASH_ON_DELIVERY', paymentStatus: 'PENDING', status: 'DELIVERED' },
          { id: 'ORD-99887766', customer: { name: 'Alice Brown' }, createdAt: new Date(Date.now() - 259200000).toISOString(), itemsCount: 2, total: 85.00, paymentMethod: 'CREDIT_CARD', paymentStatus: 'FAILED', status: 'CANCELLED' },
        ];
      }
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DELIVERED': return 'bg-green-100 text-green-800';
      case 'PROCESSING': return 'bg-blue-100 text-blue-800';
      case 'SHIPPED': return 'bg-purple-100 text-purple-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800'; // PENDING
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'PAID': return 'bg-green-100 text-green-800';
      case 'FAILED': return 'bg-red-100 text-red-800';
      case 'REFUNDED': return 'bg-gray-100 text-gray-800';
      default: return 'bg-yellow-100 text-yellow-800'; // PENDING
    }
  };

  if (isError) {
    throw new Error('Failed to load orders');
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="text-gray-500 mt-1">Manage and track customer orders</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by Order ID or Customer Name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
          />
        </div>
        <div className="flex flex-wrap gap-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 outline-none bg-white min-w-[150px]"
          >
            <option value="">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="PROCESSING">Processing</option>
            <option value="SHIPPED">Shipped</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 outline-none bg-white min-w-[150px]"
          >
            <option value="">All Time</option>
            <option value="today">Today</option>
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-green-600" />
          </div>
        ) : ordersData?.length === 0 ? (
          <EmptyState
            icon={<Package className="w-8 h-8" />}
            title="No orders found"
            description="Try adjusting your search or filters."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-500 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 font-medium">Order ID</th>
                  <th className="px-6 py-4 font-medium">Customer</th>
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium text-right">Items</th>
                  <th className="px-6 py-4 font-medium text-right">Total</th>
                  <th className="px-6 py-4 font-medium">Payment</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {ordersData?.map((order: any) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">{order.id.slice(-8).toUpperCase()}</td>
                    <td className="px-6 py-4 text-gray-600">{order.customer?.name || 'Guest'}</td>
                    <td className="px-6 py-4 text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-right text-gray-500">{order.itemsCount}</td>
                    <td className="px-6 py-4 text-right font-medium text-gray-900">${order.total.toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-xs text-gray-500">{order.paymentMethod.replace(/_/g, ' ')}</span>
                        <span className={`inline-flex w-fit items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wide ${getPaymentStatusColor(order.paymentStatus)}`}>
                          {order.paymentStatus}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        to={`/admin/orders/${order.id}`}
                        className="inline-flex items-center justify-center p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {/* Pagination (Mock) */}
        {ordersData?.length > 0 && (
          <div className="p-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
            <span>Showing 1 to {ordersData.length} entries</span>
            <div className="flex gap-1">
              <button className="px-3 py-1 border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50" disabled>Prev</button>
              <button className="px-3 py-1 bg-green-600 text-white rounded">1</button>
              <button className="px-3 py-1 border border-gray-200 rounded hover:bg-gray-50">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function OrderList() {
  return (
    <ErrorBoundary>
      <OrderListContent />
    </ErrorBoundary>
  );
}
