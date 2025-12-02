# Supabase Database Setup

This guide will help you set up the database schema for Banta Coffee Inventory Management System.

## Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create an account
2. Create a new project
3. Wait for the project to be provisioned
4. Copy your project URL and anon key from Settings → API

## Step 2: Update Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

## Step 3: Run SQL Schema

Go to your Supabase project → SQL Editor and run the following SQL:

```sql
-- Create production_batches table
CREATE TABLE production_batches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  production_date DATE NOT NULL,
  quantity_grams DECIMAL(12, 2) NOT NULL,
  batch_number TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create stock_movements table
CREATE TYPE movement_type AS ENUM ('production_in', 'stock_out');

CREATE TABLE stock_movements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  movement_type movement_type NOT NULL,
  quantity_grams DECIMAL(12, 2) NOT NULL,
  movement_date DATE NOT NULL,
  reference_id UUID,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create sales table
CREATE TYPE delivery_status AS ENUM ('pending', 'delivered', 'cancelled');

CREATE TABLE sales (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sale_date DATE NOT NULL,
  quantity_grams DECIMAL(12, 2) NOT NULL,
  price_per_gram DECIMAL(10, 4) NOT NULL,
  total_revenue DECIMAL(12, 2) NOT NULL,
  client_name TEXT NOT NULL,
  client_contact TEXT,
  delivery_status delivery_status DEFAULT 'pending',
  stock_movement_id UUID REFERENCES stock_movements(id),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create expenses table
CREATE TYPE expense_type AS ENUM ('fuel', 'transport', 'packaging', 'labor', 'other');

CREATE TABLE expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  expense_date DATE NOT NULL,
  expense_type expense_type NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  description TEXT NOT NULL,
  sale_id UUID REFERENCES sales(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create inventory_settings table
CREATE TABLE inventory_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  low_stock_threshold_grams DECIMAL(12, 2) NOT NULL DEFAULT 5000,
  notification_email TEXT,
  enable_low_stock_alerts BOOLEAN DEFAULT true,
  enable_daily_reports BOOLEAN DEFAULT false,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default settings
INSERT INTO inventory_settings (low_stock_threshold_grams)
VALUES (5000);

-- Create current_inventory view with SECURITY INVOKER
-- This ensures the view respects RLS policies of the querying user
CREATE OR REPLACE VIEW current_inventory 
WITH (security_invoker = true) AS
SELECT
  COALESCE(SUM(CASE WHEN movement_type = 'production_in' THEN quantity_grams ELSE -quantity_grams END), 0) as total_stock_grams
FROM stock_movements;

-- Create indexes for better performance
CREATE INDEX idx_production_date ON production_batches(production_date DESC);
CREATE INDEX idx_stock_movements_date ON stock_movements(movement_date DESC);
CREATE INDEX idx_sales_date ON sales(sale_date DESC);
CREATE INDEX idx_expenses_date ON expenses(expense_date DESC);
CREATE INDEX idx_expenses_sale_id ON expenses(sale_id);
CREATE INDEX idx_sales_movement_id ON sales(stock_movement_id);

-- Enable Row Level Security (RLS)
ALTER TABLE production_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_settings ENABLE ROW LEVEL SECURITY;

-- Create policies (allowing all operations for now - adjust based on your auth needs)
CREATE POLICY "Enable all for production_batches" ON production_batches FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for stock_movements" ON stock_movements FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for sales" ON sales FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for expenses" ON expenses FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for inventory_settings" ON inventory_settings FOR ALL USING (true) WITH CHECK (true);
```

## Step 4: Verify Setup

After running the SQL, verify that:
1. All 5 tables are created
2. The `current_inventory` view is created
3. Indexes are in place
4. RLS policies are enabled

You can check by going to:
- Table Editor → You should see all 5 tables
- Database → Functions → You should see the view

## Step 5: Test the Connection

Run the development server:
```bash
npm run dev
```

Visit `http://localhost:3000` - if the connection is successful, you should see the dashboard with zeros for all metrics.

## Troubleshooting

### Error: "Failed to load dashboard data"
- Check that `.env.local` exists and has correct values
- Verify your Supabase project is running
- Check that all tables were created successfully

### Error: "relation does not exist"
- Make sure you ran all the SQL commands
- Check that the view was created successfully

### Can't see data in tables
- Make sure RLS policies are enabled
- Try inserting test data through the Supabase UI

## Next Steps

Once your database is set up, you can:
1. Record production batches
2. Monitor inventory levels
3. Track sales and expenses
4. View financial reports

