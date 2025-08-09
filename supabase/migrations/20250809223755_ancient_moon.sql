/*
  # Remove sample data

  1. Changes
    - Remove all sample farmers and their products
    - Keep categories for sellers to use
    - Clean slate for real sellers to add their own products

  2. Security
    - Maintains all existing RLS policies
    - No changes to table structure
*/

-- Remove all sample products
DELETE FROM products WHERE farmer_id IN (
  SELECT id FROM farmers WHERE user_id IS NULL
);

-- Remove all sample farmers (those without user_id)
DELETE FROM farmers WHERE user_id IS NULL;