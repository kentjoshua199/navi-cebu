-- ============================================================================
-- NAVICEBU DATABASE COMPLETE SETUP
-- Generated SQL for complete database schema with all data
-- ============================================================================

-- ============================================================================
-- 1. CREATE ENUM TYPES
-- ============================================================================

CREATE TYPE route_type AS ENUM ('TRADITIONAL', 'MODERNIZED');
CREATE TYPE checkpoint_type AS ENUM ('LANDMARK', 'TERMINAL', 'LOADING_ZONE', 'INTERSECTION');
CREATE TYPE direction AS ENUM ('FORWARD', 'RETURN');

-- ============================================================================
-- 2. CREATE TABLES
-- ============================================================================

-- Barangays Table
CREATE TABLE barangays (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  district TEXT,
  coordinates JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Routes Table
CREATE TABLE routes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route_code TEXT NOT NULL UNIQUE,
  route_name TEXT NOT NULL,
  route_type route_type NOT NULL DEFAULT 'TRADITIONAL',
  origin TEXT NOT NULL,
  destination TEXT NOT NULL,
  base_fare DECIMAL(10,2) NOT NULL DEFAULT 13.00,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  operating_hours JSONB NOT NULL DEFAULT '{"start": "05:00", "end": "21:00"}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Checkpoints Table
CREATE TABLE checkpoints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  barangay_id UUID REFERENCES barangays(id) ON DELETE SET NULL,
  checkpoint_type checkpoint_type NOT NULL DEFAULT 'LANDMARK',
  coordinates JSONB NOT NULL,
  description TEXT,
  radius_meters INTEGER NOT NULL DEFAULT 50,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Route Paths Table
CREATE TABLE route_paths (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route_id UUID NOT NULL REFERENCES routes(id) ON DELETE CASCADE,
  checkpoint_id UUID NOT NULL REFERENCES checkpoints(id) ON DELETE CASCADE,
  sequence_order INTEGER NOT NULL,
  direction direction NOT NULL DEFAULT 'FORWARD',
  estimated_time_minutes INTEGER,
  distance_meters INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(route_id, checkpoint_id, direction)
);

-- Stop Settings Table
CREATE TABLE stop_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  checkpoint_id UUID NOT NULL REFERENCES checkpoints(id) ON DELETE CASCADE,
  route_id UUID NOT NULL REFERENCES routes(id) ON DELETE CASCADE,
  stop_order INTEGER NOT NULL,
  is_mandatory BOOLEAN NOT NULL DEFAULT FALSE,
  stop_type TEXT NOT NULL DEFAULT 'REGULAR',
  waiting_time_minutes INTEGER DEFAULT 2,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(route_id, checkpoint_id)
);

-- Route Segments Table
CREATE TABLE route_segments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route_id UUID NOT NULL REFERENCES routes(id) ON DELETE CASCADE,
  from_checkpoint_id UUID NOT NULL REFERENCES checkpoints(id) ON DELETE CASCADE,
  to_checkpoint_id UUID NOT NULL REFERENCES checkpoints(id) ON DELETE CASCADE,
  direction direction NOT NULL DEFAULT 'FORWARD',
  distance_meters INTEGER NOT NULL DEFAULT 0,
  estimated_time_minutes INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(route_id, from_checkpoint_id, to_checkpoint_id, direction)
);

-- Admin Users Table
CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Admin Sessions Table
CREATE TABLE admin_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 3. CREATE INDEXES
-- ============================================================================

CREATE INDEX idx_checkpoints_barangay ON checkpoints(barangay_id);
CREATE INDEX idx_route_paths_route ON route_paths(route_id);
CREATE INDEX idx_route_paths_checkpoint ON route_paths(checkpoint_id);
CREATE INDEX idx_routes_code ON routes(route_code);
CREATE INDEX idx_routes_type ON routes(route_type);
CREATE INDEX idx_stop_settings_route ON stop_settings(route_id);
CREATE INDEX idx_stop_settings_checkpoint ON stop_settings(checkpoint_id);
CREATE INDEX idx_route_segments_route ON route_segments(route_id);
CREATE INDEX idx_route_segments_from ON route_segments(from_checkpoint_id);
CREATE INDEX idx_route_segments_to ON route_segments(to_checkpoint_id);
CREATE INDEX idx_admin_sessions_token ON admin_sessions(token);
CREATE INDEX idx_admin_sessions_user ON admin_sessions(user_id);
CREATE INDEX idx_admin_sessions_expires ON admin_sessions(expires_at);

