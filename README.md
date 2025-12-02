# Banta Coffee Inventory Management System ☕

A complete, production-ready **piece-based** inventory management system designed specifically for coffee businesses. Track production, monitor warehouse stock by individual pieces, manage sales with returns/replacements, record expenses, track debtors, and generate comprehensive Excel reports.

![Next.js](https://img.shields.io/badge/Next.js-16-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8)

## ✨ Features

### 📦 Piece-Based Inventory System
- Track inventory by **individual pieces** (100g, 250g, 500g, 1kg, 70g, 20g, 13g packages)
- Real-time stock levels by category
- Automatic stock calculations (produced, taken, returned, in-stock)
- Stock value tracking in UGX
- Low stock alerts by category

### 🏭 Production Tracking
- Record coffee pieces produced from grinding
- Multi-category production batches
- Custom rates per category
- Production history with detailed views
- Automatic inventory updates

### 💰 Sales Management with Returns & Replacements
- Track quantities: Taken, Sold, Returned, Replaced
- Route/location tracking
- Buyer information
- Payment types: Cash or Credit
- Debtor management for credit sales
- Sales history with expandable details

### 👥 Debtor Tracking
- Credit sales management
- Outstanding amounts tracking
- Debtor reports by date range
- Payment type indicators

### 📊 Comprehensive Expense Tracking
- Predefined expense types (Fuel, Hotel, Allowances, Traffic, Tyre Repair, Scissors, Supermarket, Printing, Car Wash, MBC, Gas, Shopping, OASID)
- Custom expense categories
- Link expenses to specific sales
- Expense summary by type
- Edit and delete capabilities

### 📈 Reports & Excel Export
- Comprehensive business reports
- Stock IN (Production) summary by category
- Stock OUT (Sales) summary with returns/replacements
- Expenses breakdown by type
- Debtors list with amounts
- Net profit calculations
- **Excel export** matching your business format
- Date range filtering

### 🎨 Modern, Responsive Design
- Beautiful coffee-themed interface
- Mobile-first responsive design
- Real-time data updates
- Intuitive navigation
- Touch-friendly interfaces

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- npm package manager
- A Supabase account (free tier works)

### Installation

1. **Clone or navigate to the project**
```bash
cd bantacoffee
```

2. **Install dependencies**
```bash
npm install --legacy-peer-deps
```

3. **Set up Supabase Database**
   - Create a Supabase project at [supabase.com](https://supabase.com)
   - Go to SQL Editor in Supabase
   - Run the SQL script from `superbase/piece-based-schema.sql`
   - This will create all tables, views, and insert default data

4. **Configure environment variables**

Create `.env.local` file:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

5. **Run the development server**
```bash
npm run dev
```

6. **Open your browser**

Navigate to [http://localhost:3000](http://localhost:3000)

## 📚 Usage Guide

### 1. Initial Setup (Settings)
- Go to **Settings** page
- Review default piece categories (100g, 250g, 500g, 1kg, etc.)
- Add custom categories if needed
- Review expense types
- Add custom expense types

### 2. Record Production
- Go to **Production** page
- Click "New Production"
- Select date and add production items
- For each item: select category, enter quantity and rate
- Save - stock automatically updates

### 3. Monitor Inventory
- Go to **Inventory** page
- View real-time stock by category
- See produced, taken, returned, and in-stock quantities
- Monitor stock values
- Check low stock alerts

### 4. Record Sales
- Go to **Sales** page
- Click "New Sale"
- Enter date, route (optional), buyer (optional)
- Select payment type (Cash or Credit)
- For Credit sales, enter debtor amount
- Add sale items with:
  - **Taken**: Quantity taken from warehouse
  - **Sold**: Quantity actually sold
  - **Returned**: Unsold items returned
  - **Replaced**: Expired items replaced
- Save - stock automatically updates

### 5. Track Expenses
- Go to **Expenses** page
- Click "New Expense"
- Select expense type or use custom type
- Enter amount in UGX
- Optionally link to a sale
- View expense summary by type

### 6. Generate Reports
- Go to **Reports** page
- Select date range
- View comprehensive report
- Click **Export to Excel** to download
- Excel format matches your business requirements

## 📊 Report Format

The Excel export includes:

### Stock IN (Production)
- Particulars (Category)
- Quantities
- Rate (UGX)
- Amount (UGX)
- Total Stock

### Stock OUT (Sales)
- Particulars (Category)
- Quantities (Taken)
- Sold
- Returns
- Replacements

### Financial Summary
- Total Cash (Sales)
- Expenses Breakdown (by type)
- Total Expenses
- Debtors List
- Total Debtors
- Net Profit

## 🏗️ Project Structure

```
bantacoffee/
├── app/                          # Next.js App Router pages
│   ├── page.tsx                 # Dashboard
│   ├── production/              # Production tracking
│   ├── inventory/               # Stock inventory
│   ├── sales/                   # Sales & stock out
│   ├── expenses/                # Expenses tracking
│   ├── reports/                 # Reports & Excel export
│   └── settings/                # Settings & configuration
├── components/                  # React components
│   ├── ui/                      # shadcn/ui components
│   └── layout/                  # Layout components
├── lib/                         # Utility libraries
│   ├── supabase/               # Supabase client & queries
│   │   ├── client.ts           # Supabase client
│   │   ├── queries.ts          # Database queries
│   │   └── types.ts            # TypeScript types
│   └── utils.ts                # Helper functions
├── superbase/                   # Database schemas
│   └── piece-based-schema.sql  # Main database schema
├── SETUP-GUIDE.md              # Detailed setup guide
└── README.md                    # This file
```

## 🗄️ Database Schema

### Main Tables
1. **piece_categories** - Coffee package types (100g, 250g, etc.)
2. **production_records** - Production batches
3. **production_items** - Items in each production
4. **sales** - Sales transactions
5. **sale_items** - Items in each sale (with taken/sold/returned/replaced)
6. **expense_types** - Expense categories
7. **expenses** - Business expenses

### Database View
- **stock_inventory** - Real-time stock calculation by category

### Key Features
- Automatic stock calculations via database view
- Triggers for maintaining data integrity
- Foreign key relationships
- Row Level Security enabled

## 💱 Currency

All amounts are in **UGX (Uganda Shillings)** formatted without decimals.

## 🔧 Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript
- **Backend**: Supabase (PostgreSQL with real-time features)
- **Styling**: Tailwind CSS, shadcn/ui components
- **Excel Export**: xlsx (SheetJS)
- **Icons**: Lucide React

## 📊 Data Flow

```
Production → Adds pieces to inventory
Sales (Taken) → Removes pieces from inventory  
Sales (Returned) → Adds pieces back to inventory
Stock = Production - Taken + Returned
```

## 🔐 Security

- Environment variables for credentials
- Supabase Row Level Security (RLS) enabled
- Server-side validation via database constraints
- HTTPS encryption (via Vercel deployment)

## 🚀 Deployment

Deploy to Vercel:

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy!

The database stays on Supabase - only the frontend deploys to Vercel.

## 📝 Key Differences from Previous Version

This is a **complete rebuild** with major changes:

### Old System (Weight-Based)
- ❌ Tracked inventory in grams/kilograms
- ❌ Simple sales without returns/replacements
- ❌ Limited expense tracking
- ❌ No debtor management

### New System (Piece-Based)
- ✅ Tracks inventory by individual pieces/packages
- ✅ Sales with taken/sold/returned/replaced quantities
- ✅ Comprehensive expense tracking with custom types
- ✅ Full debtor/credit sales management
- ✅ Excel export matching your business format
- ✅ Route/location tracking
- ✅ Enhanced reporting

## 🤝 Contributing

This is a custom business application for Banta Coffee. For modifications or enhancements, contact the development team.

## 📞 Support

For issues:
1. Check `SETUP-GUIDE.md` for detailed instructions
2. Verify Supabase connection and schema
3. Check browser console for errors
4. Review database structure in Supabase

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Made with ☕ for Banta Coffee - Uganda**

*Track every piece, maximize every profit*
