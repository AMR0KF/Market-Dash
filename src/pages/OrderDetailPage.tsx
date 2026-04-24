import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import api from '../api';
import { useUiStore } from '../store/uiStore';
import { Package, MapPin, CreditCard, Clock, CheckCircle2, Truck, XCircle, ArrowLeft } from 'lucide-react';

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { showNotification } = useUiStore();

  const { data: order, isLoading, refetch } = useQuery({
    queryKey: ['order', id],
    queryFn: async () => {
      const { data } = await api.get(`/orders/my-orders/${id}`);
      return data.data;
    },
    enabled: !!id
  });

  const handleCancel = async () => {
    if (window.confirm('Are you sure you want to cancel this order?')) {
      try {
        await api.post(`/orders/my-orders/${id}/cancel`);
        showNotification('Order cancelled successfully', 'success');
        refetch();
      } catch (error: any) {
        showNotification(error.response?.data?.message || 'Failed to cancel order', 'error');
      }
    }
  };

  if (isLoading) {
    return <div className="max-w-4xl mx-auto px-4 py-16 animate-pulse bg-gray-100 h-96 rounded-2xl"></div>;
  }

  if (!order) {
    return <div className="max-w-4xl mx-auto px-4 py-16 text-center text-2xl font-bold">Order not found</div>;
  }

  const statuses = ['PENDING', 'CONFIRMED', 'PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED'];
  const currentStatusIndex = statuses.indexOf(order.status);
  const isCancelled = order.status === 'CANCELLED';

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'PENDING': return <Clock className="w-6 h-6" />;
      case 'CONFIRMED': return <CheckCircle2 className="w-6 h-6" />;
      case 'PREPARING': return <Package className="w-6 h-6" />;
      case 'OUT_FOR_DELIVERY': return <Truck className="w-6 h-6" />;
      case 'DELIVERED': return <CheckCircle2 className="w-6 h-6" />;
      case 'CANCELLED': return <XCircle className="w-6 h-6" />;
      default: return <Clock className="w-6 h-6" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link to="/orders" className="inline-flex items-center text-gray-500 hover:text-green-600 mb-6 transition-colors min-h-[44px]">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Orders
      </Link>

      <div className="flex flex-col sm:flex-row justify-between sm:items-start mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Order #{order.id.slice(-8).toUpperCase()}</h1>
          <p className="text-gray-500 mt-1">
            Placed on {new Date(order.createdAt).toLocaleDateString('en-US', { 
              weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit'
            })}
          </p>
        </div>
        {order.status === 'PENDING' && (
          <button 
            onClick={handleCancel}
            className="w-full sm:w-auto px-4 py-2 bg-red-50 text-red-600 font-medium rounded-lg hover:bg-red-100 transition-colors min-h-[44px] flex items-center justify-center"
          >
            Cancel Order
          </button>
        )}
      </div>

      {/* Status Tracker */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100 mb-8 overflow-x-auto">
        {isCancelled ? (
          <div className="flex items-center justify-center gap-3 text-red-600 py-4">
            <XCircle className="w-8 h-8" />
            <span className="text-xl font-bold">This order was cancelled.</span>
          </div>
        ) : (
          <div className="flex items-center justify-between min-w-[600px]">
            {statuses.map((status, index) => {
              const isCompleted = index <= currentStatusIndex;
              const isCurrent = index === currentStatusIndex;
              
              return (
                <div key={status} className="flex flex-col items-center relative z-10 flex-1">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-colors ${
                    isCurrent ? 'bg-green-600 text-white shadow-lg ring-4 ring-green-100' :
                    isCompleted ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                  }`}>
                    {getStatusIcon(status)}
                  </div>
                  <span className={`text-xs font-bold text-center ${isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>
                    {status.replace(/_/g, ' ')}
                  </span>
                  
                  {/* Connector Line */}
                  {index < statuses.length - 1 && (
                    <div className={`absolute top-6 left-1/2 w-full h-1 -z-10 ${
                      index < currentStatusIndex ? 'bg-green-500' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Order Items */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Items Ordered</h2>
            <div className="space-y-4">
              {order.items.map((item: any) => (
                <div key={item.id} className="flex gap-4 items-center py-4 border-b border-gray-50 last:border-0 last:pb-0">
                  <div className="w-16 h-16 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-center p-1">
                    {item.product.images?.[0] ? (
                      <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-contain" />
                    ) : (
                      <Package className="text-gray-300" />
                    )}
                  </div>
                  <div className="flex-1">
                    <Link to={`/product/${item.productId}`} className="font-bold text-gray-900 hover:text-green-600 transition-colors line-clamp-1">
                      {item.product.name}
                    </Link>
                    <p className="text-sm text-gray-500">${item.unitPrice.toFixed(2)} each</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">${item.totalPrice.toFixed(2)}</p>
                    <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Order Details Sidebar */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Summary</h2>
            <div className="space-y-3 text-sm mb-4">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span className="font-medium text-gray-900">${order.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Delivery Fee</span>
                <span className="font-medium text-gray-900">
                  {order.deliveryFee === 0 ? 'Free' : `$${order.deliveryFee.toFixed(2)}`}
                </span>
              </div>
            </div>
            <div className="border-t border-gray-100 pt-4 flex justify-between items-end">
              <span className="font-bold text-gray-900">Total</span>
              <span className="text-2xl font-extrabold text-green-600">${order.total.toFixed(2)}</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-gray-400" /> Delivery Address
            </h2>
            <div className="text-sm text-gray-600 space-y-1">
              <p className="font-bold text-gray-900">{order.address.label}</p>
              <p>{order.address.line1}</p>
              {order.address.line2 && <p>{order.address.line2}</p>}
              <p>{order.address.city}, {order.address.region}</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-gray-400" /> Payment
            </h2>
            <div className="text-sm text-gray-600">
              <p>Method: <span className="font-bold text-gray-900">{order.paymentMethod.replace(/_/g, ' ')}</span></p>
              <p>Status: <span className="font-bold text-gray-900">{order.paymentStatus}</span></p>
            </div>
          </div>
          
          {order.notes && (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 mb-2">Notes</h2>
              <p className="text-sm text-gray-600 italic">"{order.notes}"</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