-- ============================================================================
-- 4. CREATE UPDATED_AT TRIGGER FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- ============================================================================
-- 5. APPLY TRIGGERS
-- ============================================================================

CREATE TRIGGER update_barangays_updated_at BEFORE UPDATE ON barangays FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_routes_updated_at BEFORE UPDATE ON routes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_checkpoints_updated_at BEFORE UPDATE ON checkpoints FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_stop_settings_updated_at BEFORE UPDATE ON stop_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_route_segments_updated_at BEFORE UPDATE ON route_segments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_admin_users_updated_at BEFORE UPDATE ON admin_users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 6. INSERT BARANGAY DATA (20 BARANGAYS)
-- ============================================================================

INSERT INTO barangays (name, district, coordinates) VALUES
('Lahug', 'North District', '{"lat": 10.3234, "lng": 123.8932}'),
('Capitol Site', 'North District', '{"lat": 10.3167, "lng": 123.8915}'),
('Kamputhaw', 'North District', '{"lat": 10.3195, "lng": 123.8895}'),
('Guadalupe', 'South District', '{"lat": 10.3012, "lng": 123.8876}'),
('Banilad', 'North District', '{"lat": 10.3345, "lng": 123.8998}'),
('Talamban', 'North District', '{"lat": 10.3512, "lng": 123.9123}'),
('Mabolo', 'North District', '{"lat": 10.3234, "lng": 123.9056}'),
('Apas', 'North District', '{"lat": 10.3289, "lng": 123.8845}'),
('Kasambagan', 'North District', '{"lat": 10.3156, "lng": 123.8978}'),
('Pardo', 'South District', '{"lat": 10.2834, "lng": 123.8623}'),
('Labangon', 'South District', '{"lat": 10.2912, "lng": 123.8712}'),
('Mambaling', 'South District', '{"lat": 10.2856, "lng": 123.8756}'),
('Tisa', 'South District', '{"lat": 10.2934, "lng": 123.8634}'),
('Basak San Nicolas', 'South District', '{"lat": 10.2978, "lng": 123.8567}'),
('Ermita', 'Downtown', '{"lat": 10.2923, "lng": 123.9012}'),
('Pahina Central', 'Downtown', '{"lat": 10.2967, "lng": 123.8989}'),
('San Nicolas Central', 'Downtown', '{"lat": 10.2989, "lng": 123.8945}'),
('Colon', 'Downtown', '{"lat": 10.2945, "lng": 123.8978}'),
('Sambag I', 'Downtown', '{"lat": 10.3023, "lng": 123.8912}'),
('Sambag II', 'Downtown', '{"lat": 10.3045, "lng": 123.8934}');

-- ============================================================================
-- 7. INSERT ROUTES DATA (11 ROUTES)
-- ============================================================================

INSERT INTO routes (route_code, route_name, route_type, origin, destination, base_fare, operating_hours) VALUES
('01A', 'Lahug - Colon via JY Square', 'TRADITIONAL', 'IT Park, Lahug', 'Colon Street', 13.00, '{"start": "05:00", "end": "22:00"}'),
('04H', 'Ayala - SM City via Banilad', 'TRADITIONAL', 'Ayala Center Cebu', 'SM City Cebu', 13.00, '{"start": "05:30", "end": "21:30"}'),
('06B', 'Talamban - Carbon via Banilad', 'TRADITIONAL', 'Talamban', 'Carbon Market', 15.00, '{"start": "04:30", "end": "21:00"}'),
('12L', 'Lahug - Pardo via N. Bacalso', 'TRADITIONAL', 'JY Square, Lahug', 'Pardo', 15.00, '{"start": "05:00", "end": "20:30"}'),
('14D', 'Ayala - Guadalupe via Banawa', 'TRADITIONAL', 'Ayala Center Cebu', 'Guadalupe', 13.00, '{"start": "05:30", "end": "21:00"}'),
('17B', 'Carbon - Talamban via Capitol', 'TRADITIONAL', 'Carbon Market', 'Talamban', 15.00, '{"start": "05:00", "end": "21:30"}'),
('17C', 'SM City - IT Park', 'MODERNIZED', 'SM City Cebu', 'IT Park, Lahug', 15.00, '{"start": "06:00", "end": "22:00"}'),
('17D', 'Ayala - SM City (Express)', 'MODERNIZED', 'Ayala Center Cebu', 'SM City Cebu', 18.00, '{"start": "06:00", "end": "21:00"}'),
('22I', 'Colon - Mambaling via Tisa', 'TRADITIONAL', 'Colon Street', 'Mambaling', 13.00, '{"start": "05:00", "end": "20:00"}'),
('23', 'Lahug - Labangon via Capitol', 'TRADITIONAL', 'Lahug', 'Labangon', 13.00, '{"start": "05:30", "end": "20:30"}'),
('62B', 'SM City - Talisay via SRP', 'MODERNIZED', 'SM City Cebu', 'Talisay City', 18.00, '{"start": "05:00", "end": "21:00"}');

