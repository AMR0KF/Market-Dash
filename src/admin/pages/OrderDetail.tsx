import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, MapPin, CreditCard, Clock, User, Phone, Loader2, CheckCircle } from 'lucide-react';
import api from '../../api';

export default function OrderDetail() {
  const { id } = useParams();
  const [isUpdating, setIsUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState('');

  const { data: order, isLoading, refetch } = useQuery({
    queryKey: ['admin-order', id],
    queryFn: async () => {
      try {
        const { data } = await api.get(`/orders/${id}`);
        return data.data;
      } catch (error) {
        // Mock fallback
        return {
          id: id || 'ORD-12345678',
          createdAt: new Date().toISOString(),
          status: 'PROCESSING',
          paymentStatus: 'PAID',
          paymentMethod: 'CREDIT_CARD',
          subtotal: 135.99,
          deliveryFee: 10.00,
          total: 145.99,
          notes: 'Please leave at the front door.',
          customer: {
            id: 'CUST-1',
            name: 'John Doe',
            email: 'john@example.com',
            phone: '+1 234 567 8900'
          },
          address: {
            label: 'Home',
            line1: '123 Main St',
            line2: 'Apt 4B',
            city: 'New York',
            region: 'NY 10001'
          },
          items: [
            { id: '1', product: { name: 'Organic Bananas', image: 'https://images.unsplash.com/photo-1603833665858-e61d17a86224?auto=format&fit=crop&w=200&q=80' }, quantity: 2, price: 2.99 },
            { id: '2', product: { name: 'Whole Milk', image: null }, quantity: 1, price: 3.49 },
            { id: '3', product: { name: 'Sourdough Loaf', image: null }, quantity: 1, price: 6.50 },
          ],
          timeline: [
            { status: 'PENDING', timestamp: new Date(Date.now() - 86400000).toISOString() },
            { status: 'PAID', timestamp: new Date(Date.now() - 86000000).toISOString() },
            { status: 'PROCESSING', timestamp: new Date(Date.now() - 80000000).toISOString() },
          ]
        };
      }
    }
  });

  const handleStatusUpdate = async () => {
    if (!newStatus || newStatus === order?.status) return;
    
    setIsUpdating(true);
    try {
      await api.put(`/orders/${id}/status`, { status: newStatus });
      refetch();
      alert('Order status updated successfully');
    } catch (error) {
      alert('Failed to update order status');
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  if (!order) return <div>Order not found</div>;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DELIVERED': return 'bg-green-100 text-green-800';
      case 'PROCESSING': return 'bg-blue-100 text-blue-800';
      case 'SHIPPED': return 'bg-purple-100 text-purple-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800'; // PENDING
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Link to="/admin/orders" className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">Order {order.id.slice(-8).toUpperCase()}</h1>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                {order.status}
              </span>
            </div>
            <p className="text-gray-500 mt-1 text-sm">
              Placed on {new Date(order.createdAt).toLocaleString()}
            </p>
          </div>
        </div>
        
        {/* Status Update Control */}
        <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-gray-200 shadow-sm">
          <select
            value={newStatus || order.status}
            onChange={(e) => setNewStatus(e.target.value)}
            className="px-3 py-1.5 border-none bg-transparent focus:ring-0 text-sm font-medium outline-none cursor-pointer"
          >
            <option value="PENDING">Pending</option>
            <option value="PROCESSING">Processing</option>
            <option value="SHIPPED">Shipped</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
          <button
            onClick={handleStatusUpdate}
            disabled={isUpdating || !newStatus || newStatus === order.status}
            className="px-4 py-1.5 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50 transition-colors"
          >
            {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Update'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Order Items</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-500">
                  <tr>
                    <th className="px-6 py-3 font-medium">Product</th>
                    <th className="px-6 py-3 font-medium text-center">Qty</th>
                    <th className="px-6 py-3 font-medium text-right">Price</th>
                    <th className="px-6 py-3 font-medium text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {order.items.map((item: any) => (
                    <tr key={item.id}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                            {item.product.image ? (
                              <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400">No img</div>
                            )}
                          </div>
                          <span className="font-medium text-gray-900">{item.product.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center text-gray-600">{item.quantity}</td>
                      <td className="px-6 py-4 text-right text-gray-600">${item.price.toFixed(2)}</td>
                      <td className="px-6 py-4 text-right font-medium text-gray-900">${(item.quantity * item.price).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Totals */}
            <div className="p-6 bg-gray-50 border-t border-gray-100">
              <div className="w-full max-w-xs ml-auto space-y-3 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>${order.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Delivery Fee</span>
                  <span>${order.deliveryFee.toFixed(2)}</span>
                </div>
                <div className="pt-3 border-t border-gray-200 flex justify-between font-bold text-lg text-gray-900">
                  <span>Total</span>
                  <span>${order.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Clock className="w-5 h-5 text-gray-400" /> Order Timeline
            </h2>
            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
              {order.timeline.map((event: any, index: number) => (
                <div key={index} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-300 group-[.is-active]:bg-green-500 text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-slate-200 shadow-sm bg-white">
                    <div className="flex items-center justify-between space-x-2 mb-1">
                      <div className="font-bold text-slate-900">{event.status}</div>
                      <time className="text-xs font-medium text-slate-500">{new Date(event.timestamp).toLocaleString()}</time>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-6">
          {/* Customer Info */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-gray-400" /> Customer
            </h2>
            <div className="space-y-3">
              <Link to={`/admin/customers/${order.customer.id}`} className="font-medium text-green-600 hover:text-green-700 hover:underline">
                {order.customer.name}
              </Link>
              <p className="text-sm text-gray-600">{order.customer.email}</p>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone className="w-4 h-4 text-gray-400" />
                {order.customer.phone || 'No phone provided'}
              </div>
            </div>
          </div>

          {/* Delivery Address */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-gray-400" /> Delivery Address
            </h2>
            <div className="text-sm text-gray-600 space-y-1">
              <p className="font-medium text-gray-900">{order.address.label}</p>
              <p>{order.address.line1}</p>
              {order.address.line2 && <p>{order.address.line2}</p>}
              <p>{order.address.city}, {order.address.region}</p>
            </div>
          </div>

          {/* Payment Info */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-gray-400" /> Payment Info
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Method</span>
                <span className="font-medium text-gray-900">{order.paymentMethod.replace(/_/g, ' ')}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Status</span>
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wide ${
                  order.paymentStatus === 'PAID' ? 'bg-green-100 text-green-800' :
                  order.paymentStatus === 'FAILED' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {order.paymentStatus}
                </span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {order.notes && (
            <div className="bg-yellow-50 p-6 rounded-2xl border border-yellow-100">
              <h2 className="text-sm font-bold text-yellow-800 mb-2">Customer Notes</h2>
              <p className="text-sm text-yellow-700 italic">"{order.notes}"</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
