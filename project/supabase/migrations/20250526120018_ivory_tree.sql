/*
  # Initial schema setup for blog application

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key) - matches the auth.users.id
      - `username` (text, unique)
      - `full_name` (text)
      - `avatar_url` (text)
      - `created_at` (timestamp)

    - `blogs`
      - `id` (uuid, primary key)
      - `title` (text, not null)
      - `content` (text, not null)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
      - `author_id` (uuid, foreign key to profiles.id)

  2. Security
    - Enable RLS on all tables
    - Add policies for:
      - Profiles: authenticated users can read all profiles, but only update their own
      - Blogs: anyone can read blogs, authenticated users can create blogs, 
               and users can only update/delete their own blogs
*/

-- Create profiles table to store user information
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create blogs table
CREATE TABLE IF NOT EXISTS blogs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  author_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE blogs ENABLE ROW LEVEL SECURITY;

-- Profiles policies
-- Anyone can read all profiles
CREATE POLICY "Anyone can read profiles"
  ON profiles
  FOR SELECT
  USING (true);

-- Users can only update their own profile
CREATE POLICY "Users can update their own profile"
  ON profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Blogs policies
-- Anyone can read all blogs
CREATE POLICY "Anyone can read blogs"
  ON blogs
  FOR SELECT
  USING (true);

-- Authenticated users can create blogs
CREATE POLICY "Authenticated users can create blogs"
  ON blogs
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = author_id);

-- Users can update their own blogs
CREATE POLICY "Users can update their own blogs"
  ON blogs
  FOR UPDATE
  USING (auth.uid() = author_id);

-- Users can delete their own blogs
CREATE POLICY "Users can delete their own blogs"
  ON blogs
  FOR DELETE
  USING (auth.uid() = author_id);

-- Create a function to automatically update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to call the function whenever a blog is updated
CREATE TRIGGER update_blogs_updated_at
  BEFORE UPDATE ON blogs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();