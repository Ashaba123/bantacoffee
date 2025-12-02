# Deployment Guide - Banta Coffee Inventory System

This guide will help you deploy the Banta Coffee Inventory Management System to production.

## Prerequisites

- Supabase account (free tier works fine)
- EmailJS account (optional, for notifications)
- Vercel account (for deployment)
- Git installed locally

## Step 1: Database Setup

1. **Create a Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Save your project URL and anon key

2. **Run Database Schema**
   - Follow instructions in `database-setup.md`
   - Run all SQL commands in the Supabase SQL Editor
   - Verify all tables and views are created

## Step 2: EmailJS Setup (Optional)

1. **Create EmailJS Account**
   - Go to [emailjs.com](https://emailjs.com)
   - Create a free account

2. **Add Email Service**
   - Go to Email Services
   - Add a new service (Gmail, Outlook, etc.)
   - Follow the setup wizard

3. **Create Email Templates**
   
   Create 4 templates with the following variables:

   **Low Stock Alert Template:**
   ```
   Subject: [ALERT] Low Stock - Banta Coffee
   
   Hello,
   
   Your coffee stock is running low!
   
   Current Stock: {{current_stock}}
   Threshold: {{threshold}}
   Alert Level: {{alert_level}}
   
   Please restock soon.
   ```

   **Sale Confirmation Template:**
   ```
   Subject: Sale Confirmation - {{client_name}}
   
   Sale Details:
   Client: {{client_name}}
   Quantity: {{quantity}}
   Revenue: {{total_revenue}}
   Date: {{sale_date}}
   
   Thank you for your business!
   ```

   **Daily Summary Template:**
   ```
   Subject: Daily Summary - Banta Coffee
   
   Daily Report for {{date}}
   
   Production: {{production}}
   Sales: {{sales}}
   Revenue: {{revenue}}
   Expenses: {{expenses}}
   Profit: {{profit}}
   Current Stock: {{current_stock}}
   ```

   **Weekly Report Template:**
   ```
   Subject: Weekly Report - Banta Coffee
   
   Week: {{week_start}} to {{week_end}}
   
   Production: {{total_production}}
   Sales: {{total_sales}}
   Revenue: {{total_revenue}}
   Expenses: {{total_expenses}}
   Net Profit: {{net_profit}}
   Current Stock: {{current_stock}}
   ```

4. **Get Credentials**
   - Service ID from Email Services page
   - Template IDs from Email Templates page
   - Public Key from Account → API Keys

## Step 3: Environment Variables

Create a `.env.local` file with:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# EmailJS (Optional)
NEXT_PUBLIC_EMAILJS_SERVICE_ID=service_xxxxxxx
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID_LOW_STOCK=template_xxxxxxx
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID_SALE=template_xxxxxxx
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID_DAILY=template_xxxxxxx
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID_WEEKLY=template_xxxxxxx
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=xxxxxxxxxxxxxxx
```

## Step 4: Local Testing

1. Install dependencies:
```bash
npm install --legacy-peer-deps
```

2. Run development server:
```bash
npm run dev
```

3. Open http://localhost:3000 and test:
   - Dashboard loads correctly
   - Can record production
   - Can record sales
   - Can record expenses
   - Reports generate correctly
   - Settings page works

## Step 5: Deploy to Vercel

### Option A: Deploy via Git (Recommended)

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/your-username/bantacoffee.git
   git push -u origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will auto-detect Next.js

3. **Add Environment Variables**
   - In project settings, go to Environment Variables
   - Add all variables from `.env.local`
   - Make sure to add them for all environments (Production, Preview, Development)

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Visit your live site!

### Option B: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```

4. **Add Environment Variables**
   ```bash
   vercel env add NEXT_PUBLIC_SUPABASE_URL production
   vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
   # Add all other variables
   ```

5. **Deploy to Production**
   ```bash
   vercel --prod
   ```

## Step 6: Post-Deployment

1. **Test Production Site**
   - Visit your Vercel URL
   - Test all features
   - Verify data syncs with Supabase
   - Test email notifications (if configured)

2. **Custom Domain (Optional)**
   - In Vercel project settings
   - Go to Domains
   - Add your custom domain
   - Follow DNS configuration instructions

3. **Set Up Default Data**
   - Add initial inventory settings
   - Set low stock threshold
   - Configure notification email
   - Record some test production/sales

## Step 7: Monitoring

1. **Supabase Dashboard**
   - Monitor database usage
   - Check for errors in logs
   - Review API usage

2. **Vercel Analytics**
   - Enable Vercel Analytics
   - Monitor page load times
   - Track user interactions

3. **Error Tracking**
   - Vercel automatically logs errors
   - Check Functions logs for issues
   - Monitor build logs for warnings

## Troubleshooting

### Build Fails on Vercel

**Problem:** Build fails with dependency errors

**Solution:**
```bash
# In Vercel build settings, use:
npm install --legacy-peer-deps && npm run build
```

### Database Connection Issues

**Problem:** Can't connect to Supabase

**Solution:**
- Verify environment variables are set correctly
- Check Supabase project is active
- Verify RLS policies allow access
- Check network/firewall settings

### Email Notifications Not Working

**Problem:** Emails not sending

**Solution:**
- Verify EmailJS credentials are correct
- Check template IDs match your templates
- Test email in Settings page
- Verify email service is active in EmailJS dashboard

### Slow Page Loads

**Problem:** Pages load slowly

**Solution:**
- Enable Vercel Analytics to identify bottlenecks
- Check Supabase query performance
- Optimize database indexes
- Consider caching strategies

## Security Checklist

- ✅ Environment variables not committed to Git
- ✅ Supabase RLS policies enabled
- ✅ API keys are rotated regularly
- ✅ HTTPS enabled (automatic with Vercel)
- ✅ No sensitive data in frontend code
- ✅ Email addresses validated

## Backup Strategy

1. **Database Backups**
   - Supabase automatically backs up daily
   - Can restore from Supabase dashboard
   - Consider exporting CSV reports regularly

2. **Code Backups**
   - Git repository is your backup
   - Tag releases with version numbers
   - Keep production branch stable

## Maintenance

1. **Regular Updates**
   - Update dependencies monthly: `npm update`
   - Check for Next.js updates
   - Monitor Supabase changelog

2. **Database Maintenance**
   - Review and optimize queries
   - Archive old data if needed
   - Monitor storage usage

3. **Feature Requests**
   - Collect user feedback
   - Prioritize improvements
   - Test changes locally first

## Support

For issues or questions:
- Check this documentation first
- Review Supabase docs: https://supabase.com/docs
- Review Next.js docs: https://nextjs.org/docs
- Review EmailJS docs: https://www.emailjs.com/docs

## Success!

Your Banta Coffee Inventory Management System is now deployed and ready to use! 🎉☕

Access your live site at: `https://your-project.vercel.app`