-- ============================================================================
-- 8. INSERT CHECKPOINT DATA (23 CHECKPOINTS)
-- ============================================================================

INSERT INTO checkpoints (name, barangay_id, checkpoint_type, coordinates, description) VALUES
('IT Park Terminal', (SELECT id FROM barangays WHERE name = 'Lahug'), 'TERMINAL', '{"lat": 10.3289, "lng": 123.9056}', 'Main terminal at IT Park'),
('SM City Cebu Terminal', (SELECT id FROM barangays WHERE name = 'Mabolo'), 'TERMINAL', '{"lat": 10.3117, "lng": 123.9185}', 'SM City Cebu main terminal'),
('Ayala Center Terminal', (SELECT id FROM barangays WHERE name = 'Lahug'), 'TERMINAL', '{"lat": 10.3186, "lng": 123.9053}', 'Ayala Center Cebu terminal'),
('Carbon Market Terminal', (SELECT id FROM barangays WHERE name = 'Ermita'), 'TERMINAL', '{"lat": 10.2912, "lng": 123.9001}', 'Carbon Public Market terminal'),
('Colon Street Terminal', (SELECT id FROM barangays WHERE name = 'Colon'), 'TERMINAL', '{"lat": 10.2956, "lng": 123.8967}', 'Colon Street jeepney terminal'),
('JY Square Mall', (SELECT id FROM barangays WHERE name = 'Lahug'), 'LANDMARK', '{"lat": 10.3312, "lng": 123.8934}', 'JY Square Mall and food court'),
('Cebu Capitol Building', (SELECT id FROM barangays WHERE name = 'Capitol Site'), 'LANDMARK', '{"lat": 10.3167, "lng": 123.8912}', 'Provincial Capitol of Cebu'),
('Fuente Osmena Circle', (SELECT id FROM barangays WHERE name = 'Kamputhaw'), 'LANDMARK', '{"lat": 10.3112, "lng": 123.8912}', 'Fuente Osmena rotunda'),
('Robinsons Cybergate', (SELECT id FROM barangays WHERE name = 'Banilad'), 'LANDMARK', '{"lat": 10.3345, "lng": 123.9012}', 'Robinsons Cybergate Cebu'),
('Country Mall', (SELECT id FROM barangays WHERE name = 'Banilad'), 'LANDMARK', '{"lat": 10.3378, "lng": 123.9034}', 'Country Mall Banilad'),
('UC Main Campus', (SELECT id FROM barangays WHERE name = 'Sambag II'), 'LANDMARK', '{"lat": 10.3034, "lng": 123.8923}', 'University of Cebu Main'),
('Chong Hua Hospital', (SELECT id FROM barangays WHERE name = 'Kamputhaw'), 'LANDMARK', '{"lat": 10.3145, "lng": 123.8934}', 'Chong Hua Hospital'),
('Cebu Doctors Hospital', (SELECT id FROM barangays WHERE name = 'Capitol Site'), 'LANDMARK', '{"lat": 10.3189, "lng": 123.8889}', 'Cebu Doctors University Hospital'),
('Mango Avenue Loading', (SELECT id FROM barangays WHERE name = 'Kamputhaw'), 'LOADING_ZONE', '{"lat": 10.3078, "lng": 123.8923}', 'Mango Avenue jeepney stop'),
('Gorordo Avenue Loading', (SELECT id FROM barangays WHERE name = 'Lahug'), 'LOADING_ZONE', '{"lat": 10.3234, "lng": 123.8945}', 'Gorordo Avenue jeepney loading'),
('AS Fortuna Loading', (SELECT id FROM barangays WHERE name = 'Banilad'), 'LOADING_ZONE', '{"lat": 10.3289, "lng": 123.9089}', 'A.S. Fortuna Street loading zone'),
('N. Bacalso Avenue Loading', (SELECT id FROM barangays WHERE name = 'Mambaling'), 'LOADING_ZONE', '{"lat": 10.2878, "lng": 123.8734}', 'N. Bacalso Ave loading zone'),
('V. Rama Avenue Loading', (SELECT id FROM barangays WHERE name = 'Guadalupe'), 'LOADING_ZONE', '{"lat": 10.3023, "lng": 123.8856}', 'V. Rama Avenue loading'),
('Banawa Intersection', (SELECT id FROM barangays WHERE name = 'Guadalupe'), 'INTERSECTION', '{"lat": 10.3056, "lng": 123.8812}', 'Banawa crossroads'),
('Talamban Junction', (SELECT id FROM barangays WHERE name = 'Talamban'), 'INTERSECTION', '{"lat": 10.3512, "lng": 123.9112}', 'Talamban main junction'),
('Pardo Crossing', (SELECT id FROM barangays WHERE name = 'Pardo'), 'INTERSECTION', '{"lat": 10.2834, "lng": 123.8612}', 'Pardo main crossing'),
('Labangon Junction', (SELECT id FROM barangays WHERE name = 'Labangon'), 'INTERSECTION', '{"lat": 10.2923, "lng": 123.8701}', 'Labangon crossroad'),
('Tisa Junction', (SELECT id FROM barangays WHERE name = 'Tisa'), 'INTERSECTION', '{"lat": 10.2945, "lng": 123.8623}', 'Tisa main junction');

