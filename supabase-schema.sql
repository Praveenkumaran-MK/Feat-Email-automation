-- Email Automation Recipients Table
-- This is a sample schema for storing email recipients in Supabase

CREATE TABLE recipients (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  department VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_recipients_active ON recipients(is_active);
CREATE INDEX idx_recipients_email ON recipients(email);

-- Insert sample data (300 recipients)
INSERT INTO recipients (email, name, department, is_active) VALUES
  ('john.doe@example.com', 'John Doe', 'Engineering', true),
  ('jane.smith@example.com', 'Jane Smith', 'Marketing', true),
  ('michael.johnson@example.com', 'Michael Johnson', 'Sales', true),
  ('emily.davis@example.com', 'Emily Davis', 'Human Resources', true),
  ('david.wilson@example.com', 'David Wilson', 'Finance', true),
  ('sarah.brown@example.com', 'Sarah Brown', 'Engineering', true),
  ('james.taylor@example.com', 'James Taylor', 'Marketing', true),
  ('linda.anderson@example.com', 'Linda Anderson', 'Sales', true),
  ('robert.thomas@example.com', 'Robert Thomas', 'Engineering', true),
  ('patricia.jackson@example.com', 'Patricia Jackson', 'Finance', true);
  -- Add more recipients as needed to reach 300

-- Optional: Add Row Level Security (RLS) if needed
-- ALTER TABLE recipients ENABLE ROW LEVEL SECURITY;

-- Allow anonymous reads (for Supabase anon key)
-- CREATE POLICY "Allow anonymous read access" ON recipients
--   FOR SELECT USING (true);

-- Optional: Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_recipients_updated_at BEFORE UPDATE
    ON recipients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
