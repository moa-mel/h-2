-- Create the extension for generating UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create the database
CREATE DATABASE postgres;

-- Connect to the newly created database
\c postgres;

-- Create the users table
CREATE TABLE users (
  user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_name TEXT NOT NULL,
  user_email TEXT NOT NULL UNIQUE,
  user_password TEXT NOT NULL
);

-- Create the organisations table
CREATE TABLE organisations (
  org_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT
);

-- Create the user_organisations table to establish many-to-many relationship
CREATE TABLE user_organisations (
  user_id UUID REFERENCES users(user_id),
  org_id UUID REFERENCES organisations(org_id),
  PRIMARY KEY (user_id, org_id)
);