-- ============================================================================
-- 9. INSERT ROUTE PATHS DATA
-- ============================================================================

-- Route 01A: Lahug - Colon (FORWARD)
INSERT INTO route_paths (route_id, checkpoint_id, sequence_order, direction, estimated_time_minutes, distance_meters) VALUES
((SELECT id FROM routes WHERE route_code = '01A'), (SELECT id FROM checkpoints WHERE name = 'IT Park Terminal'), 1, 'FORWARD', 0, 0),
((SELECT id FROM routes WHERE route_code = '01A'), (SELECT id FROM checkpoints WHERE name = 'JY Square Mall'), 2, 'FORWARD', 5, 800),
((SELECT id FROM routes WHERE route_code = '01A'), (SELECT id FROM checkpoints WHERE name = 'Gorordo Avenue Loading'), 3, 'FORWARD', 8, 600),
((SELECT id FROM routes WHERE route_code = '01A'), (SELECT id FROM checkpoints WHERE name = 'Cebu Capitol Building'), 4, 'FORWARD', 12, 900),
((SELECT id FROM routes WHERE route_code = '01A'), (SELECT id FROM checkpoints WHERE name = 'Fuente Osmena Circle'), 5, 'FORWARD', 16, 700),
((SELECT id FROM routes WHERE route_code = '01A'), (SELECT id FROM checkpoints WHERE name = 'Mango Avenue Loading'), 6, 'FORWARD', 20, 500),
((SELECT id FROM routes WHERE route_code = '01A'), (SELECT id FROM checkpoints WHERE name = 'Colon Street Terminal'), 7, 'FORWARD', 28, 1200);

-- Route 04H: Ayala - SM City (FORWARD)
INSERT INTO route_paths (route_id, checkpoint_id, sequence_order, direction, estimated_time_minutes, distance_meters) VALUES
((SELECT id FROM routes WHERE route_code = '04H'), (SELECT id FROM checkpoints WHERE name = 'Ayala Center Terminal'), 1, 'FORWARD', 0, 0),
((SELECT id FROM routes WHERE route_code = '04H'), (SELECT id FROM checkpoints WHERE name = 'Gorordo Avenue Loading'), 2, 'FORWARD', 6, 900),
((SELECT id FROM routes WHERE route_code = '04H'), (SELECT id FROM checkpoints WHERE name = 'Robinsons Cybergate'), 3, 'FORWARD', 12, 1100),
((SELECT id FROM routes WHERE route_code = '04H'), (SELECT id FROM checkpoints WHERE name = 'Country Mall'), 4, 'FORWARD', 16, 800),
((SELECT id FROM routes WHERE route_code = '04H'), (SELECT id FROM checkpoints WHERE name = 'AS Fortuna Loading'), 5, 'FORWARD', 20, 700),
((SELECT id FROM routes WHERE route_code = '04H'), (SELECT id FROM checkpoints WHERE name = 'SM City Cebu Terminal'), 6, 'FORWARD', 28, 1500);

