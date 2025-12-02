# Quick Start Guide - Banta Coffee Inventory System

Get up and running with your coffee inventory system in 5 minutes!

## First Time Setup

### 1. Access the System

After deployment, visit your application URL. You'll see the dashboard showing zeros for all metrics.

### 2. Configure Settings

1. Navigate to **Settings** (last item in sidebar/menu)
2. Set your **Low Stock Threshold** (e.g., 5000 grams = 5kg)
3. Enter your **Notification Email** (if using EmailJS)
4. Click **Save Settings**

### 3. Record Your First Production

1. Go to **Production** page
2. Fill in the form:
   - **Production Date**: Today's date
   - **Quantity**: Enter amount in grams (e.g., 10000 for 10kg)
   - **Batch Number**: Optional (e.g., BATCH-001)
   - **Notes**: Optional details
3. Click **Record Production**

Your warehouse stock is now updated! 🎉

### 4. Record Your First Sale

1. Go to **Sales** page
2. Fill in the sale form:
   - **Sale Date**: Date of sale
   - **Client Name**: Customer name
   - **Quantity**: Amount sold in grams
   - **Price per Gram**: Selling price (e.g., 0.02 for $0.02/g)
   - **Client Contact**: Optional
3. Click **Record Sale**

The system automatically:
- Deducts stock from warehouse
- Calculates total revenue
- Updates financial metrics

### 5. Record Business Expenses

1. Go to **Expenses** page
2. Fill in the expense form:
   - **Date**: Expense date
   - **Category**: Select type (fuel, transport, packaging, etc.)
   - **Amount**: Cost in dollars
   - **Description**: What was the expense for?
   - **Link to Sale**: Optional - connect to a specific sale
3. Click **Record Expense**

## Daily Workflow

### Morning Routine

1. **Check Dashboard**
   - View current stock levels
   - Check for low stock alerts
   - Review yesterday's metrics

2. **Record Production** (if applicable)
   - Go to Production page
   - Enter today's production
   - System automatically adds to warehouse stock

### During the Day

3. **Record Sales as They Happen**
   - Go to Sales page
   - Enter each sale immediately
   - Stock automatically deducts

4. **Track Expenses**
   - Record fuel, transport, packaging costs
   - Link to specific sales when relevant

### End of Day

5. **Review Reports**
   - Go to Reports page
   - Check today's performance
   - Export data if needed

## Understanding the Pages

### 📊 Dashboard
- **Quick overview** of all key metrics
- Current stock with alert status
- Monthly production, sales, revenue
- Net profit calculation

### 📦 Production
- **Left side**: Form to record new production
- **Right side**: History of all batches
- Each entry adds to warehouse stock

### 🏭 Inventory
- **Current stock** displayed prominently
- **Stock alerts** if running low
- **Movement history**: All ins and outs
- Real-time balance calculation

### 📤 Stock Out
- Record stock removed from warehouse
- **NOT for sales** - use Sales page for that
- For waste, samples, or other removals
- Validates against available stock

### 💰 Sales
- Comprehensive sale recording
- Automatic stock deduction
- Revenue calculation
- Client tracking
- Delivery status management

### 📋 Expenses
- Categorized expense tracking
- Visual breakdown by category
- Can link to specific sales
- Monthly/weekly summaries

### 📈 Reports
- Financial analytics
- Top sales by revenue
- Expense breakdown
- Export to CSV
- Profit margins and trends

### ⚙️ Settings
- Stock threshold configuration
- Email notification setup
- Test email functionality
- System preferences

## Common Tasks

### How to Check Current Stock

1. Dashboard shows it in the first card
2. Or go to Inventory page for detailed view

### How to Record a Large Order

1. Go to Sales page
2. Enter quantity in grams (e.g., 50000 = 50kg)
3. System shows "50 kg" automatically
4. Record price per gram as usual

### How to Track Delivery Status

1. Go to Sales page
2. Find the sale in the list
3. Click "Mark Delivered" when delivered
4. Or "Cancel" if sale was cancelled

### How to Export Financial Data

1. Go to Reports page
2. Click "Export to CSV" button
3. File downloads with all data
4. Open in Excel or Google Sheets

### How to Get Low Stock Alerts

1. Go to Settings
2. Enter your email
3. Enable "Low Stock Alerts"
4. Save settings
5. You'll get emails when stock is low

## Tips for Best Results

### Accuracy

- ✅ Record transactions immediately
- ✅ Use consistent units (always grams)
- ✅ Double-check quantities before saving
- ✅ Add notes for clarity

### Organization

- ✅ Use batch numbers for tracking
- ✅ Link expenses to sales when possible
- ✅ Update delivery status promptly
- ✅ Review dashboard daily

### Efficiency

- ✅ Set appropriate stock thresholds
- ✅ Export reports regularly for backup
- ✅ Use keyboard shortcuts (Tab to navigate)
- ✅ Bookmark frequently used pages

## Mobile Usage

The system is fully responsive!

### On Phone

- **Bottom navigation** for easy thumb access
- Swipe-friendly interface
- Touch-optimized buttons (minimum 44px)
- Simplified views for small screens

### On Tablet

- **Hybrid layout** with side navigation
- Two-column grids
- Full feature access
- Perfect for warehouse use

## Troubleshooting

### Stock Not Updating

**Problem**: Recorded production but stock stays at 0

**Solution**: 
- Check database connection
- Verify Supabase credentials in settings
- Refresh the page

### Can't Record Sale

**Problem**: "Insufficient stock" error

**Solution**:
- Check current stock in Inventory
- Record production first if needed
- Verify quantity entered is correct

### Email Not Sending

**Problem**: Test email doesn't arrive

**Solution**:
- Check EmailJS configuration
- Verify template IDs are correct
- Check spam folder
- Ensure email address is valid

### Page Loading Slowly

**Problem**: Pages take long to load

**Solution**:
- Check internet connection
- Verify Supabase project is active
- Try refreshing the page
- Check browser console for errors

## Getting Help

1. **Check this guide first**
2. **Review database-setup.md** for setup issues
3. **See DEPLOYMENT.md** for deployment problems
4. **Check browser console** for error messages
5. **Verify environment variables** are set correctly

## Success Checklist

Before going live, ensure:

- ✅ Database schema is created
- ✅ Environment variables are set
- ✅ Can access dashboard
- ✅ Can record production
- ✅ Can record sales
- ✅ Stock levels update correctly
- ✅ Reports generate properly
- ✅ Settings saved successfully
- ✅ (Optional) Email notifications working

## Next Steps

Once you're comfortable with the basics:

1. **Set up automated reports** (daily/weekly emails)
2. **Export regular backups** via Reports page
3. **Customize thresholds** based on your business
4. **Review financial trends** weekly
5. **Optimize pricing** based on reports

---

**Congratulations!** 🎉 You're now ready to manage your coffee inventory like a pro!

For more detailed information, see the main [README.md](README.md) and [DEPLOYMENT.md](DEPLOYMENT.md).

