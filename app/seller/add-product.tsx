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
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Package, DollarSign, Hash, FileText, Image as ImageIcon, Calendar, Leaf, Camera, Upload } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { useCategories } from '@/hooks/useCategories';
import { useFarmer } from '@/hooks/useFarmer';
import * as ImagePicker from 'expo-image-picker';

export default function AddProductScreen() {
  const router = useRouter();
  const { categories } = useCategories();
  const { farmer } = useFarmer();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [unit, setUnit] = useState('lb');
  const [imageUrl, setImageUrl] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [availableQuantity, setAvailableQuantity] = useState('');
  const [harvestDate, setHarvestDate] = useState('');
  const [isOrganic, setIsOrganic] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(false);

  const units = ['lb', 'kg', 'oz', 'bunch', 'head', 'bag', 'box', 'each'];

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant camera roll permissions to upload images');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedImage(result.assets[0].uri);
      // In a real app, you would upload this to a storage service
      // For now, we'll use a placeholder URL
      setImageUrl('https://images.pexels.com/photos/1327838/pexels-photo-1327838.jpeg?auto=compress&cs=tinysrgb&w=800');
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant camera permissions to take photos');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedImage(result.assets[0].uri);
      // In a real app, you would upload this to a storage service
      setImageUrl('https://images.pexels.com/photos/1327838/pexels-photo-1327838.jpeg?auto=compress&cs=tinysrgb&w=800');
    }
  };

  const handleAddProduct = async () => {
    if (!name.trim() || !price || (!imageUrl.trim() && !selectedImage)) {
      Alert.alert('Error', 'Please fill in name, price, and add an image');
      return;
    }

    if (!farmer) {
      Alert.alert('Error', 'You must be enrolled as a seller');
      return;
    }

    const priceValue = parseFloat(price);
    if (isNaN(priceValue) || priceValue <= 0) {
      Alert.alert('Error', 'Please enter a valid price');
      return;
    }
    setLoading(true);
    try {
      const finalImageUrl = selectedImage || imageUrl.trim();
      
      const { error } = await supabase
        .from('products')
        .insert({
          farmer_id: farmer.id,
          category_id: selectedCategory || null,
          name: name.trim(),
          description: description.trim() || null,
          price: priceValue,
          unit,
          image_url: finalImageUrl,
          available_quantity: availableQuantity ? parseInt(availableQuantity) : 0,
          harvest_date: harvestDate || null,
          is_organic: isOrganic,
          is_available: true,
        });

      if (error) throw error;

      Alert.alert(
        'Product Added!',
        'Your product has been successfully added to the marketplace.',
        [{ text: 'Continue', onPress: () => router.replace('/seller/dashboard') }]
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

            {/* Product Image */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Product Image *</Text>
              
              {selectedImage ? (
                <View style={styles.imagePreview}>
                  <Image source={{ uri: selectedImage }} style={styles.previewImage} />
                  <TouchableOpacity 
                    style={styles.changeImageButton}
                    onPress={() => setSelectedImage(null)}
                  >
                    <Text style={styles.changeImageText}>Change Image</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.imageUploadContainer}>
                  <TouchableOpacity style={styles.imageUploadButton} onPress={takePhoto}>
                    <Camera size={24} color="#6b7280" strokeWidth={2} />
                    <Text style={styles.imageUploadText}>Take Photo</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity style={styles.imageUploadButton} onPress={pickImage}>
                    <Upload size={24} color="#6b7280" strokeWidth={2} />
                    <Text style={styles.imageUploadText}>Choose from Gallery</Text>
                  </TouchableOpacity>
                </View>
              )}
              
              {/* Fallback URL input */}
              <View style={styles.urlInputWrapper}>
                <Text style={styles.urlLabel}>Or enter image URL:</Text>
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
  imagePreview: {
    alignItems: 'center',
    marginBottom: 16,
  },
  previewImage: {
    width: 200,
    height: 150,
    borderRadius: 12,
    marginBottom: 12,
  },
  changeImageButton: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  changeImageText: {
    color: '#6b7280',
    fontSize: 14,
    fontWeight: '600',
  },
  imageUploadContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  imageUploadButton: {
    flex: 1,
    backgroundColor: '#f9fafb',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingVertical: 24,
    alignItems: 'center',
    gap: 8,
  },
  imageUploadText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '600',
  },
  urlInputWrapper: {
    marginTop: 16,
  },
  urlLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
});