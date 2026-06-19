/*
  # Crochet Business Management Schema

  1. New Tables
    - `products` - Finished products in inventory
      - `id` (uuid, primary key)
      - `name` (text, product name)
      - `description` (text)
      - `category` (text, e.g., "Amigurumi", "Ramo", "Llavero")
      - `quantity` (integer, stock count)
      - `price` (decimal, sale price)
      - `status` (text: "Disponible", "Agotado", "Bajo pedido")
      - `image_url` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `materials` - Raw materials inventory
      - `id` (uuid, primary key)
      - `name` (text, material name)
      - `brand` (text)
      - `color` (text)
      - `type` (text: "acrílico", "algodón", "lana")
      - `quantity` (decimal, grams or skeins)
      - `unit` (text: "gramos", "madejas")
      - `cost` (decimal, purchase cost)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `orders` - Customer orders
      - `id` (uuid, primary key)
      - `customer_name` (text)
      - `customer_contact` (text, phone/email)
      - `product_name` (text)
      - `description` (text, custom details)
      - `delivery_date` (date)
      - `payment_status` (text: "Pendiente", "Anticipo", "Liquidado")
      - `progress_status` (text: "Sin empezar", "Tejiendo", "Terminado", "Entregado")
      - `price` (decimal, order price)
      - `notes` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `patterns` - Crochet pattern library
      - `id` (uuid, primary key)
      - `title` (text, pattern name)
      - `hook_size` (text, e.g., "3.5mm")
      - `yarn_type` (text)
      - `difficulty` (text: "Fácil", "Intermedio", "Avanzado")
      - `description` (text)
      - `image_url` (text)
      - `notes` (text, general notes)
      - `links` (jsonb, array of tutorial/support links)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `pattern_sections` - Pattern sections with round counters
      - `id` (uuid, primary key)
      - `pattern_id` (uuid, references patterns)
      - `name` (text, section name e.g., "Cabeza", "Cuerpo")
      - `total_rounds` (integer, total number of rounds)
      - `current_round` (integer, current progress)
      - `instructions` (text)
      - `order` (integer, display order)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `price_calculations` - Saved price calculations
      - `id` (uuid, primary key)
      - `product_name` (text)
      - `material_cost` (decimal)
      - `labor_hours` (decimal)
      - `hourly_rate` (decimal)
      - `margin_percentage` (decimal)
      - `final_price` (decimal)
      - `saved_to_inventory` (boolean)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - All tables allow public access for this demo app
    - Note: For production, add proper authentication and restrictive policies

  3. Important Notes
    - Tables use gen_random_uuid() for primary keys
    - Timestamps auto-update on creation and modification
    - Soft deletes not implemented for simplicity
*/

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  category text NOT NULL DEFAULT 'Amigurumi',
  quantity integer NOT NULL DEFAULT 0,
  price decimal(10,2) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'Disponible' CHECK (status IN ('Disponible', 'Agotado', 'Bajo pedido')),
  image_url text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Materials table
CREATE TABLE IF NOT EXISTS materials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  brand text DEFAULT '',
  color text NOT NULL,
  type text NOT NULL DEFAULT 'acrílico' CHECK (type IN ('acrílico', 'algodón', 'lana', 'mixto')),
  quantity decimal(10,2) NOT NULL DEFAULT 0,
  unit text NOT NULL DEFAULT 'gramos' CHECK (unit IN ('gramos', 'madejas', 'metros')),
  cost decimal(10,2) NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text NOT NULL,
  customer_contact text DEFAULT '',
  product_name text NOT NULL,
  description text DEFAULT '',
  delivery_date date,
  payment_status text NOT NULL DEFAULT 'Pendiente' CHECK (payment_status IN ('Pendiente', 'Anticipo', 'Liquidado')),
  progress_status text NOT NULL DEFAULT 'Sin empezar' CHECK (progress_status IN ('Sin empezar', 'Tejiendo', 'Terminado', 'Entregado')),
  price decimal(10,2) DEFAULT 0,
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Patterns table
CREATE TABLE IF NOT EXISTS patterns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  hook_size text DEFAULT '3.5mm',
  yarn_type text DEFAULT 'Algodón',
  difficulty text NOT NULL DEFAULT 'Intermedio' CHECK (difficulty IN ('Fácil', 'Intermedio', 'Avanzado')),
  description text DEFAULT '',
  image_url text DEFAULT '',
  notes text DEFAULT '',
  links jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Pattern sections table
CREATE TABLE IF NOT EXISTS pattern_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pattern_id uuid NOT NULL REFERENCES patterns(id) ON DELETE CASCADE,
  name text NOT NULL,
  total_rounds integer NOT NULL DEFAULT 0,
  current_round integer NOT NULL DEFAULT 0,
  instructions text DEFAULT '',
  "order" integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Price calculations table
CREATE TABLE IF NOT EXISTS price_calculations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_name text NOT NULL,
  material_cost decimal(10,2) NOT NULL DEFAULT 0,
  labor_hours decimal(10,2) NOT NULL DEFAULT 0,
  hourly_rate decimal(10,2) NOT NULL DEFAULT 0,
  margin_percentage decimal(10,2) NOT NULL DEFAULT 20,
  final_price decimal(10,2) NOT NULL DEFAULT 0,
  saved_to_inventory boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE pattern_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_calculations ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (demo purposes)
-- Note: In production, replace with authenticated user policies
CREATE POLICY "Allow public access to products" ON products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access to materials" ON materials FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access to orders" ON orders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access to patterns" ON patterns FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access to pattern_sections" ON pattern_sections FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access to price_calculations" ON price_calculations FOR ALL USING (true) WITH CHECK (true);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_orders_delivery_date ON orders(delivery_date);
CREATE INDEX IF NOT EXISTS idx_orders_progress_status ON orders(progress_status);
CREATE INDEX IF NOT EXISTS idx_pattern_sections_pattern_id ON pattern_sections(pattern_id);
