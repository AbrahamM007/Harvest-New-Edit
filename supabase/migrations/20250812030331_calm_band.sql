/*
  # Auto-approve vendors and location improvements

  1. Changes
    - Set all farmers to verified by default
    - Add location fields for distance calculation
    - Update farmer verification to be automatic

  2. New Features
    - Location-based product sorting
    - Automatic vendor approval
*/

-- Update farmers table to auto-approve new vendors
ALTER TABLE farmers ALTER COLUMN verified SET DEFAULT true;

-- Update existing farmers to be verified
UPDATE farmers SET verified = true WHERE verified = false;

-- Add location fields to farmers for distance calculation
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'farmers' AND column_name = 'latitude'
  ) THEN
    ALTER TABLE farmers ADD COLUMN latitude decimal(10, 8);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'farmers' AND column_name = 'longitude'
  ) THEN
    ALTER TABLE farmers ADD COLUMN longitude decimal(11, 8);
  END IF;
END $$;

-- Add location fields to profiles for user location
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'latitude'
  ) THEN
    ALTER TABLE profiles ADD COLUMN latitude decimal(10, 8);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'longitude'
  ) THEN
    ALTER TABLE profiles ADD COLUMN longitude decimal(11, 8);
  END IF;
END $$;

-- Update sample farmers with realistic coordinates (San Francisco Bay Area)
UPDATE farmers SET 
  latitude = 37.7749 + (random() - 0.5) * 0.1,
  longitude = -122.4194 + (random() - 0.5) * 0.1
WHERE latitude IS NULL;

-- Create function to calculate distance between two points
CREATE OR REPLACE FUNCTION calculate_distance(
  lat1 decimal, lon1 decimal, 
  lat2 decimal, lon2 decimal
) RETURNS decimal AS $$
DECLARE
  earth_radius decimal := 3959; -- miles
  dlat decimal;
  dlon decimal;
  a decimal;
  c decimal;
BEGIN
  dlat := radians(lat2 - lat1);
  dlon := radians(lon2 - lon1);
  a := sin(dlat/2) * sin(dlat/2) + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon/2) * sin(dlon/2);
  c := 2 * atan2(sqrt(a), sqrt(1-a));
  RETURN earth_radius * c;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Create view for products with distance
CREATE OR REPLACE VIEW products_with_distance AS
SELECT 
  p.*,
  f.farm_name,
  f.latitude as farmer_lat,
  f.longitude as farmer_lon,
  CASE 
    WHEN auth.uid() IS NOT NULL THEN
      COALESCE(
        calculate_distance(
          (SELECT latitude FROM profiles WHERE id = auth.uid()),
          (SELECT longitude FROM profiles WHERE id = auth.uid()),
          f.latitude,
          f.longitude
        ),
        999 -- Default distance if user location not set
      )
    ELSE 999
  END as distance_miles
FROM products p
JOIN farmers f ON p.farmer_id = f.id
WHERE p.is_available = true;

-- Grant access to the view
GRANT SELECT ON products_with_distance TO authenticated, anon;