-- Function to search for nearby resources within a radius
-- Returns resources sorted by distance from the search point
CREATE OR REPLACE FUNCTION search_nearby_resources(
  search_lat DOUBLE PRECISION,
  search_lon DOUBLE PRECISION,
  radius_meters INTEGER DEFAULT 5000,
  filter_category TEXT DEFAULT NULL,
  filter_status TEXT DEFAULT NULL,
  result_limit INTEGER DEFAULT 100
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  description TEXT,
  category TEXT,
  status TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  location_accuracy TEXT,
  contact_method TEXT,
  photo_url TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  distance_meters DOUBLE PRECISION
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    r.id,
    r.title,
    r.description,
    r.category,
    r.status,
    r.latitude,
    r.longitude,
    r.location_accuracy,
    r.contact_method,
    r.photo_url,
    r.created_at,
    r.updated_at,
    r.expires_at,
    ST_Distance(
      r.location,
      ST_SetSRID(ST_MakePoint(search_lon, search_lat), 4326)::geography
    ) AS distance_meters
  FROM resources r
  WHERE 
    -- Within radius
    ST_DWithin(
      r.location,
      ST_SetSRID(ST_MakePoint(search_lon, search_lat), 4326)::geography,
      radius_meters
    )
    -- Not expired
    AND (r.expires_at IS NULL OR r.expires_at > NOW())
    AND r.status != 'expired'
    -- Optional category filter
    AND (filter_category IS NULL OR r.category = filter_category)
    -- Optional status filter
    AND (filter_status IS NULL OR r.status = filter_status)
  ORDER BY 
    distance_meters ASC,
    r.created_at DESC
  LIMIT result_limit;
END;
$$ LANGUAGE plpgsql STABLE;

-- Grant execute permission to anonymous users (for MVP public access)
GRANT EXECUTE ON FUNCTION search_nearby_resources TO anon, authenticated;

-- Comment for documentation
COMMENT ON FUNCTION search_nearby_resources IS 'Search for resources within a radius, with optional category and status filters, sorted by distance';
