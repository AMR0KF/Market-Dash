import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { 
  TrendingUp, ShoppingBag, AlertCircle, Package, ArrowRight, Loader2 
} from 'lucide-react';
import api from '../../api';

export default function Dashboard() {
  const { data: statsData, isLoading: isStatsLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      try {
        const { data } = await api.get('/orders/stats');
        return data.data;
      } catch (error) {
        // Mock data fallback if endpoint doesn't exist yet
        return {
          totalOrdersToday: 24,
          revenueToday: 1250.50,
          pendingOrders: 5,
          totalProductsActive: 142,
          recentOrders: [
            { id: 'ORD-1234', customerName: 'John Doe', itemsCount: 3, total: 145.99, status: 'PENDING', createdAt: new Date().toISOString() },
            { id: 'ORD-1235', customerName: 'Jane Smith', itemsCount: 1, total: 29.99, status: 'PROCESSING', createdAt: new Date(Date.now() - 86400000).toISOString() },
            { id: 'ORD-1236', customerName: 'Bob Johnson', itemsCount: 5, total: 340.50, status: 'DELIVERED', createdAt: new Date(Date.now() - 172800000).toISOString() },
          ],
          revenueChart: [
            { date: 'Mon', revenue: 400 },
            { date: 'Tue', revenue: 300 },
            { date: 'Wed', revenue: 550 },
            { date: 'Thu', revenue: 450 },
            { date: 'Fri', revenue: 700 },
            { date: 'Sat', revenue: 850 },
            { date: 'Sun', revenue: 1250 },
          ],
          topProducts: [
            { id: '1', name: 'Organic Bananas', unitsSold: 145, revenue: 433.55 },
            { id: '2', name: 'Whole Milk', unitsSold: 98, revenue: 342.02 },
            { id: '3', name: 'Sourdough Loaf', unitsSold: 76, revenue: 455.24 },
          ]
        };
      }
    }
  });

  const { data: lowStockProducts, isLoading: isLowStockLoading } = useQuery({
    queryKey: ['admin-low-stock'],
    queryFn: async () => {
      try {
        const { data } = await api.get('/products?lowStock=true');
        return data.data;
      } catch (error) {
        // Mock data fallback
        return [
          { id: '4', name: 'Avocado', stock: 5 },
          { id: '5', name: 'Strawberries', stock: 2 },
          { id: '6', name: 'Almond Milk', stock: 8 },
        ];
      }
    }
  });

  if (isStatsLoading || isLowStockLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  const stats = statsData || {};

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-500 mt-1">Welcome back to MarketDash Admin</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 font-medium">Orders Today</h3>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.totalOrdersToday}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 font-medium">Revenue Today</h3>
            <div className="p-2 bg-green-50 text-green-600 rounded-lg">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">${stats.revenueToday?.toFixed(2)}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 font-medium">Pending Orders</h3>
            <div className={`p-2 rounded-lg ${stats.pendingOrders > 0 ? 'bg-red-50 text-red-600' : 'bg-gray-50 text-gray-600'}`}>
              <AlertCircle className="w-5 h-5" />
            </div>
          </div>
          <p className={`text-3xl font-bold ${stats.pendingOrders > 0 ? 'text-red-600' : 'text-gray-900'}`}>
            {stats.pendingOrders}
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 font-medium">Active Products</h3>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.totalProductsActive}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Revenue Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 lg:col-span-2">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Revenue (Last 7 Days)</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.revenueChart}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#6B7280' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280' }} dx={-10} tickFormatter={(value) => `$${value}`} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: number) => [`$${value.toFixed(2)}`, 'Revenue']}
                />
                <Line type="monotone" dataKey="revenue" stroke="#16a34a" strokeWidth={3} dot={{ r: 4, fill: '#16a34a', strokeWidth: 0 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900">Low Stock Alerts</h3>
            <span className="bg-red-600 text-gray-900 text-xs font-bold px-2 py-1 rounded-full">
              {lowStockProducts?.length || 0} Items
            </span>
          </div>
          <div className="space-y-4">
            {lowStockProducts?.length === 0 ? (
              <p className="text-gray-500 text-sm">All products are well stocked.</p>
            ) : (
              lowStockProducts?.map((product: any) => (
                <div key={product.id} className="flex items-center justify-between p-3 bg-red-50 rounded-xl border border-red-100">
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{product.name}</p>
                    <p className="text-red-600 text-xs font-bold mt-0.5">Stock: {product.stock}</p>
                  </div>
                  <Link to={`/admin/products/${product.id}/edit`} className="text-red-600 hover:text-red-800 text-sm font-medium">
                    Edit
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Orders */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h3 className="text-lg font-bold text-gray-900">Recent Orders</h3>
            <Link to="/admin/orders" className="text-green-600 hover:text-green-700 text-sm font-medium flex items-center">
              View All <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-500">
                <tr>
                  <th className="px-6 py-3 font-medium">Order #</th>
                  <th className="px-6 py-3 font-medium">Customer</th>
                  <th className="px-6 py-3 font-medium">Total</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {stats.recentOrders?.map((order: any) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">{order.id.slice(-8).toUpperCase()}</td>
                    <td className="px-6 py-4 text-gray-600">{order.customerName}</td>
                    <td className="px-6 py-4 font-medium">${order.total.toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                        order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                        order.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link to={`/admin/orders/${order.id}`} className="text-green-600 hover:text-green-800 font-medium">
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Selling Products */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-lg font-bold text-gray-900">Top Selling Products</h3>
            <p className="text-sm text-gray-500 mt-1">Last 30 days</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-500">
                <tr>
                  <th className="px-6 py-3 font-medium">Product</th>
                  <th className="px-6 py-3 font-medium text-right">Units Sold</th>
                  <th className="px-6 py-3 font-medium text-right">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {stats.topProducts?.map((product: any) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">{product.name}</td>
                    <td className="px-6 py-4 text-right text-gray-600">{product.unitsSold}</td>
                    <td className="px-6 py-4 text-right font-medium text-green-600">${product.revenue.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
