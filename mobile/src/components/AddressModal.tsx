import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { MapPin, Check, Plus, X, ArrowLeft } from 'lucide-react-native';
import { useThemeStore } from '../theme/themeStore';
import { api } from '../services/api';

export interface Address {
  id: string;
  label: string;
  street: string;
  city: string;
  isDefault?: boolean;
}

const DEFAULT_ADDRESSES: Address[] = [
  { id: '1', label: 'Home', street: '123 Main St, Apt 4B', city: 'New York, NY', isDefault: true },
  { id: '2', label: 'Work', street: '456 Tech Boulevard, Suite 200', city: 'New York, NY' },
  { id: '3', label: "Parents' House", street: '789 Park Avenue', city: 'Brooklyn, NY' },
];

interface AddressModalProps {
  visible: boolean;
  onClose: () => void;
  selectedAddress: Address;
  onSelectAddress: (addr: Address) => void;
}

export const AddressModal: React.FC<AddressModalProps> = ({
  visible,
  onClose,
  selectedAddress,
  onSelectAddress,
}) => {
  const { colors, mode } = useThemeStore();
  const [addresses, setAddresses] = useState<Address[]>(DEFAULT_ADDRESSES);
  
  // Add address form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [label, setLabel] = useState('Home');
  const [line1, setLine1] = useState('');
  const [city, setCity] = useState('');
  const [region, setRegion] = useState('');
  const [gateNotes, setGateNotes] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (visible) {
      fetchAddresses();
    } else {
      setShowAddForm(false);
    }
  }, [visible]);

  const fetchAddresses = async () => {
    try {
      const response = await api.get('/users/addresses');
      if (response.data?.success && Array.isArray(response.data.data) && response.data.data.length > 0) {
        const fetchedList: Address[] = response.data.data.map((item: any) => ({
          id: item.id,
          label: item.label || 'Address',
          street: item.line1 || item.street || '',
          city: `${item.city || ''}, ${item.region || ''}`.trim().replace(/^,\s*|\s*,\s*$/g, ''),
          isDefault: item.isDefault,
        }));
        setAddresses(fetchedList);
      } else {
        setShowAddForm(true);
      }
    } catch (e) {
      console.warn('Using default local addresses', e);
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

  const handleSaveAddress = async () => {
    if (!line1.trim() || !city.trim()) {
      Alert.alert('Required Fields', 'Please enter your street address and city.');
      return;
    }

    setIsSubmitting(true);
    const streetText = gateNotes ? `${line1.trim()} (Gate Notes: ${gateNotes.trim()})` : line1.trim();
    const newAddressObj: Address = {
      id: Date.now().toString(),
      label,
      street: streetText,
      city: `${city.trim()}${region.trim() ? `, ${region.trim()}` : ''}`,
    };

    try {
      const response = await api.post('/users/addresses', {
        label,
        line1: streetText,
        city: city.trim(),
        region: region.trim() || 'NY',
        gateNotes,
        isDefault: addresses.length === 0,
      });

      if (response.data?.success && response.data.data?.id) {
        newAddressObj.id = response.data.data.id;
      }
    } catch (e) {
      console.warn('API save failed, using local address', e);
    } finally {
      setIsSubmitting(false);
      setAddresses((prev) => [newAddressObj, ...prev]);
      onSelectAddress(newAddressObj);
      setShowAddForm(false);
      setLine1('');
      setCity('');
      setRegion('');
      setGateNotes('');
      onClose();
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable
          style={[
            styles.modalContent,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <View style={styles.headerLeft}>
              {showAddForm ? (
                <Pressable onPress={() => setShowAddForm(false)} hitSlop={8}>
                  <ArrowLeft size={20} color={colors.text} />
                </Pressable>
              ) : (
                <MapPin size={20} color={colors.primary} />
              )}
              <Text style={[styles.headerTitle, { color: colors.text }]}>
                {showAddForm ? 'Add New Delivery Address' : 'Select Delivery Address'}
              </Text>
            </View>
            <Pressable onPress={onClose} hitSlop={8}>
              <X size={20} color={colors.textMuted} />
            </Pressable>
          </View>

          {showAddForm ? (
            /* Add New Address Form */
            <ScrollView style={styles.formContainer} keyboardShouldPersistTaps="handled">
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

              <Text style={[styles.fieldLabel, { color: colors.text }]}>Address Label</Text>
              <View style={styles.labelPillsRow}>
                {['Home', 'Work', 'Other'].map((lbl) => (
                  <Pressable
                    key={lbl}
                    onPress={() => setLabel(lbl)}
                    style={[
                      styles.labelPill,
                      {
                        backgroundColor: label === lbl ? colors.primary : colors.surfaceSecondary,
                        borderColor: label === lbl ? colors.primary : colors.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.labelPillText,
                        { color: label === lbl ? (mode === 'dark' ? '#121212' : '#FFFFFF') : colors.text },
                      ]}
                    >
                      {lbl}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <Text style={[styles.fieldLabel, { color: colors.text, marginTop: 14 }]}>
                Street Address *
              </Text>
              <TextInput
                value={line1}
                onChangeText={setLine1}
                placeholder="123 Main St, Apt 4B"
                placeholderTextColor={colors.textMuted}
                style={[
                  styles.input,
                  { backgroundColor: colors.surfaceSecondary, color: colors.text, borderColor: colors.border },
                ]}
              />

              <View style={styles.rowInputs}>
                <View style={styles.flex1}>
                  <Text style={[styles.fieldLabel, { color: colors.text, marginTop: 12 }]}>City *</Text>
                  <TextInput
                    value={city}
                    onChangeText={setCity}
                    placeholder="New York"
                    placeholderTextColor={colors.textMuted}
                    style={[
                      styles.input,
                      { backgroundColor: colors.surfaceSecondary, color: colors.text, borderColor: colors.border },
                    ]}
                  />
                </View>
                <View style={[styles.flex1, { marginLeft: 10 }]}>
                  <Text style={[styles.fieldLabel, { color: colors.text, marginTop: 12 }]}>State / Region</Text>
                  <TextInput
                    value={region}
                    onChangeText={setRegion}
                    placeholder="NY"
                    placeholderTextColor={colors.textMuted}
                    style={[
                      styles.input,
                      { backgroundColor: colors.surfaceSecondary, color: colors.text, borderColor: colors.border },
                    ]}
                  />
                </View>
              </View>

              <Text style={[styles.fieldLabel, { color: colors.text, marginTop: 12 }]}>
                Security Guard / Gatehouse Notes
              </Text>
              <TextInput
                value={gateNotes}
                onChangeText={setGateNotes}
                placeholder="e.g. Gate Code 1234, Call on arrival"
                placeholderTextColor={colors.textMuted}
                style={[
                  styles.input,
                  { backgroundColor: colors.surfaceSecondary, color: colors.text, borderColor: colors.border },
                ]}
              />

              <Pressable
                style={[styles.saveBtn, { backgroundColor: colors.primary }]}
                onPress={handleSaveAddress}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color={mode === 'dark' ? '#121212' : '#FFFFFF'} />
                ) : (
                  <Text style={[styles.saveBtnText, { color: mode === 'dark' ? '#121212' : '#FFFFFF' }]}>
                    Save & Deliver Here
                  </Text>
                )}
              </Pressable>

              <Pressable style={styles.cancelBtn} onPress={() => setShowAddForm(false)}>
                <Text style={[styles.cancelBtnText, { color: colors.textMuted }]}>Cancel</Text>
              </Pressable>
            </ScrollView>
          ) : (
            /* Address List View */
            <>
              <ScrollView style={styles.list}>
                {addresses.map((item) => {
                  const isSelected = item.id === selectedAddress.id;
                  return (
                    <Pressable
                      key={item.id}
                      style={[
                        styles.addressCard,
                        {
                          backgroundColor: isSelected ? colors.primaryLight : colors.surfaceSecondary,
                          borderColor: isSelected ? colors.primary : colors.border,
                        },
                      ]}
                      onPress={() => {
                        onSelectAddress(item);
                        onClose();
                      }}
                    >
                      <View style={styles.cardLeft}>
                        <Text style={[styles.addressLabel, { color: colors.text }]}>
                          {item.label}
                        </Text>
                        <Text style={[styles.addressStreet, { color: colors.textMuted }]}>
                          {item.street}
                        </Text>
                        <Text style={[styles.addressCity, { color: colors.textMuted }]}>
                          {item.city}
                        </Text>
                      </View>
                      {isSelected && <Check size={20} color={colors.primary} strokeWidth={2.5} />}
                    </Pressable>
                  );
                })}
              </ScrollView>

              {/* Add New Address Button */}
              <Pressable
                style={[styles.addNewBtn, { borderColor: colors.primary }]}
                onPress={() => setShowAddForm(true)}
              >
                <Plus size={18} color={colors.primary} />
                <Text style={[styles.addNewText, { color: colors.primary }]}>
                  Add New Delivery Address
                </Text>
              </Pressable>
            </>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderWidth: 1,
    padding: 20,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  list: {
    marginVertical: 14,
  },
  addressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 10,
  },
  cardLeft: {
    flex: 1,
    marginRight: 10,
  },
  addressLabel: {
    fontSize: 15,
    fontWeight: '700',
  },
  addressStreet: {
    fontSize: 13,
    marginTop: 2,
  },
  addressCity: {
    fontSize: 12,
    marginTop: 1,
  },
  addNewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    gap: 8,
    marginTop: 4,
  },
  addNewText: {
    fontSize: 14,
    fontWeight: '700',
  },
  formContainer: {
    marginVertical: 14,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  labelPillsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  labelPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
  },
  labelPillText: {
    fontSize: 13,
    fontWeight: '600',
  },
  input: {
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 14,
  },
  rowInputs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  flex1: {
    flex: 1,
  },
  saveBtn: {
    height: 46,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  saveBtnText: {
    fontSize: 15,
    fontWeight: '700',
  },
  cancelBtn: {
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 6,
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
  gpsBtn: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  gpsBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
