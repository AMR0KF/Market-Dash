import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useCartStore } from '../src/store/cartStore';
import { useThemeStore } from '../src/theme/themeStore';
import { Address } from '../src/types';
import { api } from '../src/services/api';
import { MapPin, CreditCard, CheckCircle } from 'lucide-react-native';

export default function CheckoutScreen() {
  const router = useRouter();
  const { colors, mode } = useThemeStore();
  const { items, getSubtotal, clearCart } = useCartStore();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'CASH_ON_DELIVERY' | 'CARD'>('CASH_ON_DELIVERY');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New Address form
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [label, setLabel] = useState('Home');
  const [line1, setLine1] = useState('');
  const [city, setCity] = useState('');
  const [region, setRegion] = useState('');
  const [gateNotes, setGateNotes] = useState('');
  const [isLocating, setIsLocating] = useState(false);

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/users/addresses');
      if (response.data.success) {
        const addrList: Address[] = response.data.data;
        setAddresses(addrList);
        if (addrList.length === 0) {
          setShowAddAddress(true);
        } else {
          const defaultAddr = addrList.find((a) => a.isDefault) || addrList[0];
          if (defaultAddr) {
            setSelectedAddressId(defaultAddr.id);
          }
        }
      }
    } catch (e) {
      console.warn('Failed to load addresses', e);
      setShowAddAddress(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGPSLocate = () => {
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      setIsLocating(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setIsLocating(false);
          const { latitude, longitude } = pos.coords;
          setLine1(`GPS Pin: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
          setCity('Current Area');
          setRegion('GPS Verified');
          Alert.alert('GPS Location Pin Captured!', `Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}`);
        },
        (err) => {
          setIsLocating(false);
          Alert.alert('GPS Notice', 'Could not fetch precise GPS position. Please enter street address manually.');
        },
        { timeout: 8000, enableHighAccuracy: true }
      );
    } else {
      Alert.alert('GPS Notice', 'GPS is not available on this browser/device.');
    }
  };

  const handleCreateAddress = async () => {
    if (!line1 || !city || !region) {
      Alert.alert('Validation Error', 'Please complete address line, city, and region.');
      return;
    }
    try {
      const response = await api.post('/users/addresses', {
        label,
        line1,
        city,
        region,
        gateNotes,
        isDefault: addresses.length === 0,
      });
      if (response.data.success) {
        setShowAddAddress(false);
        fetchAddresses();
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to add address');
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      Alert.alert('Address Required', 'Please select or create a delivery address.');
      return;
    }

    try {
      setIsSubmitting(true);
      const combinedNotes = gateNotes ? `Gate Notes: ${gateNotes}. ${notes}` : notes;
      const response = await api.post('/orders', {
        addressId: selectedAddressId,
        paymentMethod,
        notes: combinedNotes,
      });

      if (response.data.success) {
        await clearCart();
        Alert.alert('Order Placed!', 'Your grocery order is on its way.', [
          { text: 'View Orders', onPress: () => router.replace('/(tabs)/orders') },
        ]);
      } else {
        Alert.alert('Checkout Failed', response.data.message || 'Error placing order');
      }
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.message || 'Error processing checkout');
    } finally {
      setIsSubmitting(false);
    }
  };

  const subtotal = getSubtotal();
  const deliveryFee = 3.99;
  const grandTotal = subtotal + deliveryFee;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Delivery Address Selection */}
        <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.sectionHeader}>
            <MapPin size={20} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Delivery Address</Text>
          </View>

          {isLoading ? (
            <ActivityIndicator color={colors.primary} />
          ) : addresses.length === 0 && !showAddAddress ? (
            <View style={styles.emptyAddressBox}>
              <Text style={[styles.emptyAddressText, { color: colors.textMuted }]}>
                No saved addresses found.
              </Text>
              <Pressable
                style={[styles.addAddrBtn, { borderColor: colors.primary }]}
                onPress={() => setShowAddAddress(true)}
              >
                <Text style={[styles.addAddrBtnText, { color: colors.primary }]}>+ Add New Address</Text>
              </Pressable>
            </View>
          ) : showAddAddress ? (
            <View style={styles.addressForm}>
              <Pressable
                style={[styles.gpsBtn, { backgroundColor: colors.primaryLight, borderColor: colors.primary }]}
                onPress={handleGPSLocate}
                disabled={isLocating}
              >
                {isLocating ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : (
                  <Text style={[styles.gpsBtnText, { color: colors.primary }]}>📍 Use Current Location (GPS Pin)</Text>
                )}
              </Pressable>

              <TextInput
                style={[styles.input, { backgroundColor: colors.surfaceSecondary, color: colors.text, borderColor: colors.border }]}
                placeholder="Label (e.g. Home, Office)"
                placeholderTextColor={colors.textMuted}
                value={label}
                onChangeText={setLabel}
              />
              <TextInput
                style={[styles.input, { backgroundColor: colors.surfaceSecondary, color: colors.text, borderColor: colors.border }]}
                placeholder="Street Line 1 (House/Apt #, Street)"
                placeholderTextColor={colors.textMuted}
                value={line1}
                onChangeText={setLine1}
              />
              <TextInput
                style={[styles.input, { backgroundColor: colors.surfaceSecondary, color: colors.text, borderColor: colors.border }]}
                placeholder="City"
                placeholderTextColor={colors.textMuted}
                value={city}
                onChangeText={setCity}
              />
              <TextInput
                style={[styles.input, { backgroundColor: colors.surfaceSecondary, color: colors.text, borderColor: colors.border }]}
                placeholder="Region / State"
                placeholderTextColor={colors.textMuted}
                value={region}
                onChangeText={setRegion}
              />
              <TextInput
                style={[styles.input, { backgroundColor: colors.surfaceSecondary, color: colors.text, borderColor: colors.border }]}
                placeholder="Security Guard / Gate Notes (e.g. Gate Code 1234)"
                placeholderTextColor={colors.textMuted}
                value={gateNotes}
                onChangeText={setGateNotes}
              />
              <Pressable
                style={[styles.saveAddrBtn, { backgroundColor: colors.primary }]}
                onPress={handleCreateAddress}
              >
                <Text style={[styles.saveAddrBtnText, { color: mode === 'dark' ? '#121212' : '#FFFFFF' }]}>
                  Save Address
                </Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.addressList}>
              {addresses.map((addr) => {
                const isSelected = selectedAddressId === addr.id;
                return (
                  <Pressable
                    key={addr.id}
                    style={[
                      styles.addressItem,
                      {
                        backgroundColor: isSelected ? colors.primaryLight : colors.surfaceSecondary,
                        borderColor: isSelected ? colors.primary : colors.border,
                      },
                    ]}
                    onPress={() => setSelectedAddressId(addr.id)}
                  >
                    <View style={styles.addressInfo}>
                      <Text style={[styles.addressLabel, { color: colors.text }]}>{addr.label}</Text>
                      <Text style={[styles.addressText, { color: colors.textMuted }]}>
                        {addr.line1}, {addr.city}
                      </Text>
                    </View>
                    {isSelected && <CheckCircle size={20} color={colors.primary} />}
                  </Pressable>
                );
              })}
              <Pressable style={styles.addMoreBtn} onPress={() => setShowAddAddress(true)}>
                <Text style={[styles.addMoreText, { color: colors.primary }]}>+ Add Another Address</Text>
              </Pressable>
            </View>
          )}
        </View>

        {/* Payment Method */}
        <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.sectionHeader}>
            <CreditCard size={20} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Payment Option</Text>
          </View>

          <Pressable
            style={[
              styles.paymentOption,
              {
                backgroundColor: paymentMethod === 'CASH_ON_DELIVERY' ? colors.primaryLight : colors.surfaceSecondary,
                borderColor: paymentMethod === 'CASH_ON_DELIVERY' ? colors.primary : colors.border,
              },
            ]}
            onPress={() => setPaymentMethod('CASH_ON_DELIVERY')}
          >
            <Text style={[styles.paymentText, { color: colors.text }]}>Cash on Delivery (COD)</Text>
            {paymentMethod === 'CASH_ON_DELIVERY' && <CheckCircle size={20} color={colors.primary} />}
          </Pressable>

          <Pressable
            style={[
              styles.paymentOption,
              {
                backgroundColor: paymentMethod === 'CARD' ? colors.primaryLight : colors.surfaceSecondary,
                borderColor: paymentMethod === 'CARD' ? colors.primary : colors.border,
              },
            ]}
            onPress={() => setPaymentMethod('CARD')}
          >
            <Text style={[styles.paymentText, { color: colors.text }]}>Credit / Debit Card</Text>
            {paymentMethod === 'CARD' && <CheckCircle size={20} color={colors.primary} />}
          </Pressable>
        </View>

        {/* Delivery Notes */}
        <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Delivery Notes (Optional)</Text>
          <TextInput
            style={[
              styles.notesInput,
              { backgroundColor: colors.surfaceSecondary, color: colors.text, borderColor: colors.border },
            ]}
            placeholder="e.g. Leave at front door"
            placeholderTextColor={colors.textMuted}
            value={notes}
            onChangeText={setNotes}
            multiline
          />
        </View>
      </ScrollView>

      {/* Place Order Bar */}
      <View style={[styles.footerBar, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
        <Pressable
          style={[
            styles.placeOrderBtn,
            { backgroundColor: colors.primary },
            isSubmitting && { opacity: 0.7 },
          ]}
          onPress={handlePlaceOrder}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color={mode === 'dark' ? '#121212' : '#FFFFFF'} />
          ) : (
            <>
              <Text style={[styles.placeOrderText, { color: mode === 'dark' ? '#121212' : '#FFFFFF' }]}>
                Place Order
              </Text>
              <Text style={[styles.placeOrderPrice, { color: mode === 'dark' ? '#121212' : '#FFFFFF' }]}>
                ${grandTotal.toFixed(2)}
              </Text>
            </>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  scrollContent: {
    padding: 16,
    gap: 16,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  emptyAddressBox: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  emptyAddressText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },
  addAddrBtn: {
    backgroundColor: '#E8F7EF',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  addAddrBtnText: {
    color: '#1A9E5C',
    fontWeight: '600',
    fontSize: 14,
  },
  addressForm: {
    gap: 10,
  },
  input: {
    height: 44,
    borderWidth: 1,
    borderColor: '#EEEEEE',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 14,
    backgroundColor: '#F8F8F8',
  },
  saveAddrBtn: {
    backgroundColor: '#1A9E5C',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveAddrBtnText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  addressList: {
    gap: 8,
  },
  addressItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderWidth: 1,
    borderColor: '#EEEEEE',
    borderRadius: 8,
    backgroundColor: '#F8F8F8',
  },
  selectedAddressItem: {
    borderColor: '#1A9E5C',
    backgroundColor: '#E8F7EF',
  },
  addressInfo: {
    flex: 1,
  },
  addressLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  addressText: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  addMoreBtn: {
    marginTop: 6,
    alignItems: 'center',
  },
  addMoreText: {
    fontSize: 13,
    color: '#1A9E5C',
    fontWeight: '600',
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderWidth: 1,
    borderColor: '#EEEEEE',
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#F8F8F8',
  },
  selectedPaymentOption: {
    borderColor: '#1A9E5C',
    backgroundColor: '#E8F7EF',
  },
  paymentText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  notesInput: {
    height: 60,
    borderWidth: 1,
    borderColor: '#EEEEEE',
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    backgroundColor: '#F8F8F8',
    marginTop: 8,
  },
  footerBar: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  placeOrderBtn: {
    height: 50,
    backgroundColor: '#1A9E5C',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  placeOrderText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  placeOrderPrice: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  gpsBtn: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  gpsBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
