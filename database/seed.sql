-- Sample Seed Records for FoodBridge

INSERT INTO users (full_name, email, phone, role, organization_name, address) VALUES
('Tanvir Ahmed', 'manager@sultansdine.example.com', '01711000111', 'RESTAURANT', 'Sultan''s Dine - Dhanmondi', 'Road 27, Dhanmondi, Dhaka'),
('Sadia Islam', 'lead@bidyanondo.example.org', '01811999888', 'NGO', 'Bidyanondo Foundation', 'Mirpur, Dhaka');

INSERT INTO food_donations (donation_id, donor_id, donor_name, food_item, category, quantity_kg, expiry_hours, expires_at, urgency_level, zone, pickup_location, status) VALUES
('FB-1001', 1, 'Sultan''s Dine - Dhanmondi', 'Kacchi Biryani & Chicken Roast Packs', 'Cooked Meals', 18.50, 2.50, NOW() + INTERVAL '2.5 hours', 'CRITICAL', 'Dhanmondi', 'Road 27, Dhanmondi, Dhaka', 'Available'),
('FB-1002', 1, 'Cooper''s Bakery - Uttara', 'Assorted Bread Loaves & Croissants', 'Bakery & Snacks', 12.00, 9.00, NOW() + INTERVAL '9 hours', 'FRESH', 'Uttara', 'Sector 7, Uttara, Dhaka', 'Available');
