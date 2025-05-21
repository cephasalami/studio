/*
  # Initial Schema for EstateWatch

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key, references auth.users)
      - `email` (text)
      - `role` (enum)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `visitors`
      - `id` (uuid, primary key)
      - `name` (text)
      - `purpose` (text)
      - `access_code` (text, unique)
      - `authorized_by` (uuid, references profiles)
      - `entry_time` (timestamp)
      - `exit_time` (timestamp)
      - `status` (enum)
      - `authorization_date` (timestamp)
      - `visit_date` (timestamp)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for role-based access
*/

-- Create enum types
CREATE TYPE user_role AS ENUM (
  'Super Admin',
  'Admin',
  'Estate Manager',
  'Resident',
  'Security Operative'
);

CREATE TYPE visitor_status AS ENUM (
  'Pending',
  'Checked-In',
  'Checked-Out',
  'Expired'
);

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  role user_role NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create visitors table
CREATE TABLE IF NOT EXISTS visitors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  purpose text NOT NULL,
  access_code text UNIQUE NOT NULL,
  authorized_by uuid REFERENCES profiles(id) NOT NULL,
  entry_time timestamptz,
  exit_time timestamptz,
  status visitor_status NOT NULL DEFAULT 'Pending',
  authorization_date timestamptz NOT NULL DEFAULT now(),
  visit_date timestamptz NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT visit_date_check CHECK (visit_date >= authorization_date),
  CONSTRAINT exit_after_entry CHECK (exit_time IS NULL OR entry_time IS NULL OR exit_time > entry_time)
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE visitors ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('Super Admin', 'Admin')
    )
  );

-- Visitors policies
CREATE POLICY "Residents can create visitor records"
  ON visitors FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'Resident'
    )
  );

CREATE POLICY "Residents can view their authorized visitors"
  ON visitors FOR SELECT
  TO authenticated
  USING (
    authorized_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('Super Admin', 'Admin', 'Estate Manager', 'Security Operative')
    )
  );

CREATE POLICY "Security can update visitor status"
  ON visitors FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('Security Operative', 'Estate Manager', 'Admin', 'Super Admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('Security Operative', 'Estate Manager', 'Admin', 'Super Admin')
    )
  );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_visitors_updated_at
  BEFORE UPDATE ON visitors
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create function to handle visitor status updates
CREATE OR REPLACE FUNCTION handle_visitor_status_update()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'Checked-In' AND OLD.status = 'Pending' THEN
    NEW.entry_time = now();
  ELSIF NEW.status = 'Checked-Out' AND OLD.status = 'Checked-In' THEN
    NEW.exit_time = now();
  END IF;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for visitor status updates
CREATE TRIGGER handle_visitor_status_changes
  BEFORE UPDATE ON visitors
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION handle_visitor_status_update();