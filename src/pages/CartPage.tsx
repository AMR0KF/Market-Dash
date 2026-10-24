import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { ShoppingBag, Trash2, Plus, Minus, ArrowRight } from 'lucide-react';
import EmptyState from '../components/ui/EmptyState';

export default function CartPage() {
  const { items, subtotal, estimatedDeliveryFee, estimatedTotal, handleUpdateItem, handleRemoveItem, handleClearCart, isPending } = useCart();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-12 text-center max-w-2xl mx-auto">
          <EmptyState
            icon={<ShoppingBag className="w-8 h-8" />}
            title="Your cart is empty"
            description="Looks like you haven't added any groceries yet."
            actionText="Start Shopping"
            actionTo="/"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-end mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
        <button 
          onClick={handleClearCart}
          className="text-red-500 hover:text-red-600 font-medium flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-red-50 transition-colors"
        >
          <Trash2 size={20} /> Clear Cart
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Cart Items */}
        <div className="flex-1 space-y-4">
          {items.map((item) => (
            <div key={item.id} className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-4 sm:gap-6 items-center">
              {/* Image */}
              <Link to={`/product/${item.productId}`} className="w-24 h-24 sm:w-32 sm:h-32 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-center flex-shrink-0 p-2">
                {item.product.images?.[0] ? (
                  <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-contain" />
                ) : (
                  <ShoppingBag size={32} className="text-gray-300" />
                )}
              </Link>

              {/* Details */}
              <div className="flex-1 flex flex-col justify-between w-full">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <Link to={`/product/${item.productId}`} className="hover:text-green-600 transition-colors">
                      <h3 className="text-lg font-bold text-gray-900 line-clamp-2">{item.product.name}</h3>
                    </Link>
                    <p className="text-gray-500 mt-1">{item.product.unit}</p>
                  </div>
                  <p className="text-xl font-bold text-gray-900 ml-4">
                    ${(item.product.price * item.quantity).toFixed(2)}
                  </p>
                </div>

                <div className="flex justify-between items-end mt-4">
                  <p className="text-gray-500 font-medium">${item.product.price.toFixed(2)} each</p>
                  
                  <div className="flex items-center gap-4">
                    <div className="flex items-center border border-gray-300 rounded-lg bg-white h-[44px]">
                      <button 
                        onClick={() => !isPending(item.id) && handleUpdateItem(item.id, item.quantity - 1)}
                        disabled={isPending(item.id)}
                        className="w-10 h-full flex items-center justify-center text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-l-lg transition-colors disabled:opacity-40"
                      >
                        <Minus size={18} />
                      </button>
                      <span className="w-10 text-center font-bold">{item.quantity}</span>
                      <button 
                        onClick={() => !isPending(item.id) && handleUpdateItem(item.id, item.quantity + 1)}
                        className="w-10 h-full flex items-center justify-center text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-r-lg transition-colors disabled:opacity-40"
                        disabled={item.quantity >= item.product.stock || isPending(item.id)}
                      >
                        <Plus size={18} />
                      </button>
                    </div>
                    
                    <button 
                      onClick={() => !isPending(item.id) && handleRemoveItem(item.id)}
                      disabled={isPending(item.id)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center disabled:opacity-40"
                      title="Remove item"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:w-96 flex-shrink-0 pb-24 lg:pb-0">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 lg:sticky lg:top-24">
            <h2 className="text-xl font-bold text-gray-900 mb-6 hidden lg:block">Order Summary</h2>
            
            <div className="space-y-4 mb-6 text-gray-600 hidden lg:block">
              <div className="flex justify-between">
                <span>Subtotal ({items.reduce((acc, item) => acc + item.quantity, 0)} items)</span>
                <span className="font-medium text-gray-900">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Fee</span>
                <span className="font-medium text-gray-900">
                  {estimatedDeliveryFee === 0 ? (
                    <span className="text-green-600 bg-green-50 px-2 py-0.5 rounded text-sm font-bold">Free</span>
                  ) : (
                    `$${estimatedDeliveryFee.toFixed(2)}`
                  )}
                </span>
              </div>
              {estimatedDeliveryFee > 0 && (
                <p className="text-xs text-gray-400 mt-1">
                  Free delivery on orders over $50
                </p>
              )}
            </div>

            <div className="border-t border-gray-100 pt-4 mb-8 hidden lg:block">
              <div className="flex justify-between items-end">
                <span className="text-lg font-bold text-gray-900">Total</span>
                <span className="text-3xl font-extrabold text-green-600">${estimatedTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Mobile Sticky Bottom Bar */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 pb-safe z-40 lg:static lg:border-none lg:p-0 lg:bg-transparent">
              <div className="flex justify-between items-center mb-4 lg:hidden">
                <span className="text-lg font-bold text-gray-900">Total</span>
                <span className="text-2xl font-extrabold text-green-600">${estimatedTotal.toFixed(2)}</span>
              </div>
              <button 
                onClick={() => navigate('/checkout')}
                className="w-full bg-green-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-green-700 transition-colors shadow-md hover:shadow-lg flex items-center justify-center gap-2 min-h-[56px]"
              >
                Continue to Checkout <ArrowRight size={20} />
              </button>
            </div>
            
            <div className="mt-4 text-center hidden lg:block">
              <Link to="/" className="text-green-600 font-medium hover:underline">
                or Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