-- Route 06B: Talamban - Carbon (FORWARD)
INSERT INTO route_paths (route_id, checkpoint_id, sequence_order, direction, estimated_time_minutes, distance_meters) VALUES
((SELECT id FROM routes WHERE route_code = '06B'), (SELECT id FROM checkpoints WHERE name = 'Talamban Junction'), 1, 'FORWARD', 0, 0),
((SELECT id FROM routes WHERE route_code = '06B'), (SELECT id FROM checkpoints WHERE name = 'Country Mall'), 2, 'FORWARD', 8, 1500),
((SELECT id FROM routes WHERE route_code = '06B'), (SELECT id FROM checkpoints WHERE name = 'Robinsons Cybergate'), 3, 'FORWARD', 12, 600),
((SELECT id FROM routes WHERE route_code = '06B'), (SELECT id FROM checkpoints WHERE name = 'Cebu Capitol Building'), 4, 'FORWARD', 20, 1800),
((SELECT id FROM routes WHERE route_code = '06B'), (SELECT id FROM checkpoints WHERE name = 'Fuente Osmena Circle'), 5, 'FORWARD', 24, 700),
((SELECT id FROM routes WHERE route_code = '06B'), (SELECT id FROM checkpoints WHERE name = 'Colon Street Terminal'), 6, 'FORWARD', 32, 1200),
((SELECT id FROM routes WHERE route_code = '06B'), (SELECT id FROM checkpoints WHERE name = 'Carbon Market Terminal'), 7, 'FORWARD', 38, 800);

-- Route 12L: Lahug - Pardo (FORWARD)
INSERT INTO route_paths (route_id, checkpoint_id, sequence_order, direction, estimated_time_minutes, distance_meters) VALUES
((SELECT id FROM routes WHERE route_code = '12L'), (SELECT id FROM checkpoints WHERE name = 'JY Square Mall'), 1, 'FORWARD', 0, 0),
((SELECT id FROM routes WHERE route_code = '12L'), (SELECT id FROM checkpoints WHERE name = 'Gorordo Avenue Loading'), 2, 'FORWARD', 5, 800),
((SELECT id FROM routes WHERE route_code = '12L'), (SELECT id FROM checkpoints WHERE name = 'Mango Avenue Loading'), 3, 'FORWARD', 10, 600),
((SELECT id FROM routes WHERE route_code = '12L'), (SELECT id FROM checkpoints WHERE name = 'N. Bacalso Avenue Loading'), 4, 'FORWARD', 18, 1200),
((SELECT id FROM routes WHERE route_code = '12L'), (SELECT id FROM checkpoints WHERE name = 'Pardo Crossing'), 5, 'FORWARD', 25, 1000);

-- Route 14D: Ayala - Guadalupe (FORWARD)
INSERT INTO route_paths (route_id, checkpoint_id, sequence_order, direction, estimated_time_minutes, distance_meters) VALUES
((SELECT id FROM routes WHERE route_code = '14D'), (SELECT id FROM checkpoints WHERE name = 'Ayala Center Terminal'), 1, 'FORWARD', 0, 0),
((SELECT id FROM routes WHERE route_code = '14D'), (SELECT id FROM checkpoints WHERE name = 'Cebu Doctors Hospital'), 2, 'FORWARD', 6, 900),
((SELECT id FROM routes WHERE route_code = '14D'), (SELECT id FROM checkpoints WHERE name = 'Banawa Intersection'), 3, 'FORWARD', 12, 1100),
((SELECT id FROM routes WHERE route_code = '14D'), (SELECT id FROM checkpoints WHERE name = 'V. Rama Avenue Loading'), 4, 'FORWARD', 18, 1000);

-- Route 17B: Carbon - Talamban (FORWARD)
INSERT INTO route_paths (route_id, checkpoint_id, sequence_order, direction, estimated_time_minutes, distance_meters) VALUES
((SELECT id FROM routes WHERE route_code = '17B'), (SELECT id FROM checkpoints WHERE name = 'Carbon Market Terminal'), 1, 'FORWARD', 0, 0),
((SELECT id FROM routes WHERE route_code = '17B'), (SELECT id FROM checkpoints WHERE name = 'Colon Street Terminal'), 2, 'FORWARD', 5, 800),
((SELECT id FROM routes WHERE route_code = '17B'), (SELECT id FROM checkpoints WHERE name = 'Fuente Osmena Circle'), 3, 'FORWARD', 10, 700),
((SELECT id FROM routes WHERE route_code = '17B'), (SELECT id FROM checkpoints WHERE name = 'Cebu Capitol Building'), 4, 'FORWARD', 15, 900),
((SELECT id FROM routes WHERE route_code = '17B'), (SELECT id FROM checkpoints WHERE name = 'Country Mall'), 5, 'FORWARD', 22, 1100),
((SELECT id FROM routes WHERE route_code = '17B'), (SELECT id FROM checkpoints WHERE name = 'Talamban Junction'), 6, 'FORWARD', 30, 1500);

