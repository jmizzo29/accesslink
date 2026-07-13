-- AccessLink Supabase Setup
-- Run these SQL commands in the Supabase Query Editor

-- Create properties table
CREATE TABLE IF NOT EXISTS properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  location TEXT NOT NULL,
  description TEXT,
  zero_step_entry BOOLEAN DEFAULT FALSE,
  roll_in_shower BOOLEAN DEFAULT FALSE,
  wide_doors BOOLEAN DEFAULT FALSE,
  wav_available BOOLEAN DEFAULT FALSE,
  elevator_access BOOLEAN DEFAULT FALSE,
  verified BOOLEAN DEFAULT FALSE,
  verified_on_chain BOOLEAN DEFAULT FALSE,
  monad_record_id TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX idx_properties_location ON properties(location);
CREATE INDEX idx_properties_verified ON properties(verified);
CREATE INDEX idx_properties_created_at ON properties(created_at DESC);

-- Enable Row-Level Security (RLS)
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

-- Public can view verified properties
CREATE POLICY "view_verified_properties" ON properties
  FOR SELECT
  USING (verified = true);

-- Anyone can insert (submit reports)
CREATE POLICY "anyone_can_submit_report" ON properties
  FOR INSERT
  WITH CHECK (true);

-- Sample data for testing
INSERT INTO properties (title, location, description, zero_step_entry, roll_in_shower, wide_doors, verified, created_at)
VALUES
  ('Accessible Downtown Hotel', 'New York, NY', 'Excellent accessibility features. Wide hallways, accessible bathroom with roll-in shower. Staff very helpful.', TRUE, TRUE, TRUE, TRUE, NOW() - INTERVAL '7 days'),
  ('Beach View Accessible Airbnb', 'San Francisco, CA', 'Ground floor, roll-in shower, wide doors throughout. Parking nearby.', TRUE, TRUE, TRUE, TRUE, NOW() - INTERVAL '5 days'),
  ('Mountain Retreat Cabin', 'Denver, CO', 'Two steps to entry but accessible within. Wide doors, accessible bathroom.', FALSE, FALSE, TRUE, FALSE, NOW() - INTERVAL '2 days'),
  ('Accessible Airport Hotel', 'Los Angeles, CA', 'WAV parking, elevator access, roll-in shower. Perfect for connecting flights.', TRUE, TRUE, TRUE, TRUE, NOW() - INTERVAL '3 days');

-- Create verified_records table (for tracking Monad submissions)
CREATE TABLE IF NOT EXISTS verified_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id),
  monad_tx_hash TEXT,
  monad_record_id TEXT UNIQUE,
  verified_by TEXT,
  verified_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE
);

CREATE INDEX idx_verified_records_property ON verified_records(property_id);
CREATE INDEX idx_verified_records_monad_id ON verified_records(monad_record_id);

-- Trigger to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_properties_updated_at BEFORE UPDATE ON properties
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
