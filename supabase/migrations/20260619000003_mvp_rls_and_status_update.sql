-- MVP RLS hardening + status-only public update path
--
-- Why this migration exists:
-- 1) Keep anonymous read + insert support explicit for MVP.
-- 2) Avoid unsafe direct anonymous table UPDATE policies.
-- 3) Provide a narrow status-only update function as a temporary public path.
--
-- Risk note:
-- Direct anonymous UPDATE on `resources` is unsafe because anyone could mutate
-- arbitrary columns for any row (spam/defacement/data corruption risk).
--
-- MVP-friendly safer alternative used here:
-- - NO anonymous table UPDATE policy.
-- - Expose only a single SECURITY DEFINER function that updates status.
--
-- Better temporary follow-up (recommended):
-- - Require a lightweight ownership token (e.g., hashed device token) in the
--   function and verify row ownership before allowing status updates.

-- Enable Row Level Security
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
-- Allow API roles to access the schema
GRANT USAGE ON SCHEMA public TO anon, authenticated;
-- Allow reads/inserts for MVP
GRANT SELECT, INSERT ON TABLE public.resources TO anon, authenticated;

-- Replace previously broad/implicit policies with minimal explicit ones
DROP POLICY IF EXISTS "Public read access for active resources" ON resources;
DROP POLICY IF EXISTS "Public insert access" ON resources;
DROP POLICY IF EXISTS "Update own resources" ON resources;

-- Anonymous read access for MVP
CREATE POLICY "anon_read_resources"
  ON resources
  FOR SELECT
  TO anon
  USING (true);

-- Anonymous insert access for MVP
CREATE POLICY "anon_insert_resources"
  ON resources
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- No direct anonymous UPDATE policy on table (intentional).

-- Narrow public status update function (status-only)
CREATE OR REPLACE FUNCTION public_update_resource_status(
  p_resource_id UUID,
  p_status TEXT
)
RETURNS TABLE (
  id UUID,
  status TEXT,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_status NOT IN ('available', 'claimed', 'possibly_gone', 'expired') THEN
    RAISE EXCEPTION 'Invalid status value';
  END IF;

  RETURN QUERY
  UPDATE resources
  SET status = p_status
  WHERE resources.id = p_resource_id
  RETURNING resources.id, resources.status, resources.updated_at;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Resource not found';
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public_update_resource_status(UUID, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public_update_resource_status(UUID, TEXT) TO anon;
