# Authentication Setup Guide

## Environment Variables

Create a `.env.local` file in the root directory with the following content:

```env
NEXT_PUBLIC_SUPABASE_URL=https://lxlagfzkswmfglwhaoox.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx4bGFnZnprc3dtZmdsd2hhb294Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1ODI0NTMsImV4cCI6MjA4MDE1ODQ1M30.HSJtmOjuXdoWAWBcCes94ajtDRyAy4urxX2yakT0iyY
```

## Login Credentials

The application is configured with the following credentials:

- **Username**: `Admin`
- **Password**: `admin123`

## How to Run

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create the `.env.local` file with the Supabase credentials (see above)

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Navigate to `http://localhost:3000/login` to access the login page

5. Enter the credentials:
   - Username: `Admin`
   - Password: `admin123`

## Features

- ✅ Secure login page with form validation
- ✅ Session persistence using localStorage
- ✅ Protected routes - redirects to login if not authenticated
- ✅ Logout functionality in both sidebar (desktop) and header (mobile)
- ✅ Supabase integration ready for future enhancements

## Authentication Flow

1. User visits any protected route
2. If not authenticated, redirected to `/login`
3. User enters credentials
4. On successful login, redirected to dashboard (`/`)
5. Authentication state persists across page refreshes
6. User can logout using the logout button in the UI

## Files Created

### Authentication Components
- `lib/auth/auth-context.tsx` - Auth context provider and hooks
- `components/auth/protected-route.tsx` - Route protection component
- `app/login/page.tsx` - Login page UI

### Layout Updates
- `components/layout/auth-layout.tsx` - Wrapper for authenticated layout
- `app/layout.tsx` - Updated with AuthProvider
- `components/layout/Header.tsx` - Added logout button for mobile
- `components/layout/Sidebar.tsx` - Added logout button for desktop

## Future Enhancements

The authentication system is currently using a simple hardcoded check. For production, consider:

- Migrating to Supabase Auth for proper authentication
- Adding user management features
- Implementing role-based access control
- Adding password reset functionality
- Using secure HTTP-only cookies instead of localStorage

