/*
  # Initial Schema for EstateWatch Visitor Management

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key) - Links to auth.users
      - `role` (text) - User role (Super Admin, Admin, Estate Manager, Resident, Security Operative)
      - `full_name` (text) - User's full name
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `visitors`
      - `id` (uuid, primary key)
      - `name` (text) - Visitor's name
      - `purpose` (text) - Purpose of visit
      - `access_code` (text, unique) - Unique access code for verification
      - `authorized_by` (uuid) - References profiles.id of the authorizing resident
      - `entry_time` (timestamptz) - When visitor checked in
      - `exit_time` (timestamptz) - When visitor checked out
      - `status` (text) - Current status (Pending, Checked-In, Checked-Out, Expired)
      - `authorization_date` (timestamptz)
      - `visit_date` (date) - Expected date of visit
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for each user role
    - Secure access to visitor data
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('Super Admin', 'Admin', 'Estate Manager', 'Resident', 'Security Operative')),
  full_name text NOT NULL,
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
  status text NOT NULL CHECK (status IN ('Pending', 'Checked-In', 'Checked-Out', 'Expired')),
  authorization_date timestamptz NOT NULL DEFAULT now(),
  visit_date date NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE visitors ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Users can view their own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Super admins can view all profiles"
  ON profiles
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'Super Admin'
    )
  );

CREATE POLICY "Admins can view all profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('Admin', 'Super Admin')
    )
  );

-- Visitors Policies
CREATE POLICY "Residents can create and view their own visitors"
  ON visitors
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'Resident'
      AND id = visitors.authorized_by
    )
  );

CREATE POLICY "Security operatives can view and update visitor status"
  ON visitors
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'Security Operative'
    )
  );

CREATE POLICY "Security operatives can update visitor check-in/out"
  ON visitors
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'Security Operative'
    )
  )
  WITH CHECK (
    status IN ('Checked-In', 'Checked-Out')
  );

CREATE POLICY "Estate managers can view all visitors"
  ON visitors
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('Estate Manager', 'Admin', 'Super Admin')
    )
  );

-- Create function to handle visitor status updates
CREATE OR REPLACE FUNCTION update_visitor_status()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.entry_time IS NOT NULL AND OLD.entry_time IS NULL THEN
    NEW.status = 'Checked-In';
  ELSIF NEW.exit_time IS NOT NULL AND OLD.exit_time IS NULL THEN
    NEW.status = 'Checked-Out';
  END IF;
  
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for visitor status updates
CREATE TRIGGER visitor_status_update
  BEFORE UPDATE ON visitors
  FOR EACH ROW
  EXECUTE FUNCTION update_visitor_status();

-- Create function to handle profile updates
CREATE OR REPLACE FUNCTION handle_profile_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for profile updates
CREATE TRIGGER profile_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION handle_profile_updated_at();