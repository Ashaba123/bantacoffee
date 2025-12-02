# Quick Setup Checklist ✅

Follow these steps to get your piece-based coffee inventory system running:

## Step 1: Supabase Setup (5 minutes)

1. **Create Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Sign up or log in
   - Click "New Project"
   - Fill in project details
   - Wait for provisioning (~2 minutes)

2. **Run Database Schema**
   - In Supabase dashboard, click "SQL Editor"
   - Open file: `superbase/piece-based-schema.sql`
   - Copy ALL contents
   - Paste into SQL Editor
   - Click "RUN" (bottom right)
   - Wait for "Success" message

3. **Get Credentials**
   - Click "Settings" → "API"
   - Copy "Project URL"
   - Copy "anon public" key

## Step 2: Local Configuration (2 minutes)

1. **Create Environment File**
   - In project root, create file: `.env.local`
   - Add these lines (replace with your values):
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
   ```

2. **Install Dependencies**
   ```bash
   npm install --legacy-peer-deps
   ```

## Step 3: Run Application (1 minute)

```bash
npm run dev
```

Open browser: [http://localhost:3000](http://localhost:3000)

## Step 4: Verify Setup (2 minutes)

1. **Check Dashboard**
   - Should load without errors
   - Should show all cards (will be 0 initially)

2. **Check Settings**
   - Should see 8 default categories (100g, 250g, 500g, 1kg, 70g, 20g, 13g, 12g)
   - Should see 13 expense types

3. **Check Inventory**
   - Should show empty stock table
   - No errors

## Step 5: Test Basic Flow (5 minutes)

1. **Record Production**
   - Go to Production → "New Production"
   - Add item: 100g, Quantity: 100, Rate: 5000
   - Add item: 250g, Quantity: 50, Rate: 10000
   - Save
   - Should see production record in list

2. **Check Inventory**
   - Go to Inventory
   - Should see: 100g = 100 pieces, 250g = 50 pieces
   - Total stock: 150 pieces

3. **Record Sale**
   - Go to Sales → "New Sale"
   - Select Cash payment
   - Add item: 100g
     - Taken: 50
     - Sold: 45
     - Returned: 5
   - Save
   - Should see sale in list

4. **Check Inventory Again**
   - Go to Inventory
   - Should see: 100g = 55 pieces (100 - 50 + 5)

5. **Add Expense**
   - Go to Expenses → "New Expense"
   - Type: Fuel
   - Amount: 50000
   - Save
   - Should see in expense list

6. **Generate Report**
   - Go to Reports
   - Should see all data
   - Click "Export to Excel"
   - Should download Excel file

## ✅ Setup Complete!

If all steps worked, your system is ready for production use.

## 🆘 Troubleshooting

### "Failed to load dashboard data"
- Check `.env.local` file exists and has correct values
- Verify Supabase project URL and key
- Ensure database schema was run successfully

### No default categories showing
- Database schema not run
- Go back to Step 1.2 and run the SQL script

### Excel export not working
- Run: `npm install xlsx --legacy-peer-deps`
- Restart dev server

### Port 3000 already in use
- Use different port: `npm run dev -- -p 3001`

## 📚 Need More Help?

- **Detailed Setup**: Read `SETUP-GUIDE.md`
- **Usage Guide**: Read `README.md`
- **Implementation Details**: Read `IMPLEMENTATION-SUMMARY.md`

## 🎉 You're Ready!

The system is now ready to manage your coffee inventory. Start recording production, sales, and expenses!

---

**Total Setup Time**: ~15 minutes

**Default Data Included**:
- ✅ 8 piece categories
- ✅ 13 expense types
- ✅ Database views and triggers
- ✅ Sample rates (can be changed in Settings)

