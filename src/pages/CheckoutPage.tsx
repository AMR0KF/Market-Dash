import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { useUiStore } from '../store/uiStore';
import api from '../api';
import { CheckCircle2, MapPin, CreditCard, FileText, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const addressSchema = z.object({
  label: z.string().min(1, 'Label is required'),
  line1: z.string().min(1, 'Address line 1 is required'),
  line2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  region: z.string().min(1, 'Region is required'),
  isDefault: z.boolean().optional(),
});

type AddressFormValues = z.infer<typeof addressSchema>;

export default function CheckoutPage() {
  const { items, subtotal, estimatedDeliveryFee, estimatedTotal, fetchCart } = useCart();
  const { showNotification } = useUiStore();
  const navigate = useNavigate();

  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('CASH_ON_DELIVERY');
  const [notes, setNotes] = useState('');
  
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(true);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema)
  });

  useEffect(() => {
    if (items.length === 0) {
      navigate('/cart');
      return;
    }
    loadAddresses();
  }, [items.length, navigate]);

  const loadAddresses = async () => {
    try {
      const { data } = await api.get('/users/addresses');
      setAddresses(data.data);
      const defaultAddr = data.data.find((a: any) => a.isDefault);
      if (defaultAddr) {
        setSelectedAddressId(defaultAddr.id);
      } else if (data.data.length > 0) {
        setSelectedAddressId(data.data[0].id);
      } else {
        setIsAddingAddress(true);
      }
    } catch (error) {
      showNotification('Failed to load addresses', 'error');
    } finally {
      setIsLoadingAddresses(false);
    }
  };

  const onAddAddress = async (data: AddressFormValues) => {
    try {
      const res = await api.post('/users/addresses', data);
      setAddresses([...addresses, res.data.data]);
      setSelectedAddressId(res.data.data.id);
      setIsAddingAddress(false);
      reset();
      showNotification('Address added successfully', 'success');
    } catch (error) {
      showNotification('Failed to add address', 'error');
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      showNotification('Please select a delivery address', 'error');
      return;
    }

    setIsPlacingOrder(true);
    try {
      const { data } = await api.post('/orders', {
        addressId: selectedAddressId,
        paymentMethod,
        notes
      });
      
      await fetchCart(); // Refresh cart to empty it in UI
      showNotification('Order placed successfully!', 'success');
      navigate(`/orders/${data.data.id}`);
    } catch (error: any) {
      showNotification(error.response?.data?.message || 'Failed to place order', 'error');
      setIsPlacingOrder(false);
    }
  };

  if (isLoadingAddresses) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-green-600" /></div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1 space-y-8">
          
          {/* Step 1: Delivery Address */}
          <section className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-green-100 text-green-700 rounded-full flex items-center justify-center font-bold">1</div>
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <MapPin className="w-5 h-5" /> Delivery Address
              </h2>
            </div>

            {addresses.length > 0 && !isAddingAddress && (
              <div className="space-y-4 mb-6">
                {addresses.map((addr) => (
                  <label 
                    key={addr.id} 
                    className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-colors ${
                      selectedAddressId === addr.id ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-green-300'
                    }`}
                  >
                    <input 
                      type="radio" 
                      name="address" 
                      value={addr.id} 
                      checked={selectedAddressId === addr.id}
                      onChange={(e) => setSelectedAddressId(e.target.value)}
                      className="mt-1 w-4 h-4 text-green-600 focus:ring-green-500"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900">{addr.label}</span>
                        {addr.isDefault && <span className="bg-gray-200 text-gray-700 text-xs px-2 py-0.5 rounded-full">Default</span>}
                      </div>
                      <p className="text-gray-600 mt-1">{addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}</p>
                      <p className="text-gray-600">{addr.city}, {addr.region}</p>
                    </div>
                  </label>
                ))}
                <button 
                  onClick={() => setIsAddingAddress(true)}
                  className="text-green-600 font-medium hover:underline min-h-[44px] flex items-center"
                >
                  + Add a new address
                </button>
              </div>
            )}

            {(isAddingAddress || addresses.length === 0) && (
              <form onSubmit={handleSubmit(onAddAddress)} className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                <h3 className="font-bold text-gray-900 mb-4">Add New Address</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Label (e.g., Home, Work)</label>
                    <input {...register('label')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none text-[16px]" />
                    {errors.label && <p className="text-red-500 text-xs mt-1">{errors.label.message}</p>}
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 1</label>
                    <input {...register('line1')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none text-[16px]" />
                    {errors.line1 && <p className="text-red-500 text-xs mt-1">{errors.line1.message}</p>}
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 2 (Optional)</label>
                    <input {...register('line2')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none text-[16px]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                    <input {...register('city')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none text-[16px]" />
                    {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Region</label>
                    <input {...register('region')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none text-[16px]" />
                    {errors.region && <p className="text-red-500 text-xs mt-1">{errors.region.message}</p>}
                  </div>
                  <div className="sm:col-span-2 flex items-center mt-2">
                    <input type="checkbox" {...register('isDefault')} id="isDefault" className="w-4 h-4 text-green-600 rounded border-gray-300 focus:ring-green-500" />
                    <label htmlFor="isDefault" className="ml-2 text-sm text-gray-700">Set as default address</label>
                  </div>
                </div>
                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                  <button type="submit" className="bg-green-600 text-white px-6 py-3 sm:py-2 rounded-xl sm:rounded-lg font-medium hover:bg-green-700 min-h-[44px]">Save Address</button>
                  {addresses.length > 0 && (
                    <button type="button" onClick={() => setIsAddingAddress(false)} className="px-6 py-3 sm:py-2 border border-gray-300 rounded-xl sm:rounded-lg font-medium text-gray-700 hover:bg-gray-50 min-h-[44px]">Cancel</button>
                  )}
                </div>
              </form>
            )}
          </section>

          {/* Step 2: Payment Method */}
          <section className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-green-100 text-green-700 rounded-full flex items-center justify-center font-bold">2</div>
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <CreditCard className="w-5 h-5" /> Payment Method
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { id: 'CASH_ON_DELIVERY', label: 'Cash on Delivery', icon: '💵' },
                { id: 'OMT', label: 'OMT Pay', icon: '🏦' },
                { id: 'WHISH', label: 'Whish Money', icon: '📱' }
              ].map((method) => (
                <label 
                  key={method.id}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition-all text-center ${
                    paymentMethod === method.id ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-green-300'
                  }`}
                >
                  <input 
                    type="radio" 
                    name="paymentMethod" 
                    value={method.id} 
                    checked={paymentMethod === method.id}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="sr-only"
                  />
                  <span className="text-3xl mb-2">{method.icon}</span>
                  <span className="font-bold text-gray-900">{method.label}</span>
                </label>
              ))}
            </div>
          </section>

          {/* Step 3: Notes */}
          <section className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-green-100 text-green-700 rounded-full flex items-center justify-center font-bold">3</div>
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <FileText className="w-5 h-5" /> Order Notes (Optional)
              </h2>
            </div>
            <textarea 
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any special instructions for delivery?"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 outline-none min-h-[100px] resize-y text-[16px]"
            ></textarea>
          </section>

        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:w-96 flex-shrink-0 pb-24 lg:pb-0">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 lg:sticky lg:top-24">
            <h2 className="text-xl font-bold text-gray-900 mb-6 hidden lg:block">Order Summary</h2>
            
            <div className="space-y-4 mb-6 max-h-60 overflow-y-auto pr-2 hidden lg:block">
              {items.map(item => (
                <div key={item.id} className="flex justify-between text-sm">
                  <div className="flex gap-2 text-gray-600">
                    <span className="font-medium text-gray-900">{item.quantity}x</span>
                    <span className="line-clamp-1">{item.product.name}</span>
                  </div>
                  <span className="font-medium text-gray-900">${(item.product.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-100 pt-4 space-y-3 mb-6 text-sm hidden lg:block">
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
                onClick={handlePlaceOrder}
                disabled={isPlacingOrder || !selectedAddressId}
                className="w-full bg-green-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-green-700 transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-h-[56px]"
              >
                {isPlacingOrder ? <Loader2 className="w-6 h-6 animate-spin" /> : <CheckCircle2 className="w-6 h-6" />}
                {isPlacingOrder ? 'Placing Order...' : 'Place Order'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
