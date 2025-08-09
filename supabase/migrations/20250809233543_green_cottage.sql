/*
  # Add sample data for testing

  1. Sample Categories
    - Vegetables, Fruits, Herbs, Dairy, Grains
  2. Sample Farmers
    - Multiple verified farmers with different specialties
  3. Sample Products
    - Variety of fresh produce with realistic pricing
  4. Security
    - All data respects existing RLS policies
*/

-- Insert sample categories
INSERT INTO categories (name, icon, color) VALUES
  ('Vegetables', '🥕', '#16a34a'),
  ('Fruits', '🍎', '#dc2626'),
  ('Herbs', '🌿', '#059669'),
  ('Dairy', '🥛', '#2563eb'),
  ('Grains', '🌾', '#d97706')
ON CONFLICT (name) DO NOTHING;

-- Insert sample farmers (these will be created without user_id for demo purposes)
INSERT INTO farmers (farm_name, description, address, phone, verified) VALUES
  ('Green Valley Farm', 'Family-owned organic farm specializing in seasonal vegetables and herbs', '123 Farm Road, Green Valley', '(555) 123-4567', true),
  ('Sunrise Orchards', 'Premium fruit orchard with over 50 years of experience', '456 Orchard Lane, Hillside', '(555) 234-5678', true),
  ('Heritage Dairy', 'Small-batch artisanal dairy products from grass-fed cows', '789 Meadow Drive, Countryside', '(555) 345-6789', true),
  ('Mountain View Gardens', 'Sustainable farming practices with focus on heirloom varieties', '321 Mountain Road, Vista Heights', '(555) 456-7890', true),
  ('Coastal Herbs Co.', 'Specialty herb farm with year-round greenhouse production', '654 Coastal Highway, Seaside', '(555) 567-8901', true)
ON CONFLICT DO NOTHING;

-- Insert sample products
DO $$
DECLARE
  vegetable_cat_id uuid;
  fruit_cat_id uuid;
  herb_cat_id uuid;
  dairy_cat_id uuid;
  grain_cat_id uuid;
  green_valley_id uuid;
  sunrise_id uuid;
  heritage_id uuid;
  mountain_view_id uuid;
  coastal_herbs_id uuid;