-- Route 17C: SM City - IT Park (FORWARD)
INSERT INTO route_paths (route_id, checkpoint_id, sequence_order, direction, estimated_time_minutes, distance_meters) VALUES
((SELECT id FROM routes WHERE route_code = '17C'), (SELECT id FROM checkpoints WHERE name = 'SM City Cebu Terminal'), 1, 'FORWARD', 0, 0),
((SELECT id FROM routes WHERE route_code = '17C'), (SELECT id FROM checkpoints WHERE name = 'AS Fortuna Loading'), 2, 'FORWARD', 5, 800),
((SELECT id FROM routes WHERE route_code = '17C'), (SELECT id FROM checkpoints WHERE name = 'Robinsons Cybergate'), 3, 'FORWARD', 10, 1000),
((SELECT id FROM routes WHERE route_code = '17C'), (SELECT id FROM checkpoints WHERE name = 'Ayala Center Terminal'), 4, 'FORWARD', 18, 1500),
((SELECT id FROM routes WHERE route_code = '17C'), (SELECT id FROM checkpoints WHERE name = 'IT Park Terminal'), 5, 'FORWARD', 25, 1200);

-- Route 17D: Ayala - SM City Express (FORWARD)
INSERT INTO route_paths (route_id, checkpoint_id, sequence_order, direction, estimated_time_minutes, distance_meters) VALUES
((SELECT id FROM routes WHERE route_code = '17D'), (SELECT id FROM checkpoints WHERE name = 'Ayala Center Terminal'), 1, 'FORWARD', 0, 0),
((SELECT id FROM routes WHERE route_code = '17D'), (SELECT id FROM checkpoints WHERE name = 'Robinsons Cybergate'), 2, 'FORWARD', 8, 1200),
((SELECT id FROM routes WHERE route_code = '17D'), (SELECT id FROM checkpoints WHERE name = 'SM City Cebu Terminal'), 3, 'FORWARD', 15, 1300);

-- Route 22I: Colon - Mambaling (FORWARD)
INSERT INTO route_paths (route_id, checkpoint_id, sequence_order, direction, estimated_time_minutes, distance_meters) VALUES
((SELECT id FROM routes WHERE route_code = '22I'), (SELECT id FROM checkpoints WHERE name = 'Colon Street Terminal'), 1, 'FORWARD', 0, 0),
((SELECT id FROM routes WHERE route_code = '22I'), (SELECT id FROM checkpoints WHERE name = 'Mango Avenue Loading'), 2, 'FORWARD', 5, 600),
((SELECT id FROM routes WHERE route_code = '22I'), (SELECT id FROM checkpoints WHERE name = 'N. Bacalso Avenue Loading'), 3, 'FORWARD', 12, 1000),
((SELECT id FROM routes WHERE route_code = '22I'), (SELECT id FROM checkpoints WHERE name = 'Tisa Junction'), 4, 'FORWARD', 18, 900);

-- Route 23: Lahug - Labangon (FORWARD)
INSERT INTO route_paths (route_id, checkpoint_id, sequence_order, direction, estimated_time_minutes, distance_meters) VALUES
((SELECT id FROM routes WHERE route_code = '23'), (SELECT id FROM checkpoints WHERE name = 'IT Park Terminal'), 1, 'FORWARD', 0, 0),
((SELECT id FROM routes WHERE route_code = '23'), (SELECT id FROM checkpoints WHERE name = 'Gorordo Avenue Loading'), 2, 'FORWARD', 5, 700),
((SELECT id FROM routes WHERE route_code = '23'), (SELECT id FROM checkpoints WHERE name = 'Cebu Capitol Building'), 3, 'FORWARD', 10, 800),
((SELECT id FROM routes WHERE route_code = '23'), (SELECT id FROM checkpoints WHERE name = 'Fuente Osmena Circle'), 4, 'FORWARD', 15, 600),
((SELECT id FROM routes WHERE route_code = '23'), (SELECT id FROM checkpoints WHERE name = 'Labangon Junction'), 5, 'FORWARD', 22, 1000);

-- Route 62B: SM City - Talisay (FORWARD)
INSERT INTO route_paths (route_id, checkpoint_id, sequence_order, direction, estimated_time_minutes, distance_meters) VALUES
((SELECT id FROM routes WHERE route_code = '62B'), (SELECT id FROM checkpoints WHERE name = 'SM City Cebu Terminal'), 1, 'FORWARD', 0, 0),
((SELECT id FROM routes WHERE route_code = '62B'), (SELECT id FROM checkpoints WHERE name = 'AS Fortuna Loading'), 2, 'FORWARD', 8, 1200),
((SELECT id FROM routes WHERE route_code = '62B'), (SELECT id FROM checkpoints WHERE name = 'V. Rama Avenue Loading'), 3, 'FORWARD', 18, 1500);

