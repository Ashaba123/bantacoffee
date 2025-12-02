-- Piece-Based Coffee Inventory System Database Schema
-- Drop existing tables and views first (in correct order due to dependencies)
DROP VIEW IF EXISTS stock_inventory CASCADE;
DROP TABLE IF EXISTS expenses CASCADE;
DROP TABLE IF EXISTS sale_items CASCADE;
DROP TABLE IF EXISTS sales CASCADE;
DROP TABLE IF EXISTS production_items CASCADE;
DROP TABLE IF EXISTS production_records CASCADE;
DROP TABLE IF EXISTS expense_types CASCADE;
DROP TABLE IF EXISTS piece_categories CASCADE;

-- Now create the new schema

-- 1. Piece Categories (100g, 250g, 500g, 1kg, etc.)
CREATE TABLE piece_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE, -- e.g., "100g", "250g", "500g"
  weight_grams INTEGER NOT NULL,
  rate_ugx INTEGER NOT NULL DEFAULT 0, -- Default rate per piece
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Production Records (when coffee is ground into pieces)
CREATE TABLE production_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  production_date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Production Items (individual piece categories produced)
CREATE TABLE production_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  production_record_id UUID NOT NULL REFERENCES production_records(id) ON DELETE CASCADE,
  piece_category_id UUID NOT NULL REFERENCES piece_categories(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  rate_ugx INTEGER NOT NULL,
  amount_ugx INTEGER GENERATED ALWAYS AS (quantity * rate_ugx) STORED,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Sales (sales transactions)
CREATE TABLE sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_date DATE NOT NULL DEFAULT CURRENT_DATE,
  route_name TEXT, -- Optional route/location name
  buyer_name TEXT,
  payment_type TEXT NOT NULL CHECK (payment_type IN ('cash', 'credit')),
  total_amount_ugx INTEGER NOT NULL DEFAULT 0,
  debtor_amount_ugx INTEGER NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Sale Items (individual pieces sold with returns/replacements)
CREATE TABLE sale_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id UUID NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
  piece_category_id UUID NOT NULL REFERENCES piece_categories(id) ON DELETE RESTRICT,
  quantity_taken INTEGER NOT NULL CHECK (quantity_taken >= 0),
  quantity_sold INTEGER NOT NULL CHECK (quantity_sold >= 0),
  quantity_returned INTEGER NOT NULL DEFAULT 0 CHECK (quantity_returned >= 0),
  quantity_replaced INTEGER NOT NULL DEFAULT 0 CHECK (quantity_replaced >= 0),
  rate_ugx INTEGER NOT NULL,
  amount_ugx INTEGER GENERATED ALWAYS AS (quantity_sold * rate_ugx) STORED,
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT valid_quantities CHECK (quantity_sold + quantity_returned <= quantity_taken)
);

-- 6. Expense Types (predefined and custom)
CREATE TABLE expense_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  is_predefined BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. Expenses (all business expenses)
CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
  expense_type_id UUID NOT NULL REFERENCES expense_types(id) ON DELETE RESTRICT,
  amount_ugx INTEGER NOT NULL CHECK (amount_ugx >= 0),
  sale_id UUID REFERENCES sales(id) ON DELETE SET NULL, -- Optional link to sale
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Insert predefined expense types
INSERT INTO expense_types (name, is_predefined, is_active) VALUES
  ('Fuel', true, true),
  ('Hotel', true, true),
  ('Allowances', true, true),
  ('Traffic', true, true),
  ('Tyre Repair', true, true),
  ('Scissors', true, true),
  ('Supermarket', true, true),
  ('Printing', true, true),
  ('Car Wash', true, true),
  ('MBC', true, true),
  ('Gas', true, true),
  ('Shopping', true, true),
  ('OASID', true, true);

-- Insert default piece categories
INSERT INTO piece_categories (name, weight_grams, rate_ugx) VALUES
  ('100g', 100, 5000),
  ('250g', 250, 10000),
  ('500g', 500, 20000),
  ('1kg', 1000, 40000),
  ('70g', 70, 4000),
  ('20g', 20, 1000),
  ('13g', 13, 800),
  ('12g', 12, 750);

-- Create view for real-time stock inventory
CREATE OR REPLACE VIEW stock_inventory
WITH (security_invoker = true)
AS
SELECT 
  pc.id as piece_category_id,
  pc.name as category_name,
  pc.weight_grams,
  pc.rate_ugx,
  pc.is_active,
  COALESCE(SUM(pi.quantity), 0) as total_produced,
  COALESCE(SUM(si.quantity_taken), 0) as total_taken,
  COALESCE(SUM(si.quantity_returned), 0) as total_returned,
  COALESCE(SUM(pi.quantity), 0) - COALESCE(SUM(si.quantity_taken), 0) + COALESCE(SUM(si.quantity_returned), 0) as quantity_in_stock,
  (COALESCE(SUM(pi.quantity), 0) - COALESCE(SUM(si.quantity_taken), 0) + COALESCE(SUM(si.quantity_returned), 0)) * pc.rate_ugx as stock_value_ugx
FROM piece_categories pc
LEFT JOIN production_items pi ON pc.id = pi.piece_category_id
LEFT JOIN sale_items si ON pc.id = si.piece_category_id
WHERE pc.is_active = true
GROUP BY pc.id, pc.name, pc.weight_grams, pc.rate_ugx, pc.is_active
ORDER BY pc.weight_grams DESC;

-- Create indexes for performance
CREATE INDEX idx_production_items_production_record ON production_items(production_record_id);
CREATE INDEX idx_production_items_category ON production_items(piece_category_id);
CREATE INDEX idx_sale_items_sale ON sale_items(sale_id);
CREATE INDEX idx_sale_items_category ON sale_items(piece_category_id);
CREATE INDEX idx_expenses_type ON expenses(expense_type_id);
CREATE INDEX idx_expenses_sale ON expenses(sale_id);
CREATE INDEX idx_sales_date ON sales(sale_date);
CREATE INDEX idx_production_date ON production_records(production_date);
CREATE INDEX idx_expenses_date ON expenses(expense_date);

-- Create function to update sale total
CREATE OR REPLACE FUNCTION update_sale_total()
RETURNS TRIGGER
SET search_path = ''
AS $$
BEGIN
  UPDATE public.sales 
  SET total_amount_ugx = (
    SELECT COALESCE(SUM(amount_ugx), 0)
    FROM public.sale_items
    WHERE sale_id = COALESCE(NEW.sale_id, OLD.sale_id)
  )
  WHERE id = COALESCE(NEW.sale_id, OLD.sale_id);
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger for sale total updates
CREATE TRIGGER trigger_update_sale_total
AFTER INSERT OR UPDATE OR DELETE ON sale_items
FOR EACH ROW
EXECUTE FUNCTION update_sale_total();

-- Enable Row Level Security (RLS) - disable for now for simplicity
-- Can be enabled later if needed with proper policies
ALTER TABLE piece_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE production_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE production_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- Create policies to allow all operations (for single-user setup)
CREATE POLICY "Allow all operations on piece_categories" ON piece_categories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on production_records" ON production_records FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on production_items" ON production_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on sales" ON sales FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on sale_items" ON sale_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on expense_types" ON expense_types FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on expenses" ON expenses FOR ALL USING (true) WITH CHECK (true);

