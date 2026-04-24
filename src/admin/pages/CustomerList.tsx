import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Eye, Loader2, X, MapPin, ShoppingBag } from 'lucide-react';
import api from '../../api';

export default function CustomerList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);

  const { data: customersData, isLoading } = useQuery({
    queryKey: ['admin-customers', searchTerm],
    queryFn: async () => {
      try {
        const { data } = await api.get('/admin/customers', {
          params: { search: searchTerm }
        });
        return data.data;
      } catch (error) {
        // Mock fallback
        return [
          { 
            id: 'CUST-1', 
            name: 'John Doe', 
            email: 'john@example.com', 
            phone: '+1 234 567 8900', 
            totalOrders: 12, 
            totalSpent: 1450.50, 
            createdAt: new Date(Date.now() - 10000000000).toISOString(),
            recentOrders: [
              { id: 'ORD-123', status: 'DELIVERED', total: 145.99, date: new Date().toISOString() },
              { id: 'ORD-122', status: 'DELIVERED', total: 89.00, date: new Date(Date.now() - 864000000).toISOString() },
            ],
            addresses: [
              { label: 'Home', line1: '123 Main St', city: 'New York', region: 'NY 10001' }
            ]
          },
          { 
            id: 'CUST-2', 
            name: 'Jane Smith', 
            email: 'jane@example.com', 
            phone: '+1 987 654 3210', 
            totalOrders: 3, 
            totalSpent: 210.00, 
            createdAt: new Date(Date.now() - 5000000000).toISOString(),
            recentOrders: [
              { id: 'ORD-124', status: 'PROCESSING', total: 29.99, date: new Date().toISOString() },
            ],
            addresses: [
              { label: 'Work', line1: '456 Tech Park', city: 'San Francisco', region: 'CA 94105' }
            ]
          },
        ];
      }
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
          <p className="text-gray-500 mt-1">Manage your customer base</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
          />
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-green-600" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-500 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 font-medium">Customer</th>
                  <th className="px-6 py-4 font-medium">Contact</th>
                  <th className="px-6 py-4 font-medium text-right">Orders</th>
                  <th className="px-6 py-4 font-medium text-right">Total Spent</th>
                  <th className="px-6 py-4 font-medium">Registered</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {customersData?.map((customer: any) => (
                  <tr key={customer.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => setSelectedCustomer(customer)}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-bold">
                          {customer.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-gray-900">{customer.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-gray-900">{customer.email}</span>
                        <span className="text-gray-500 text-xs">{customer.phone || 'No phone'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-gray-900">{customer.totalOrders}</td>
                    <td className="px-6 py-4 text-right font-medium text-green-600">${customer.totalSpent.toFixed(2)}</td>
                    <td className="px-6 py-4 text-gray-500">{new Date(customer.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={(e) => { e.stopPropagation(); setSelectedCustomer(customer); }}
                        className="inline-flex items-center justify-center p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {customersData?.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      No customers found matching your criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Customer Detail Drawer/Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-white/60 backdrop-blur-sm transition-opacity"
            onClick={() => setSelectedCustomer(null)}
          />
          
          {/* Drawer */}
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">Customer Details</h2>
              <button 
                onClick={() => setSelectedCustomer(null)}
                className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {/* Profile Header */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-bold text-2xl">
                  {selectedCustomer.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{selectedCustomer.name}</h3>
                  <p className="text-gray-500">{selectedCustomer.email}</p>
                  <p className="text-gray-500 text-sm">{selectedCustomer.phone}</p>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <p className="text-sm text-gray-500 mb-1">Total Orders</p>
                  <p className="text-2xl font-bold text-gray-900">{selectedCustomer.totalOrders}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <p className="text-sm text-gray-500 mb-1">Total Spent</p>
                  <p className="text-2xl font-bold text-green-600">${selectedCustomer.totalSpent.toFixed(2)}</p>
                </div>
              </div>

              {/* Recent Orders */}
              <div>
                <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-gray-400" /> Recent Orders
                </h4>
                <div className="space-y-3">
                  {selectedCustomer.recentOrders?.map((order: any) => (
                    <div key={order.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-xl hover:bg-gray-50">
                      <div>
                        <p className="font-medium text-gray-900">{order.id}</p>
                        <p className="text-xs text-gray-500">{new Date(order.date).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">${order.total.toFixed(2)}</p>
                        <span className="text-[10px] font-bold tracking-wide uppercase text-gray-500">{order.status}</span>
                      </div>
                    </div>
                  ))}
                  {(!selectedCustomer.recentOrders || selectedCustomer.recentOrders.length === 0) && (
                    <p className="text-sm text-gray-500 italic">No orders yet.</p>
                  )}
                </div>
              </div>

              {/* Saved Addresses */}
              <div>
                <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-gray-400" /> Saved Addresses
                </h4>
                <div className="space-y-3">
                  {selectedCustomer.addresses?.map((address: any, idx: number) => (
                    <div key={idx} className="p-3 border border-gray-100 rounded-xl bg-gray-50 text-sm text-gray-600">
                      <p className="font-medium text-gray-900 mb-1">{address.label}</p>
                      <p>{address.line1}</p>
                      <p>{address.city}, {address.region}</p>
                    </div>
                  ))}
                  {(!selectedCustomer.addresses || selectedCustomer.addresses.length === 0) && (
                    <p className="text-sm text-gray-500 italic">No saved addresses.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