-- ============================================================================
-- 10. INSERT STOP SETTINGS DATA (51 RECORDS)
-- ============================================================================

INSERT INTO stop_settings (route_id, checkpoint_id, stop_order, is_mandatory, stop_type, waiting_time_minutes)
SELECT 
  rp.route_id,
  rp.checkpoint_id,
  rp.sequence_order,
  CASE 
    WHEN rp.sequence_order = 1 THEN TRUE
    WHEN rp.sequence_order = (SELECT MAX(sequence_order) FROM route_paths WHERE route_id = rp.route_id AND direction = rp.direction) THEN TRUE
    ELSE FALSE
  END,
  CASE
    WHEN rp.sequence_order = 1 THEN 'TERMINAL'
    WHEN rp.sequence_order = (SELECT MAX(sequence_order) FROM route_paths WHERE route_id = rp.route_id AND direction = rp.direction) THEN 'TERMINAL'
    ELSE 'REGULAR'
  END,
  CASE
    WHEN rp.sequence_order = 1 THEN 5
    WHEN rp.sequence_order = (SELECT MAX(sequence_order) FROM route_paths WHERE route_id = rp.route_id AND direction = rp.direction) THEN 3
    ELSE 2
  END
FROM route_paths rp
WHERE rp.direction = 'FORWARD'
ON CONFLICT (route_id, checkpoint_id) DO NOTHING;

-- ============================================================================
-- 11. ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE barangays ENABLE ROW LEVEL SECURITY;
ALTER TABLE routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE route_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE stop_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE route_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_sessions ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 12. CREATE RLS POLICIES - PUBLIC READ ACCESS
-- ============================================================================

CREATE POLICY "Allow public read access on barangays" ON barangays FOR SELECT USING (true);
CREATE POLICY "Allow public read access on routes" ON routes FOR SELECT USING (true);
CREATE POLICY "Allow public read access on checkpoints" ON checkpoints FOR SELECT USING (true);
CREATE POLICY "Allow public read access on route_paths" ON route_paths FOR SELECT USING (true);
CREATE POLICY "Allow public read access on stop_settings" ON stop_settings FOR SELECT USING (true);
CREATE POLICY "Allow public read access on route_segments" ON route_segments FOR SELECT USING (true);

-- ============================================================================
-- 13. CREATE RLS POLICIES - AUTHENTICATED WRITE ACCESS
-- ============================================================================

-- Barangays
CREATE POLICY "Allow authenticated insert on barangays" ON barangays FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated update on barangays" ON barangays FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Allow authenticated delete on barangays" ON barangays FOR DELETE TO authenticated USING (true);

-- Routes
CREATE POLICY "Allow authenticated insert on routes" ON routes FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated update on routes" ON routes FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Allow authenticated delete on routes" ON routes FOR DELETE TO authenticated USING (true);

-- Checkpoints
CREATE POLICY "Allow authenticated insert on checkpoints" ON checkpoints FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated update on checkpoints" ON checkpoints FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Allow authenticated delete on checkpoints" ON checkpoints FOR DELETE TO authenticated USING (true);

-- Route Paths
CREATE POLICY "Allow authenticated insert on route_paths" ON route_paths FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated update on route_paths" ON route_paths FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Allow authenticated delete on route_paths" ON route_paths FOR DELETE TO authenticated USING (true);

-- Stop Settings
CREATE POLICY "Allow authenticated insert on stop_settings" ON stop_settings FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated update on stop_settings" ON stop_settings FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Allow authenticated delete on stop_settings" ON stop_settings FOR DELETE TO authenticated USING (true);

-- Route Segments
CREATE POLICY "Allow authenticated insert on route_segments" ON route_segments FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated update on route_segments" ON route_segments FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Allow authenticated delete on route_segments" ON route_segments FOR DELETE TO authenticated USING (true);

-- Admin Users & Sessions (service role access only)
CREATE POLICY "Service role access on admin_users" ON admin_users USING (true);
CREATE POLICY "Service role access on admin_sessions" ON admin_sessions USING (true);

-- ============================================================================
-- 14. VERIFICATION QUERIES
-- ============================================================================

-- Check total counts
SELECT 
  (SELECT COUNT(*) FROM barangays) as barangay_count,
  (SELECT COUNT(*) FROM routes) as route_count,
  (SELECT COUNT(*) FROM checkpoints) as checkpoint_count,
  (SELECT COUNT(*) FROM route_paths) as route_path_count,
  (SELECT COUNT(*) FROM stop_settings) as stop_setting_count;

