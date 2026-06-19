-- Enable PostGIS extension for geospatial queries
CREATE EXTENSION IF NOT EXISTS postgis;

-- Create resources table
CREATE TABLE resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Core resource information
  title TEXT NOT NULL CHECK (char_length(title) BETWEEN 3 AND 100),
  description TEXT NOT NULL CHECK (char_length(description) BETWEEN 10 AND 1000),
  category TEXT NOT NULL CHECK (category IN (
    'scrap_metal',
    'wood_lumber',
    'tools',
    'electrical',
    'plumbing',
    'containers_storage',
    'building_materials',
    'fuel_energy',
    'other'
  )),
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN (
    'available',
    'claimed',
    'possibly_gone',
    'expired'
  )),
  
  -- Location data
  latitude DOUBLE PRECISION NOT NULL CHECK (latitude BETWEEN -90 AND 90),
  longitude DOUBLE PRECISION NOT NULL CHECK (longitude BETWEEN -180 AND 180),
  location_accuracy TEXT DEFAULT 'approximate' CHECK (location_accuracy IN (
    'exact',
    'approximate',
    'area_only'
  )),
  
  -- Geography point for PostGIS spatial queries (computed from lat/lon)
  location GEOGRAPHY(POINT, 4326),
  
  -- Optional contact and media
  contact_method TEXT CHECK (
    contact_method IS NULL OR 
    char_length(contact_method) BETWEEN 3 AND 200
  ),
  photo_url TEXT CHECK (
    photo_url IS NULL OR 
    char_length(photo_url) BETWEEN 10 AND 500
  ),
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  
  -- Lightweight anonymous ownership tracking
  device_id_hash TEXT CHECK (
    device_id_hash IS NULL OR 
    char_length(device_id_hash) = 64
  )
);

-- Automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_resources_updated_at
  BEFORE UPDATE ON resources
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Automatically set location geography from latitude/longitude
CREATE OR REPLACE FUNCTION update_location_geography()
RETURNS TRIGGER AS $$
BEGIN
  NEW.location = ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326)::geography;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_resources_location
  BEFORE INSERT OR UPDATE OF latitude, longitude ON resources
  FOR EACH ROW
  EXECUTE FUNCTION update_location_geography();

-- Create indexes for common queries

-- Spatial index for nearby searches (most important for MVP)
CREATE INDEX idx_resources_location ON resources USING GIST (location);

-- Status and category filters
CREATE INDEX idx_resources_status ON resources (status);
CREATE INDEX idx_resources_category ON resources (category);

-- Freshness queries
CREATE INDEX idx_resources_created_at ON resources (created_at DESC);
CREATE INDEX idx_resources_updated_at ON resources (updated_at DESC);

-- Composite index for filtered searches
CREATE INDEX idx_resources_status_category ON resources (status, category);

-- Expiration handling
CREATE INDEX idx_resources_expires_at ON resources (expires_at) 
  WHERE expires_at IS NOT NULL;

-- Enable Row Level Security
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
-- Allow API roles to access the schema
GRANT USAGE ON SCHEMA public TO anon, authenticated;
-- Allow reads/inserts for MVP
GRANT SELECT, INSERT ON TABLE public.resources TO anon, authenticated;

-- Policy: Anyone can read non-expired resources
CREATE POLICY "Public read access for active resources"
  ON resources
  FOR SELECT
  USING (
    status != 'expired' AND 
    (expires_at IS NULL OR expires_at > NOW())
  );

-- Policy: Anyone can insert resources (anonymous posting for MVP)
CREATE POLICY "Public insert access"
  ON resources
  FOR INSERT
  WITH CHECK (true);

-- Policy: Update based on device_id_hash match (for status updates)
-- For MVP, we'll allow updates if device_id_hash matches or is NULL
CREATE POLICY "Update own resources"
  ON resources
  FOR UPDATE
  USING (
    device_id_hash IS NULL OR 
    device_id_hash = current_setting('app.device_id_hash', true)
  );

-- Comment the table and key columns for documentation
COMMENT ON TABLE resources IS 'User-posted resource pins for the Magpie MVP';
COMMENT ON COLUMN resources.location IS 'PostGIS geography point computed from latitude/longitude for spatial queries';
COMMENT ON COLUMN resources.device_id_hash IS 'SHA-256 hash of device identifier for lightweight ownership tracking';
COMMENT ON COLUMN resources.expires_at IS 'Optional expiration timestamp for auto-stale resources';
