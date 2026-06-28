-- Sample seed data for Magpie MVP development and testing
-- These are realistic examples of resources in Tehran area

-- Clear existing data (use with caution in production!)
-- TRUNCATE resources CASCADE;

-- Scrap Metal
INSERT INTO resources (
  title, description, category, status, latitude, longitude, location_accuracy, contact_method, photo_url
) VALUES
('Steel beams and rebar', 'About 50kg of mixed steel from demolished shed. Free to collect. Located near Azadi Square.', 'scrap_metal', 'available', 35.6995, 51.3378, 'approximate', 'Call 0912-xxx-xxxx', NULL),
('Aluminum window frames', '12 old aluminum window frames, various sizes. Good for melting or reuse.', 'scrap_metal', 'available', 35.7219, 51.4056, 'approximate', NULL, NULL),
('Copper pipes and fittings', 'Mixed copper plumbing parts, approximately 5kg. Recently claimed but possibly still available.', 'scrap_metal', 'claimed', 35.6892, 51.3890, 'approximate', 'Message on Telegram: @username', NULL);

-- Wood
INSERT INTO resources (
  title, description, category, status, latitude, longitude, location_accuracy, contact_method, photo_url
) VALUES
('Pallet wood - free', '20+ wooden pallets in good condition. Great for building or firewood. Must collect soon.', 'wood_lumber', 'available', 35.7154, 51.4274, 'exact', NULL, NULL),
('Old door frames', '5 solid wood door frames from renovation. Oak and pine. Heavy but quality wood.', 'wood_lumber', 'available', 35.7015, 51.4381, 'approximate', NULL, NULL),
('Construction timber scraps', 'Leftover 2x4 and 2x6 boards from building project. Various lengths.', 'wood_lumber', 'possibly_gone', 35.6855, 51.3654, 'area_only', NULL, NULL);

-- Tools
INSERT INTO resources (
  title, description, category, status, latitude, longitude, location_accuracy, contact_method, photo_url
) VALUES
('Hand tools set', 'Wrenches, screwdrivers, pliers. Some rust but functional. Free to someone who needs them.', 'tools', 'available', 35.7298, 51.4145, 'approximate', 'Knock on blue gate', NULL),
('Electric drill - broken', 'Makita drill, motor stopped working. Good for parts or repair. Free.', 'tools', 'available', 35.6825, 51.4102, 'exact', NULL, NULL),
('Garden tools', 'Shovels, rake, hoe. Used but working. Looking to give away before moving.', 'tools', 'claimed', 35.7445, 51.4892, 'approximate', 'Email: example@email.com', NULL);

-- Electrical
INSERT INTO resources (
  title, description, category, status, latitude, longitude, location_accuracy, contact_method, photo_url
) VALUES
('Electrical wire spools', 'Mixed gauge electrical wire, about 50 meters total. From rewiring project.', 'electrical', 'available', 35.6954, 51.4236, 'approximate', NULL, NULL),
('Old circuit breakers', 'Various amp ratings, removed during upgrade. May be useful for backup power systems.', 'electrical', 'available', 35.7156, 51.3987, 'approximate', NULL, NULL),
('LED bulbs and fixtures', 'Mix of working and broken LED bulbs, plus 3 ceiling fixtures.', 'electrical', 'possibly_gone', 35.7089, 51.4456, 'area_only', NULL, NULL);

-- Plumbing
INSERT INTO resources (
  title, description, category, status, latitude, longitude, location_accuracy, contact_method, photo_url
) VALUES
('PVC pipes and joints', 'Various sizes of PVC pipe, mostly 2-inch and 3-inch. Clean condition.', 'plumbing', 'available', 35.7234, 51.4567, 'approximate', 'Ring doorbell - house #42', NULL),
('Old water heater tank', 'Tank only, heating element removed. Could be repurposed for water storage.', 'plumbing', 'available', 35.6789, 51.3821, 'exact', NULL, NULL);

-- Containers
INSERT INTO resources (
  title, description, category, status, latitude, longitude, location_accuracy, contact_method, photo_url
) VALUES
('Plastic drums - 50L', 'Four blue plastic drums with lids. Previously held food-safe materials.', 'containers_storage', 'available', 35.7145, 51.4321, 'approximate', NULL, NULL),
('Metal storage cabinet', 'Old office cabinet, scratched but sturdy. 120cm tall. Heavy - need truck.', 'containers_storage', 'available', 35.6923, 51.4089, 'exact', NULL, NULL),
('Wooden crates', 'About 15 wooden vegetable crates, stackable. Good for storage or firewood.', 'containers_storage', 'claimed', 35.7312, 51.4712, 'area_only', NULL, NULL);

-- Building Materials
INSERT INTO resources (
  title, description, category, status, latitude, longitude, location_accuracy, contact_method, photo_url
) VALUES
('Concrete blocks', 'Approximately 80 concrete blocks, standard size. From demolished wall.', 'building_materials', 'available', 35.7067, 51.3945, 'approximate', 'Call after 6 PM', NULL),
('Bricks - red clay', 'About 200 bricks, some chipped but mostly good. Free if you collect all.', 'building_materials', 'available', 35.6834, 51.4534, 'exact', NULL, NULL),
('Roof tiles', 'Clay roof tiles from old building. Mix of broken and intact. Free.', 'building_materials', 'possibly_gone', 35.7189, 51.4189, 'approximate', 'Ask at shop next door', NULL);

-- Fuel
INSERT INTO resources (
  title, description, category, status, latitude, longitude, location_accuracy, contact_method, photo_url
) VALUES
('Firewood - mixed', 'About one cubic meter of mixed hardwood. Needs seasoning. Free.', 'fuel_energy', 'available', 35.7421, 51.5023, 'approximate', NULL, NULL),
('Old car battery', '12V car battery, no longer holds charge. Good for recycling or projects.', 'fuel_energy', 'claimed', 35.6945, 51.4145, 'exact', NULL, NULL);

-- Other
INSERT INTO resources (
  title, description, category, status, latitude, longitude, location_accuracy, contact_method, photo_url
) VALUES
('Mixed scrap materials', 'Various useful items from house clearance. Metal, wood, plastic parts.', 'other', 'available', 35.7123, 51.4421, 'area_only', 'Message first: 0935-xxx-xxxx', NULL),
('Old bicycle parts', 'Frames, wheels, chains from 3 old bikes. May be fixable or good for parts.', 'other', 'available', 35.6901, 51.3756, 'approximate', NULL, NULL);

-- Add some resources with expiration dates
INSERT INTO resources (
  title, description, category, status, latitude, longitude, location_accuracy, contact_method, photo_url, expires_at
) VALUES
('Moving sale - everything must go', 'Furniture, tools, household items. Available until end of week only!', 'other', 'available', 35.7089, 51.4312, 'exact', NULL, NULL, NOW() + INTERVAL '7 days'),
('Fresh construction waste', 'Clean wood, metal, and plastic from renovation. Will be thrown out in 3 days.', 'building_materials', 'available', 35.6978, 51.4189, 'approximate', NULL, NULL, NOW() + INTERVAL '3 days');

-- Verify inserts
SELECT COUNT(*) AS total_resources FROM resources;
SELECT category, COUNT(*) AS count FROM resources GROUP BY category ORDER BY category;
SELECT status, COUNT(*) AS count FROM resources GROUP BY status ORDER BY status;