-- Check routes with stop counts
SELECT 
  r.route_code,
  r.route_name,
  r.route_type,
  COUNT(ss.id) as stop_count
FROM routes r
LEFT JOIN stop_settings ss ON r.id = ss.route_id
GROUP BY r.id, r.route_code, r.route_name, r.route_type
ORDER BY r.route_code;

-- ============================================================================
-- END OF NAVICEBU DATABASE SETUP
-- ============================================================================

-- ============================================================================
-- MIGRATION: ADD MISSING TIMELINE COLUMNS AND 01K ROUTE MOCK DATA
-- Run this in your Supabase SQL Editor to fix the timeline/fetch issues!
-- ============================================================================

-- 1. Add missing columns to routes table
ALTER TABLE routes 
  ADD COLUMN IF NOT EXISTS fare_per_km DECIMAL(10,2) DEFAULT 2.50,
  ADD COLUMN IF NOT EXISTS first_trip_time TIME DEFAULT '05:00:00',
  ADD COLUMN IF NOT EXISTS last_trip_time TIME DEFAULT '22:00:00',
  ADD COLUMN IF NOT EXISTS peak_hours JSONB DEFAULT '{"start": "07:00", "end": "09:00", "evening": "17:00", "evening_end": "19:00"}',
  ADD COLUMN IF NOT EXISTS operating_days JSONB DEFAULT '["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]';

-- 2. Mock 01K Route Timeline & Stops (Urgello - Parkmall)
-- First, ensure the route exists
INSERT INTO routes (route_code, route_name, route_type, origin, destination, base_fare, first_trip_time, last_trip_time, fare_per_km) 
VALUES ('01K', 'Urgello - Parkmall', 'TRADITIONAL', 'Urgello', 'Parkmall', 13.00, '04:00:00', '23:00:00', 2.50)
ON CONFLICT (route_code) DO UPDATE 
SET first_trip_time = '04:00:00', last_trip_time = '23:00:00', fare_per_km = 2.50;

-- 3. Mock Checkpoints for 01K
INSERT INTO checkpoints (name, checkpoint_type, coordinates, radius_meters) VALUES 
('Urgello Street', 'TERMINAL', '{"lat": 10.3015, "lng": 123.8962}', 50),
('Southwestern University', 'LANDMARK', '{"lat": 10.3045, "lng": 123.8941}', 50),
('Elizabeth Mall (EMall)', 'LANDMARK', '{"lat": 10.2989, "lng": 123.8955}', 50),
('Colon Street (Downtown)', 'LOADING_ZONE', '{"lat": 10.2956, "lng": 123.8967}', 50),
('SM City Cebu', 'LANDMARK', '{"lat": 10.3117, "lng": 123.9185}', 50),
('Parkmall Mandaue', 'TERMINAL', '{"lat": 10.3256, "lng": 123.9332}', 50)
ON CONFLICT DO NOTHING;

-- 4. Add stop_settings for 01K
WITH route_id_val AS (SELECT id FROM routes WHERE route_code = '01K'),
     cp1 AS (SELECT id FROM checkpoints WHERE name = 'Urgello Street' LIMIT 1),
     cp2 AS (SELECT id FROM checkpoints WHERE name = 'Southwestern University' LIMIT 1),
     cp3 AS (SELECT id FROM checkpoints WHERE name = 'Elizabeth Mall (EMall)' LIMIT 1),
     cp4 AS (SELECT id FROM checkpoints WHERE name = 'Colon Street (Downtown)' LIMIT 1),
     cp5 AS (SELECT id FROM checkpoints WHERE name = 'SM City Cebu' LIMIT 1),
     cp6 AS (SELECT id FROM checkpoints WHERE name = 'Parkmall Mandaue' LIMIT 1)
INSERT INTO stop_settings (route_id, checkpoint_id, stop_order, stop_type, waiting_time_minutes) VALUES
((SELECT id FROM route_id_val), (SELECT id FROM cp1), 1, 'TERMINAL', 5),
((SELECT id FROM route_id_val), (SELECT id FROM cp2), 2, 'REGULAR', 2),
((SELECT id FROM route_id_val), (SELECT id FROM cp3), 3, 'REGULAR', 2),
((SELECT id FROM route_id_val), (SELECT id FROM cp4), 4, 'REGULAR', 2),
((SELECT id FROM route_id_val), (SELECT id FROM cp5), 5, 'REGULAR', 2),
((SELECT id FROM route_id_val), (SELECT id FROM cp6), 6, 'TERMINAL', 5)
ON CONFLICT (route_id, checkpoint_id) DO NOTHING;
