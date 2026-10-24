import { X, Plus, Minus, ShoppingBag } from 'lucide-react';
import { useCart } from '../../hooks/useCart';
import { useUiStore } from '../../store/uiStore';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

export default function CartDrawer() {
  const { isCartOpen, toggleCart } = useUiStore();
  const { items, subtotal, estimatedDeliveryFee, estimatedTotal, handleUpdateItem, handleRemoveItem, fetchCart, isPending } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    if (isCartOpen) {
      fetchCart();
    }
  }, [isCartOpen, fetchCart]);

  if (!isCartOpen) return null;

  const handleCheckout = () => {
    toggleCart(false);
    navigate('/checkout');
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-white/60 backdrop-blur-sm z-50 transition-opacity"
        onClick={() => toggleCart(false)}
      />

      {/* Drawer / Bottom Sheet */}
      <div className="fixed inset-x-0 bottom-0 md:inset-y-0 md:right-0 md:left-auto z-50 w-full md:max-w-md bg-white shadow-2xl flex flex-col rounded-t-3xl md:rounded-none max-h-[90vh] md:max-h-screen animate-in slide-in-from-bottom md:slide-in-from-right duration-300">
        
        {/* Drag Handle (Mobile Only) */}
        <div className="w-full flex justify-center pt-3 pb-1 md:hidden" onClick={() => toggleCart(false)}>
          <div className="w-12 h-1.5 bg-gray-300 rounded-full"></div>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-green-600" />
            Your Cart
          </h2>
          <button 
            onClick={() => toggleCart(false)}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-12">
              <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center">
                <ShoppingBag className="h-10 w-10 text-gray-300" />
              </div>
              <div>
                <p className="text-lg font-medium text-gray-900">Your cart is empty</p>
                <p className="text-gray-500 text-sm mt-1">Looks like you haven't added anything yet.</p>
              </div>
              <button 
                onClick={() => toggleCart(false)}
                className="mt-4 px-6 py-3 bg-green-50 text-green-700 font-medium rounded-xl hover:bg-green-100 transition-colors min-h-[44px]"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4">
                  {/* Image Placeholder */}
                  <div className="w-20 h-20 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-center text-2xl flex-shrink-0">
                    {item.product.images?.[0] ? (
                      <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover rounded-xl" />
                    ) : (
                      '🛒'
                    )}
                  </div>
                  
                  <div className="flex-1 flex flex-col justify-between min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <div className="min-w-0 flex-1">
                        <h3 className="font-medium text-gray-900 line-clamp-2">{item.product.name}</h3>
                        <p className="text-sm text-gray-500 mt-0.5 truncate">${item.product.price.toFixed(2)} / {item.product.unit}</p>
                      </div>
                      <button
                        onClick={() => !isPending(item.id) && handleRemoveItem(item.id)}
                        disabled={isPending(item.id)}
                        className="text-gray-400 hover:text-red-500 p-2 min-h-[44px] min-w-[44px] flex items-center justify-center -mr-2 -mt-2 disabled:opacity-40"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center border border-gray-200 rounded-xl h-[44px]">
                        <button
                          onClick={() => !isPending(item.id) && handleUpdateItem(item.id, item.quantity - 1)}
                          disabled={isPending(item.id)}
                          className="w-10 h-full flex items-center justify-center text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-l-xl transition-colors disabled:opacity-40"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                        <button
                          onClick={() => !isPending(item.id) && handleUpdateItem(item.id, item.quantity + 1)}
                          disabled={item.quantity >= item.product.stock || isPending(item.id)}
                          className="w-10 h-full flex items-center justify-center text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-r-xl transition-colors disabled:opacity-40"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                      <p className="font-bold text-gray-900">
                        ${(item.product.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Summary */}
        {items.length > 0 && (
          <div className="border-t border-gray-100 p-6 bg-gray-50 pb-safe">
            <div className="space-y-3 mb-6 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span className="font-medium text-gray-900">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Delivery Fee</span>
                <span className="font-medium text-gray-900">
                  {estimatedDeliveryFee === 0 ? <span className="text-green-600">Free</span> : `$${estimatedDeliveryFee.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between text-lg font-bold text-gray-900 pt-3 border-t border-gray-200">
                <span>Total</span>
                <span>${estimatedTotal.toFixed(2)}</span>
              </div>
            </div>
            
            <button 
              onClick={handleCheckout}
              className="w-full bg-green-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-green-700 transition-colors shadow-sm min-h-[56px]"
            >
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>
    </>
  );
}
