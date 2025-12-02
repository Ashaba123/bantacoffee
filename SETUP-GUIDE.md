# Piece-Based Coffee Inventory System - Setup Guide

## Overview

This system has been rebuilt from scratch to track coffee inventory by **pieces** (individual packages like 100g, 250g, etc.) instead of weight. It includes production tracking, sales with returns/replacements, debtor management, comprehensive expense tracking, and Excel reporting.

## Features Implemented

✅ **Piece Categories Management** - Define and manage coffee package sizes (100g, 250g, 500g, 1kg, 70g, 20g, 13g, etc.)
✅ **Production Tracking** - Record coffee pieces produced with quantities and rates
✅ **Real-time Stock Inventory** - View stock levels by category with automatic calculations
✅ **Sales & Stock Out** - Track taken, sold, returned, and replaced quantities
✅ **Debtor Tracking** - Manage credit sales with payment type (cash/credit)
✅ **Comprehensive Expenses** - Track all expense types with custom categories
✅ **Reports & Analytics** - Generate detailed reports with Excel export
✅ **Dashboard** - Real-time overview of business metrics

## Database Setup

### Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Wait for the project to be provisioned

### Step 2: Run Database Schema

1. Open your Supabase project
2. Go to **SQL Editor**
3. Open the file `superbase/piece-based-schema.sql` from this project
4. Copy the entire contents
5. Paste into Supabase SQL Editor
6. Click **RUN** to execute the script

This will:
- Create all necessary tables (piece_categories, production_records, production_items, sales, sale_items, expenses, expense_types)
- Insert default piece categories (100g, 250g, 500g, 1kg, 70g, 20g, 13g, 12g)
- Insert predefined expense types (Fuel, Hotel, Allowances, Traffic, Tyre Repair, Scissors, Supermarket, Printing, Car Wash, MBC, Gas, Shopping, OASID)
- Create the stock_inventory view for real-time stock calculations
- Set up indexes for performance
- Configure Row Level Security policies

### Step 3: Get Supabase Credentials

1. In Supabase, go to **Settings** → **API**
2. Copy your **Project URL**
3. Copy your **anon/public** key

### Step 4: Configure Environment Variables

1. Create a `.env.local` file in the project root (if it doesn't exist)
2. Add your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

## Running the Application

### Install Dependencies

```bash
npm install --legacy-peer-deps
```

Note: We use `--legacy-peer-deps` because we've installed the `xlsx` library for Excel export.

### Start Development Server

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

## How to Use

### 1. Settings (First Time Setup)

Go to **Settings** page to:
- View and manage piece categories
- Add custom piece categories if needed
- Manage expense types
- Add custom expense types

### 2. Production

Go to **Production** page to:
- Click "New Production"
- Enter production date
- Add items: Select category, enter quantity and rate
- Save production record
- Stock inventory will automatically update

### 3. Inventory

Go to **Inventory** page to:
- View real-time stock by category
- See total produced, taken, returned, and in-stock quantities
- Monitor stock value
- Check low stock alerts

### 4. Sales & Stock Out

Go to **Sales** page to:
- Click "New Sale"
- Enter sale date, route (optional), buyer (optional)
- Select payment type (Cash or Credit)
- If Credit, enter debtor amount
- Add items with:
  - **Taken**: Quantity taken from warehouse
  - **Sold**: Quantity actually sold
  - **Returned**: Unsold items returned to warehouse
  - **Replaced**: Expired items replaced
- Save sale record
- Stock inventory will automatically update

### 5. Expenses

Go to **Expenses** page to:
- Click "New Expense"
- Select expense type (or add custom type in Settings)
- Enter amount in UGX
- Optionally link to a sale
- Add notes if needed
- View expense summary by type

### 6. Reports

Go to **Reports** page to:
- Select date range
- View comprehensive report with:
  - Stock IN (Production) summary
  - Stock OUT (Sales) summary with returns/replacements
  - Total sales amount
  - Expenses breakdown by type
  - Debtors list
  - Net profit calculation
- Click **Export to Excel** to download report

### 7. Dashboard

The **Dashboard** shows:
- Current stock (pieces and value)
- Production this month
- Pieces sold this month
- Total revenue
- Total expenses
- Total debtors
- Net profit
- Quick action buttons

## Data Flow

```
1. PRODUCTION → Adds pieces to inventory
2. SALES (Taken) → Removes pieces from inventory
3. SALES (Returned) → Adds pieces back to inventory
4. STOCK = Production - Taken + Returned
```

## Currency

All amounts are in **UGX (Uganda Shillings)** with no decimal places.

## Excel Export Format

The Excel export matches your provided image format:

- **Sheet 1: Report**
  - Stock IN section (Particulars, Quantities, Rate, Amount)
  - Stock OUT section (Particulars, Quantities, Sold, Returns, Replacements)
  - Total Cash
  - Expenses breakdown
  - Debtors list
  - Net Profit

## Troubleshooting

### "Failed to load dashboard data"

1. Check that your `.env.local` file has the correct Supabase credentials
2. Ensure the database schema has been run in Supabase
3. Check browser console for specific errors

### No data showing

1. Start by recording production first
2. Then record sales
3. Add expenses
4. View reports

### Excel export not working

1. Make sure `xlsx` package is installed: `npm install xlsx --legacy-peer-deps`
2. Check browser console for errors

## Technical Details

### Technologies Used

- **Next.js 16** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type safety
- **Supabase** - PostgreSQL database with real-time features
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI components
- **xlsx (SheetJS)** - Excel export

### Database Tables

1. `piece_categories` - Coffee package types
2. `production_records` - Production batches
3. `production_items` - Items in each production batch
4. `sales` - Sales transactions
5. `sale_items` - Items in each sale
6. `expense_types` - Expense categories
7. `expenses` - Business expenses

### Database View

- `stock_inventory` - Real-time stock calculation by category

## Support

For issues or questions:
1. Check the browser console for error messages
2. Verify Supabase connection in Settings → API
3. Review the database schema in Supabase SQL Editor

---

**Made with ☕ for Banta Coffee**

