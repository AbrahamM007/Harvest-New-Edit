import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Settings, Heart, ShoppingBag, MapPin, Bell, CreditCard, CircleHelp as HelpCircle, LogOut, ChevronRight, Star, Leaf, Edit3, Store } from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useFarmer } from '@/hooks/useFarmer';

const menuItems = [
  { icon: ShoppingBag, label: 'Order History', color: '#16a34a', route: '/orders' },
  { icon: Heart, label: 'Favorites', color: '#dc2626' },
  { icon: MapPin, label: 'Delivery Address', color: '#2563eb' },
  { icon: CreditCard, label: 'Payment Methods', color: '#7c3aed' },
  { icon: Bell, label: 'Notifications', color: '#ea580c' },
  { icon: Settings, label: 'Settings', color: '#6b7280' },
  { icon: HelpCircle, label: 'Help & Support', color: '#0891b2' },
];

export default function ProfileScreen() {
  const router = useRouter();
  const { signOut } = useAuth();
  const { profile } = useProfile();
  const { farmer } = useFarmer();

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive',
          onPress: async () => {
            const { error } = await signOut();
            if (error) {
              Alert.alert('Error', 'Failed to sign out');
            } else {
              router.replace('/auth/login');
            }
          }
        }
      ]
    );
  };

  const handleMenuPress = (item: any) => {
    if (item.route) {
      router.push(item.route);
    } else {
      // For items without routes, show coming soon
      Alert.alert('Coming Soon', 'This feature will be available in a future update');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <TouchableOpacity onPress={() => router.push('/profile/edit')}>
            <Image
              source={{ 
                uri: profile?.avatar_url || 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=200' 
              }}
              style={styles.profileImage}
            />
            <View style={styles.editIcon}>
              <Edit3 size={16} color="#ffffff" strokeWidth={2} />
            </View>
          </TouchableOpacity>
          <Text style={styles.userName}>{profile?.full_name || 'User'}</Text>
          <Text style={styles.userEmail}>{profile?.email}</Text>
          
          <View style={styles.badgeContainer}>
            {farmer && (
              <View style={styles.badge}>
                <Store size={16} color="#2563eb" strokeWidth={2} />
                <Text style={[styles.badgeText, { color: '#2563eb' }]}>
                  {farmer.verified ? 'Verified Seller' : 'Pending Seller'}
                </Text>
              </View>
            )}
            <View style={styles.badge}>
              <Leaf size={16} color="#16a34a" strokeWidth={2} />
              <Text style={styles.badgeText}>Eco Supporter</Text>
            </View>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>23</Text>
            <Text style={styles.statLabel}>Orders</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>4.9</Text>
            <View style={styles.ratingContainer}>
              <Star size={12} color="#fbbf24" fill="#fbbf24" strokeWidth={2} />
              <Text style={styles.statLabel}>Rating</Text>
            </View>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>$127</Text>
            <Text style={styles.statLabel}>Saved</Text>
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          {menuItems.map((item, index) => (
            <TouchableOpacity key={index} style={styles.menuItem} onPress={() => handleMenuPress(item)}>
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIcon, { backgroundColor: item.color + '20' }]}>
                  <item.icon size={20} color={item.color} strokeWidth={2} />
                </View>
                <Text style={styles.menuLabel}>{item.label}</Text>
              </View>
              <ChevronRight size={20} color="#9ca3af" strokeWidth={2} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Seller Section */}
        {farmer ? (
          <View style={styles.sellerSection}>
            <TouchableOpacity 
              style={styles.sellerCard}
              onPress={() => router.push('/seller/dashboard')}
            >
              <View style={styles.sellerContent}>
                <Text style={styles.sellerTitle}>Seller Dashboard</Text>
                <Text style={styles.sellerSubtitle}>
                  Manage your products and view sales
                </Text>
              </View>
              <ChevronRight size={20} color="#9ca3af" strokeWidth={2} />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.sellerSection}>
            <TouchableOpacity 
              style={styles.sellerCard}
              onPress={() => router.push('/seller/enroll')}
            >
              <View style={styles.sellerContent}>
                <Text style={styles.sellerTitle}>Become a Local Seller</Text>
                <Text style={styles.sellerSubtitle}>
                  Share your homegrown produce with the community
                </Text>
              </View>
              <Image
                source={{ uri: 'https://images.pexels.com/photos/1459339/pexels-photo-1459339.jpeg?auto=compress&cs=tinysrgb&w=200' }}
                style={styles.sellerImage}
              />
            </TouchableOpacity>
          </View>
        )}

        {/* Logout */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleSignOut}>
          <LogOut size={20} color="#ef4444" strokeWidth={2} />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  profileHeader: {
    backgroundColor: '#ffffff',
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 16,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 16,
  },
  badgeContainer: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dcfce7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  badgeText: {
    fontSize: 12,
    color: '#16a34a',
    fontWeight: '600',
  },
  editIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#16a34a',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    marginTop: 8,
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: '#e5e7eb',
  },
  menuContainer: {
    backgroundColor: '#ffffff',
    marginTop: 8,
    paddingVertical: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  menuLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
  sellerSection: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  sellerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  sellerContent: {
    flex: 1,
  },
  sellerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  sellerSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  sellerImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    marginLeft: 16,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginTop: 24,
    marginBottom: 32,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    gap: 8,
  },
  logoutText: {
    fontSize: 16,
    color: '#ef4444',
    fontWeight: '600',
  },
});