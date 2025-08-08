/*
  # Add Sample Data for Harvest App

  1. Sample Farmers
    - Creates demo farmer profiles with realistic farm information
    
  2. Sample Products
    - Adds variety of fresh produce with realistic pricing
    - Links products to farmers and categories
    - Includes organic and conventional options
    
  3. Sample Reviews
    - Adds realistic product reviews to demonstrate rating system
*/

-- Insert sample farmers (these will be linked to actual user accounts when users sign up as farmers)
INSERT INTO farmers (id, farm_name, description, address, phone, verified) VALUES
  (
    gen_random_uuid(),
    'Sarah''s Garden',
    'Family-owned organic farm specializing in heirloom vegetables and herbs. We''ve been serving the community for over 15 years.',
    '123 Farm Road, Green Valley',
    '(555) 123-4567',
    true
  ),
  (
    gen_random_uuid(),
    'Green Valley Farm',
    'Sustainable farming practices with a focus on leafy greens and seasonal vegetables.',
    '456 Valley Lane, Countryside',
    '(555) 234-5678',
    true
  ),
  (
    gen_random_uuid(),
    'Happy Hens Farm',
    'Free-range chickens and fresh eggs from pasture-raised hens. Also growing organic feed on-site.',
    '789 Meadow Drive, Farmland',
    '(555) 345-6789',
    true
  ),
  (
    gen_random_uuid(),
    'Berry Patch',
    'Seasonal berry farm with strawberries, blueberries, and raspberries. Pick-your-own available.',
    '321 Berry Lane, Hillside',
    '(555) 456-7890',
    true
  ),
  (
    gen_random_uuid(),
    'Herb Heaven',
    'Specialty herb farm growing culinary and medicinal herbs using traditional methods.',
    '654 Herb Street, Garden District',
    '(555) 567-8901',
    true
  )
ON CONFLICT DO NOTHING;

-- Insert sample products
DO $$
DECLARE
  sarahs_farm_id uuid;
  green_valley_id uuid;
  happy_hens_id uuid;
  berry_patch_id uuid;
  herb_heaven_id uuid;
  vegetables_cat_id uuid;
  fruits_cat_id uuid;
  herbs_cat_id uuid;
  dairy_cat_id uuid;
BEGIN
  -- Get farmer IDs
  SELECT id INTO sarahs_farm_id FROM farmers WHERE farm_name = 'Sarah''s Garden' LIMIT 1;
  SELECT id INTO green_valley_id FROM farmers WHERE farm_name = 'Green Valley Farm' LIMIT 1;
  SELECT id INTO happy_hens_id FROM farmers WHERE farm_name = 'Happy Hens Farm' LIMIT 1;
  SELECT id INTO berry_patch_id FROM farmers WHERE farm_name = 'Berry Patch' LIMIT 1;
  SELECT id INTO herb_heaven_id FROM farmers WHERE farm_name = 'Herb Heaven' LIMIT 1;
  
  -- Get category IDs
  SELECT id INTO vegetables_cat_id FROM categories WHERE name = 'Vegetables' LIMIT 1;
  SELECT id INTO fruits_cat_id FROM categories WHERE name = 'Fruits' LIMIT 1;
  SELECT id INTO herbs_cat_id FROM categories WHERE name = 'Herbs' LIMIT 1;
  SELECT id INTO dairy_cat_id FROM categories WHERE name = 'Dairy' LIMIT 1;

  -- Insert products
  INSERT INTO products (farmer_id, category_id, name, description, price, unit, image_url, available_quantity, harvest_date, is_organic, is_available) VALUES
    (
      sarahs_farm_id,
      vegetables_cat_id,
      'Organic Tomatoes',
      'Vine-ripened organic tomatoes grown with love in our pesticide-free garden. Perfect for salads, cooking, or eating fresh.',
      4.99,
      'lb',
      'https://images.pexels.com/photos/1327838/pexels-photo-1327838.jpeg?auto=compress&cs=tinysrgb&w=800',
      50,
      CURRENT_DATE,
      true,
      true
    ),
    (
      green_valley_id,
      vegetables_cat_id,
      'Fresh Lettuce',
      'Crisp, fresh lettuce grown in our sustainable greenhouse. Perfect for salads and sandwiches.',
      2.49,
      'head',
      'https://images.pexels.com/photos/1656663/pexels-photo-1656663.jpeg?auto=compress&cs=tinysrgb&w=800',
      30,
      CURRENT_DATE - INTERVAL '1 day',
      false,
      true
    ),
    (
      happy_hens_id,
      dairy_cat_id,
      'Farm Fresh Eggs',
      'Free-range eggs from our pasture-raised hens. Rich, golden yolks and superior taste.',
      5.99,
      'dozen',
      'https://images.pexels.com/photos/162712/egg-white-food-protein-162712.jpeg?auto=compress&cs=tinysrgb&w=800',
      25,
      CURRENT_DATE,
      true,
      true
    ),
    (
      berry_patch_id,
      fruits_cat_id,
      'Fresh Strawberries',
      'Sweet, juicy strawberries picked at peak ripeness. Perfect for desserts or eating fresh.',
      6.99,
      'pint',
      'https://images.pexels.com/photos/89778/strawberries-frisch-ripe-sweet-89778.jpeg?auto=compress&cs=tinysrgb&w=800',
      40,
      CURRENT_DATE,
      true,
      true
    ),
    (
      herb_heaven_id,
      herbs_cat_id,
      'Fresh Basil',
      'Aromatic basil grown in our herb garden. Perfect for cooking, pesto, and garnishing.',
      2.99,
      'bunch',
      'https://images.pexels.com/photos/4198015/pexels-photo-4198015.jpeg?auto=compress&cs=tinysrgb&w=800',
      20,
      CURRENT_DATE,
      true,
      true
    ),
    (
      green_valley_id,
      vegetables_cat_id,
      'Organic Carrots',
      'Sweet, crunchy carrots grown in rich soil. Great for snacking, cooking, or juicing.',
      3.99,
      'lb',
      'https://images.pexels.com/photos/143133/pexels-photo-143133.jpeg?auto=compress&cs=tinysrgb&w=800',
      35,
      CURRENT_DATE - INTERVAL '2 days',
      true,
      true
    ),
    (
      sarahs_farm_id,
      vegetables_cat_id,
      'Heirloom Tomatoes',
      'Beautiful heirloom tomatoes in various colors and sizes. Each one is unique with exceptional flavor.',
      7.99,
      'lb',
      'https://images.pexels.com/photos/1327838/pexels-photo-1327838.jpeg?auto=compress&cs=tinysrgb&w=800',
      15,
      CURRENT_DATE,
      true,
      true
    ),
    (
      green_valley_id,
      vegetables_cat_id,
      'Organic Spinach',
      'Tender, nutrient-rich spinach leaves. Perfect for salads, smoothies, or cooking.',
      4.49,
      'bunch',
      'https://images.pexels.com/photos/2255935/pexels-photo-2255935.jpeg?auto=compress&cs=tinysrgb&w=800',
      25,
      CURRENT_DATE,
      true,
      true
    );
END $$;