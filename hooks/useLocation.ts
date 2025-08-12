import { useEffect, useState } from 'react';
import * as Location from 'expo-location';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';

interface LocationData {
  latitude: number;
  longitude: number;
}

export function useLocation() {
  const { user } = useAuth();
  const [location, setLocation] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Location permission denied');
        setLoading(false);
        return false;
      }
      return true;
    } catch (err) {
      setError('Failed to request location permission');
      setLoading(false);
      return false;
    }
  };

  const getCurrentLocation = async () => {
    try {
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) return;

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const locationData = {
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      };

      setLocation(locationData);

      // Save to user profile
      if (user) {
        await supabase
          .from('profiles')
          .update({
            latitude: locationData.latitude,
            longitude: locationData.longitude,
          })
          .eq('id', user.id);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get location');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      getCurrentLocation();
    } else {
      setLoading(false);
    }
  }, [user]);

  return { 
    location, 
    loading, 
    error, 
    requestLocation: getCurrentLocation 
  };
}