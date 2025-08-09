import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Package, DollarSign, Hash, FileText, Image as ImageIcon, Calendar, Leaf } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { useCategories } from '@/hooks/useCategories';
import { useFarmer } from '@/hooks/useFarmer';

export default function AddProductScreen() {
  const router = useRouter();
  const { categories } = useCategories();
  const { farmer } = useFarmer();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [unit, setUnit] = useState('lb');
  const [imageUrl, setImageUrl] = useState('');
  const [availableQuantity, setAvailableQuantity] = useState('');
  const [harvestDate, setHarvestDate] = useState('');
  const [isOrganic, setIsOrganic] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(false);

  const units = ['lb', 'kg', 'oz', 'bunch', 'head', 'bag', 'box', 'each'];

  const handleAddProduct = async () => {
    if (!name.trim() || !price || !imageUrl.trim()) {
      Alert.alert('Error', 'Please fill in name, price, and image URL');
      return;
    }

    if (!farmer) {
      Alert.alert('Error', 'You must be enrolled as a seller');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('products')
        .insert({
          farmer_id: farmer.id,
          category_id: selectedCategory || null,
          name: name.trim(),
          description: description.trim() || null,
          price: parseFloat(price),
          unit,
          image_url: imageUrl.trim(),
          available_quantity: availableQuantity ? parseInt(availableQuantity) : 0,
          harvest_date: harvestDate || null,
          is_organic: isOrganic,
          is_available: true,
        });

      if (error) throw error;

      Alert.alert(
        'Product Added!',
        'Your product has been successfully added to the marketplace.',
        [{ text: 'Continue', onPress: () => router.back() }]
      );
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to add product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color="#111827" strokeWidth={2} />
          </TouchableOpacity>
          <Text style={styles.title}>Add Product</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.form}>
            {/* Product Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Product Name *</Text>
              <View style={styles.inputWrapper}>
                <Package size={20} color="#6b7280" strokeWidth={2} />
                <TextInput
                  style={styles.input}
                  placeholder="e.g., Organic Tomatoes"
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                  placeholderTextColor="#9ca3af"
                />
              </View>
            </View>

            {/* Description */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Description</Text>
              <View style={styles.textAreaWrapper}>
                <FileText size={20} color="#6b7280" strokeWidth={2} />
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Describe your product, growing methods, etc..."
                  value={description}
                  onChangeText={setDescription}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  placeholderTextColor="#9ca3af"
                />
              </View>
            </View>

            {/* Price and Unit */}
            <View style={styles.row}>
              <View style={[styles.inputGroup, styles.flex1]}>
                <Text style={styles.label}>Price *</Text>
                <View style={styles.inputWrapper}>
                  <DollarSign size={20} color="#6b7280" strokeWidth={2} />
                  <TextInput
                    style={styles.input}
                    placeholder="0.00"
                    value={price}
                    onChangeText={setPrice}
                    keyboardType="decimal-pad"
                    placeholderTextColor="#9ca3af"
                  />
                </View>
              </View>

              <View style={[styles.inputGroup, styles.flex1]}>
                <Text style={styles.label}>Unit</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.unitSelector}>
                  {units.map((unitOption) => (
                    <TouchableOpacity
                      key={unitOption}
                      style={[
                        styles.unitButton,
                        unit === unitOption && styles.unitButtonActive
                      ]}
                      onPress={() => setUnit(unitOption)}
                    >
                      <Text style={[
                        styles.unitButtonText,
                        unit === unitOption && styles.unitButtonTextActive
                      ]}>
                        {unitOption}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>

            {/* Image URL */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Image URL *</Text>
              <View style={styles.inputWrapper}>
                <ImageIcon size={20} color="#6b7280" strokeWidth={2} />
                <TextInput
                  style={styles.input}
                  placeholder="https://example.com/image.jpg"
                  value={imageUrl}
                  onChangeText={setImageUrl}
                  autoCapitalize="none"
                  placeholderTextColor="#9ca3af"
                />
              </View>
            </View>

            {/* Category */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Category</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categorySelector}>
                <TouchableOpacity
                  style={[
                    styles.categoryButton,
                    !selectedCategory && styles.categoryButtonActive
                  ]}
                  onPress={() => setSelectedCategory('')}
                >
                  <Text style={[
                    styles.categoryButtonText,
                    !selectedCategory && styles.categoryButtonTextActive
                  ]}>
                    None
                  </Text>
                </TouchableOpacity>
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.categoryButton,
                      selectedCategory === category.id && styles.categoryButtonActive
                    ]}
                    onPress={() => setSelectedCategory(category.id)}
                  >
                    <Text style={styles.categoryEmoji}>{category.icon}</Text>
                    <Text style={[
                      styles.categoryButtonText,
                      selectedCategory === category.id && styles.categoryButtonTextActive
                    ]}>
                      {category.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Quantity and Harvest Date */}
            <View style={styles.row}>
              <View style={[styles.inputGroup, styles.flex1]}>
                <Text style={styles.label}>Available Quantity</Text>
                <View style={styles.inputWrapper}>
                  <Hash size={20} color="#6b7280" strokeWidth={2} />
                  <TextInput
                    style={styles.input}
                    placeholder="0"
                    value={availableQuantity}
                    onChangeText={setAvailableQuantity}
                    keyboardType="number-pad"
                    placeholderTextColor="#9ca3af"
                  />
                </View>
              </View>

              <View style={[styles.inputGroup, styles.flex1]}>
                <Text style={styles.label}>Harvest Date</Text>
                <View style={styles.inputWrapper}>
                  <Calendar size={20} color="#6b7280" strokeWidth={2} />
                  <TextInput
                    style={styles.input}
                    placeholder="YYYY-MM-DD"
                    value={harvestDate}
                    onChangeText={setHarvestDate}
                    placeholderTextColor="#9ca3af"
                  />
                </View>
              </View>
            </View>

            {/* Organic Toggle */}
            <View style={styles.toggleGroup}>
              <View style={styles.toggleInfo}>
                <Leaf size={20} color="#16a34a" strokeWidth={2} />
                <View style={styles.toggleText}>
                  <Text style={styles.toggleLabel}>Organic Product</Text>
                  <Text style={styles.toggleDescription}>
                    Mark if this product is certified organic
                  </Text>
                </View>
              </View>
              <Switch
                value={isOrganic}
                onValueChange={setIsOrganic}
                trackColor={{ false: '#e5e7eb', true: '#dcfce7' }}
                thumbColor={isOrganic ? '#16a34a' : '#f3f4f6'}
              />
            </View>

            <TouchableOpacity 
              style={[styles.addButton, loading && styles.addButtonDisabled]}
              onPress={handleAddProduct}
              disabled={loading}
            >
              <Text style={styles.addButtonText}>
                {loading ? 'Adding Product...' : 'Add Product'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  form: {
    backgroundColor: '#ffffff',
    margin: 16,
    borderRadius: 16,
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    gap: 12,
  },
  textAreaWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    gap: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
  },
  textArea: {
    minHeight: 80,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  flex1: {
    flex: 1,
  },
  unitSelector: {
    flexDirection: 'row',
  },
  unitButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    marginRight: 8,
  },
  unitButtonActive: {
    backgroundColor: '#16a34a',
  },
  unitButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  unitButtonTextActive: {
    color: '#ffffff',
  },
  categorySelector: {
    flexDirection: 'row',
    paddingVertical: 8,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    marginRight: 8,
    gap: 6,
  },
  categoryButtonActive: {
    backgroundColor: '#16a34a',
  },
  categoryEmoji: {
    fontSize: 16,
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  categoryButtonTextActive: {
    color: '#ffffff',
  },
  toggleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    marginBottom: 24,
  },
  toggleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  toggleText: {
    flex: 1,
  },
  toggleLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  toggleDescription: {
    fontSize: 14,
    color: '#6b7280',
  },
  addButton: {
    backgroundColor: '#16a34a',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  addButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
  },
});