BEGIN
  -- Get category IDs
  SELECT id INTO vegetable_cat_id FROM categories WHERE name = 'Vegetables';
  SELECT id INTO fruit_cat_id FROM categories WHERE name = 'Fruits';
  SELECT id INTO herb_cat_id FROM categories WHERE name = 'Herbs';
  SELECT id INTO dairy_cat_id FROM categories WHERE name = 'Dairy';
  SELECT id INTO grain_cat_id FROM categories WHERE name = 'Grains';

  -- Get farmer IDs
  SELECT id INTO green_valley_id FROM farmers WHERE farm_name = 'Green Valley Farm';
  SELECT id INTO sunrise_id FROM farmers WHERE farm_name = 'Sunrise Orchards';
  SELECT id INTO heritage_id FROM farmers WHERE farm_name = 'Heritage Dairy';
  SELECT id INTO mountain_view_id FROM farmers WHERE farm_name = 'Mountain View Gardens';
  SELECT id INTO coastal_herbs_id FROM farmers WHERE farm_name = 'Coastal Herbs Co.';

  -- Insert sample products
  INSERT INTO products (farmer_id, category_id, name, description, price, unit, image_url, available_quantity, harvest_date, is_organic, is_available) VALUES
    -- Green Valley Farm products
    (green_valley_id, vegetable_cat_id, 'Organic Tomatoes', 'Vine-ripened heirloom tomatoes, perfect for salads and cooking', 4.99, 'lb', 'https://images.pexels.com/photos/1327838/pexels-photo-1327838.jpeg?auto=compress&cs=tinysrgb&w=800', 50, CURRENT_DATE - INTERVAL '1 day', true, true),
    (green_valley_id, vegetable_cat_id, 'Fresh Lettuce', 'Crisp butter lettuce grown in rich soil', 2.49, 'head', 'https://images.pexels.com/photos/1656663/pexels-photo-1656663.jpeg?auto=compress&cs=tinysrgb&w=800', 30, CURRENT_DATE, true, true),
    (green_valley_id, vegetable_cat_id, 'Rainbow Carrots', 'Colorful heirloom carrots in purple, orange, and yellow', 3.99, 'bunch', 'https://images.pexels.com/photos/143133/pexels-photo-143133.jpeg?auto=compress&cs=tinysrgb&w=800', 25, CURRENT_DATE - INTERVAL '2 days', true, true),
    
    -- Sunrise Orchards products
    (sunrise_id, fruit_cat_id, 'Honeycrisp Apples', 'Sweet and crispy apples perfect for snacking', 5.99, 'lb', 'https://images.pexels.com/photos/102104/pexels-photo-102104.jpeg?auto=compress&cs=tinysrgb&w=800', 100, CURRENT_DATE - INTERVAL '3 days', false, true),
    (sunrise_id, fruit_cat_id, 'Fresh Strawberries', 'Sweet, juicy strawberries picked at peak ripeness', 6.99, 'pint', 'https://images.pexels.com/photos/89778/strawberries-frisch-ripe-sweet-89778.jpeg?auto=compress&cs=tinysrgb&w=800', 40, CURRENT_DATE, false, true),
    (sunrise_id, fruit_cat_id, 'Organic Blueberries', 'Antioxidant-rich organic blueberries', 8.99, 'pint', 'https://images.pexels.com/photos/357573/pexels-photo-357573.jpeg?auto=compress&cs=tinysrgb&w=800', 35, CURRENT_DATE - INTERVAL '1 day', true, true),
    
    -- Heritage Dairy products
    (heritage_id, dairy_cat_id, 'Farm Fresh Milk', 'Whole milk from grass-fed cows, non-homogenized', 4.50, 'quart', 'https://images.pexels.com/photos/236010/pexels-photo-236010.jpeg?auto=compress&cs=tinysrgb&w=800', 20, CURRENT_DATE, false, true),
    (heritage_id, dairy_cat_id, 'Artisan Cheese', 'Handcrafted aged cheddar with rich flavor', 12.99, 'lb', 'https://images.pexels.com/photos/773253/pexels-photo-773253.jpeg?auto=compress&cs=tinysrgb&w=800', 15, NULL, false, true),
    
    -- Mountain View Gardens products
    (mountain_view_id, vegetable_cat_id, 'Purple Eggplant', 'Glossy purple eggplants perfect for grilling', 3.49, 'lb', 'https://images.pexels.com/photos/321551/pexels-photo-321551.jpeg?auto=compress&cs=tinysrgb&w=800', 20, CURRENT_DATE - INTERVAL '1 day', true, true),
    (mountain_view_id, vegetable_cat_id, 'Bell Peppers', 'Colorful mix of red, yellow, and green bell peppers', 4.99, 'lb', 'https://images.pexels.com/photos/594137/pexels-photo-594137.jpeg?auto=compress&cs=tinysrgb&w=800', 45, CURRENT_DATE, true, true),
    
    -- Coastal Herbs Co. products
    (coastal_herbs_id, herb_cat_id, 'Fresh Basil', 'Aromatic sweet basil perfect for cooking', 2.99, 'bunch', 'https://images.pexels.com/photos/4198021/pexels-photo-4198021.jpeg?auto=compress&cs=tinysrgb&w=800', 60, CURRENT_DATE, true, true),
    (coastal_herbs_id, herb_cat_id, 'Organic Rosemary', 'Fragrant rosemary sprigs for seasoning', 3.49, 'bunch', 'https://images.pexels.com/photos/4198017/pexels-photo-4198017.jpeg?auto=compress&cs=tinysrgb&w=800', 40, CURRENT_DATE, true, true);

END $$;