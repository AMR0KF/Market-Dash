import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { useUiStore } from '../store/uiStore';
import api from '../api';
import { 
  CheckCircle2, 
  MapPin, 
  CreditCard, 
  FileText, 
  Loader2, 
  Banknote, 
  Landmark, 
  Smartphone, 
  Plus, 
  Check, 
  ShieldCheck, 
  ArrowLeft, 
  Package 
} from 'lucide-react';
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

const PAYMENT_METHODS = [
  { 
    id: 'CASH_ON_DELIVERY', 
    label: 'Cash on Delivery', 
    desc: 'Pay in cash upon arrival', 
    icon: Banknote 
  },
  { 
    id: 'OMT', 
    label: 'OMT Pay', 
    desc: 'Fast transfer & agent pay', 
    icon: Landmark 
  },
  { 
    id: 'WHISH', 
    label: 'Whish Money', 
    desc: 'Instant mobile e-wallet', 
    icon: Smartphone 
  }
];

export default function CheckoutPage() {
  const { items, subtotal, estimatedDeliveryFee, estimatedTotal, fetchCart } = useCart();
  const { showNotification } = useUiStore();
  const navigate = useNavigate();
  const isOrderPlacedRef = useRef(false);

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
    if (items.length === 0 && !isOrderPlacedRef.current) {
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
      
      isOrderPlacedRef.current = true;
      fetchCart();
      showNotification('Order placed successfully!', 'success');
      navigate(`/orders/${data.data.id}`);
    } catch (error: any) {
      showNotification(error.response?.data?.message || 'Failed to place order', 'error');
      setIsPlacingOrder(false);
    }
  };

  if (isLoadingAddresses) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-5 sm:py-6 pb-28 lg:pb-12">
      {/* Breadcrumb / Back Navigation */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <Link to="/cart" className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-green-600 transition-colors mb-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Cart
          </Link>
          <h1 className="text-2xl sm:text-2xl font-bold text-gray-900 tracking-tight">Checkout</h1>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
          <ShieldCheck className="w-4 h-4 text-green-600" />
          <span className="font-medium">Secure Checkout</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Checkout Steps */}
        <div className="lg:col-span-8 space-y-4">
          
          {/* Step 1: Delivery Address */}
          <section className="bg-white p-4 sm:p-5 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-3.5">
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-full bg-green-100 text-green-700 text-xs font-bold flex items-center justify-center">
                  1
                </span>
                <h2 className="text-base font-bold text-gray-900 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-green-600" /> Delivery Address
                </h2>
              </div>
              {!isAddingAddress && addresses.length > 0 && (
                <button 
                  onClick={() => setIsAddingAddress(true)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-green-600 hover:text-green-700 hover:bg-green-50 px-2.5 py-1 rounded-lg border border-green-200 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Add New
                </button>
              )}
            </div>

            {/* Address Selection Grid (Compact Multi-Column) */}
            {addresses.length > 0 && !isAddingAddress && (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2.5">
                {addresses.map((addr) => {
                  const isSelected = selectedAddressId === addr.id;
                  return (
                    <label 
                      key={addr.id} 
                      className={`relative flex flex-col justify-between p-3 rounded-lg border cursor-pointer transition-all text-left ${
                        isSelected 
                          ? 'border-green-600 bg-green-50/50 shadow-xs ring-1 ring-green-600' 
                          : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/50'
                      }`}
                    >
                      <input 
                        type="radio" 
                        name="address" 
                        value={addr.id} 
                        checked={isSelected}
                        onChange={(e) => setSelectedAddressId(e.target.value)}
                        className="sr-only"
                      />
                      <div>
                        <div className="flex items-center justify-between gap-1.5 mb-1">
                          <span className="font-bold text-xs text-gray-900 truncate">{addr.label}</span>
                          <div className="flex items-center gap-1 shrink-0">
                            {addr.isDefault && (
                              <span className="bg-gray-100 text-gray-600 text-[10px] font-semibold px-1.5 py-0.5 rounded">
                                Default
                              </span>
                            )}
                            <div className={`w-4 h-4 rounded-full flex items-center justify-center border transition-colors ${
                              isSelected ? 'bg-green-600 border-green-600 text-white' : 'border-gray-300 bg-white'
                            }`}>
                              {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                            </div>
                          </div>
                        </div>
                        <p className="text-xs text-gray-600 line-clamp-1 leading-snug">
                          {addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}
                        </p>
                        <p className="text-[11px] text-gray-400 line-clamp-1 mt-0.5">
                          {addr.city}, {addr.region}
                        </p>
                      </div>
                    </label>
                  );
                })}

                {/* Compact "+ Add" Card inside grid if user wants fast addition */}
                <button
                  type="button"
                  onClick={() => setIsAddingAddress(true)}
                  className="flex flex-col items-center justify-center p-3 rounded-lg border-2 border-dashed border-gray-200 hover:border-green-400 hover:bg-green-50/40 text-gray-500 hover:text-green-600 transition-all min-h-[72px]"
                >
                  <Plus className="w-4 h-4 mb-0.5" />
                  <span className="text-xs font-semibold">Add Address</span>
                </button>
              </div>
            )}

            {/* Add Address Form (Compact) */}
            {(isAddingAddress || addresses.length === 0) && (
              <form onSubmit={handleSubmit(onAddAddress)} className="bg-gray-50/80 p-3.5 rounded-lg border border-gray-200 mt-2">
                <div className="flex items-center justify-between mb-2.5">
                  <h3 className="font-bold text-xs text-gray-900">Add New Delivery Address</h3>
                  {addresses.length > 0 && (
                    <button 
                      type="button" 
                      onClick={() => setIsAddingAddress(false)}
                      className="text-xs text-gray-500 hover:text-gray-700"
                    >
                      Cancel
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-medium text-gray-600 mb-0.5">Label (e.g., Home, Office)</label>
                    <input 
                      {...register('label')} 
                      placeholder="Home"
                      className="w-full px-2.5 py-1.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-green-500 outline-none text-xs bg-white" 
                    />
                    {errors.label && <p className="text-red-500 text-[10px] mt-0.5">{errors.label.message}</p>}
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-medium text-gray-600 mb-0.5">Street Address</label>
                    <input 
                      {...register('line1')} 
                      placeholder="123 Main St"
                      className="w-full px-2.5 py-1.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-green-500 outline-none text-xs bg-white" 
                    />
                    {errors.line1 && <p className="text-red-500 text-[10px] mt-0.5">{errors.line1.message}</p>}
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-medium text-gray-600 mb-0.5">Apt, Suite, Unit (Optional)</label>
                    <input 
                      {...register('line2')} 
                      placeholder="Apt 4B"
                      className="w-full px-2.5 py-1.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-green-500 outline-none text-xs bg-white" 
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-gray-600 mb-0.5">City</label>
                    <input 
                      {...register('city')} 
                      placeholder="City"
                      className="w-full px-2.5 py-1.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-green-500 outline-none text-xs bg-white" 
                    />
                    {errors.city && <p className="text-red-500 text-[10px] mt-0.5">{errors.city.message}</p>}
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-gray-600 mb-0.5">Region / Postal Code</label>
                    <input 
                      {...register('region')} 
                      placeholder="Region"
                      className="w-full px-2.5 py-1.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-green-500 outline-none text-xs bg-white" 
                    />
                    {errors.region && <p className="text-red-500 text-[10px] mt-0.5">{errors.region.message}</p>}
                  </div>
                  <div className="sm:col-span-2 flex items-center pt-1">
                    <input 
                      type="checkbox" 
                      {...register('isDefault')} 
                      id="isDefault" 
                      className="w-3.5 h-3.5 text-green-600 rounded border-gray-300 focus:ring-green-500" 
                    />
                    <label htmlFor="isDefault" className="ml-2 text-[11px] text-gray-700">Set as default address</label>
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-2">
                  <button 
                    type="submit" 
                    className="bg-green-600 text-white px-3.5 py-1.5 rounded-md font-semibold text-xs hover:bg-green-700 transition-colors shadow-xs"
                  >
                    Save Address
                  </button>
                  {addresses.length > 0 && (
                    <button 
                      type="button" 
                      onClick={() => setIsAddingAddress(false)} 
                      className="px-3 py-1.5 border border-gray-300 rounded-md font-medium text-xs text-gray-700 hover:bg-white"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            )}
          </section>

          {/* Step 2: Payment Method (Icons, No Emojis, Compact Grid) */}
          <section className="bg-white p-4 sm:p-5 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-2.5 mb-3.5">
              <span className="w-6 h-6 rounded-full bg-green-100 text-green-700 text-xs font-bold flex items-center justify-center">
                2
              </span>
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-green-600" /> Payment Method
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {PAYMENT_METHODS.map((method) => {
                const IconComponent = method.icon;
                const isSelected = paymentMethod === method.id;
                return (
                  <label 
                    key={method.id}
                    className={`relative p-3 rounded-lg border cursor-pointer transition-all flex items-center gap-3 sm:flex-col sm:items-start ${
                      isSelected 
                        ? 'border-green-600 bg-green-50/50 shadow-xs ring-1 ring-green-600' 
                        : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/50'
                    }`}
                  >
                    <input 
                      type="radio" 
                      name="paymentMethod" 
                      value={method.id} 
                      checked={isSelected}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="sr-only"
                    />
                    
                    {/* Top Row: Icon and check indicator */}
                    <div className="w-full flex items-center justify-between">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                        isSelected ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600'
                      }`}>
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center border transition-colors ${
                        isSelected ? 'bg-green-600 border-green-600 text-white' : 'border-gray-300 bg-white'
                      }`}>
                        {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                      </div>
                    </div>

                    {/* Method Details */}
                    <div>
                      <p className="font-bold text-xs text-gray-900 sm:mt-1">{method.label}</p>
                      <p className="text-[11px] text-gray-500 line-clamp-1">{method.desc}</p>
                    </div>
                  </label>
                );
              })}
            </div>
          </section>

          {/* Step 3: Order Notes (Compact) */}
          <section className="bg-white p-4 sm:p-5 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-2.5 mb-2.5">
              <span className="w-6 h-6 rounded-full bg-green-100 text-green-700 text-xs font-bold flex items-center justify-center">
                3
              </span>
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-green-600" /> Delivery Notes
                <span className="text-xs font-normal text-gray-400 ml-1">(Optional)</span>
              </h2>
            </div>
            <textarea 
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Instructions for courier (e.g., gate code, leave at reception)..."
              rows={2}
              className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:ring-1 focus:ring-green-500 outline-none bg-gray-50/50 focus:bg-white resize-none transition-colors"
            />
          </section>

        </div>

        {/* Right Column: Order Summary Sidebar (Compact & Integrated Button) */}
        <div className="lg:col-span-4 lg:sticky lg:top-20">
          <div className="bg-white p-4 sm:p-5 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-100">
              <h2 className="text-base font-bold text-gray-900">Order Summary</h2>
              <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                {items.length} {items.length === 1 ? 'item' : 'items'}
              </span>
            </div>
            
            {/* Items List (Clean Scrollable Thumbnail View) */}
            <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1 mb-3 scrollbar-thin">
              {items.map(item => (
                <div key={item.id} className="flex items-center gap-2.5 text-xs">
                  <div className="w-9 h-9 rounded-md bg-gray-50 border border-gray-100 overflow-hidden shrink-0 flex items-center justify-center">
                    {item.product.images?.[0] ? (
                      <img src={item.product.images[0]} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <Package className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{item.product.name}</p>
                    <p className="text-[11px] text-gray-400">{item.quantity} × ${item.product.price.toFixed(2)}</p>
                  </div>
                  <span className="font-bold text-gray-900 shrink-0">
                    ${(item.product.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            {/* Calculations */}
            <div className="border-t border-gray-100 pt-2.5 space-y-1.5 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span className="font-medium text-gray-900">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Delivery Fee</span>
                <span className="font-medium text-gray-900">
                  {estimatedDeliveryFee === 0 ? <span className="text-green-600 font-semibold">Free</span> : `$${estimatedDeliveryFee.toFixed(2)}`}
                </span>
              </div>
            </div>

            {/* Total */}
            <div className="border-t border-gray-100 pt-3 mt-3 flex justify-between items-baseline">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-900">Total</span>
              <span className="text-2xl font-extrabold text-green-600 leading-none">
                ${estimatedTotal.toFixed(2)}
              </span>
            </div>

            {/* Desktop Place Order Button with Clean, Balanced Padding */}
            <div className="hidden lg:block mt-4 pt-1">
              <button 
                onClick={handlePlaceOrder}
                disabled={isPlacingOrder || !selectedAddressId}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-xl text-sm transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
              >
                {isPlacingOrder ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Placing Order...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Place Order</span>
                  </>
                )}
              </button>
              <div className="mt-2 text-center">
                <span className="inline-flex items-center gap-1 text-[11px] text-gray-400">
                  <ShieldCheck className="w-3.5 h-3.5 text-green-600" /> Guaranteed 100% Fresh Delivery
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Bottom Bar (Balanced Padding & Safe-Area Aware) */}
      <div 
        className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200 px-4 py-3 z-40 lg:hidden shadow-[0_-4px_16px_rgba(0,0,0,0.08)]"
        style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Total</span>
            <span className="text-xl font-extrabold text-green-600 leading-tight">
              ${estimatedTotal.toFixed(2)}
            </span>
          </div>
          <button 
            onClick={handlePlaceOrder}
            disabled={isPlacingOrder || !selectedAddressId}
            className="flex-1 max-w-[240px] bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 px-4 rounded-xl text-sm transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isPlacingOrder ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Placing...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Place Order</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
