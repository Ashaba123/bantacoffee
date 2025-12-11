import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

export async function POST(request: NextRequest) {
  try {
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
      console.error('CRON_SECRET environment variable is not set');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Validate CRON_SECRET from Authorization header or query parameter
    // Vercel Cron Jobs can send Authorization header, but we also support query param for flexibility
    const authHeader = request.headers.get('authorization');
    const url = new URL(request.url);
    const secretParam = url.searchParams.get('secret');
    
    const expectedAuth = `Bearer ${cronSecret}`;
    const isValidAuth = authHeader === expectedAuth || secretParam === cronSecret;
    
    // Also check for Vercel's built-in cron header (optional additional check)
    const vercelCronHeader = request.headers.get('x-vercel-cron');
    
    // Allow if: valid Authorization header OR valid secret param OR Vercel cron header exists
    if (!isValidAuth && vercelCronHeader !== '1') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Insert timestamp log into database
    const { data, error } = await supabase
      .from('cron_logs')
      .insert({
        executed_at: new Date().toISOString(),
        status: 'success',
        message: 'Weekly cron job executed successfully',
      })
      .select()
      .single();

    if (error) {
      console.error('Error inserting cron log:', error);
      return NextResponse.json(
        { error: 'Failed to log execution', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Cron job executed successfully',
      log: data,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Unexpected error in cron job:', error);
    
    // Try to log the error to database
    try {
      await supabase
        .from('cron_logs')
        .insert({
          executed_at: new Date().toISOString(),
          status: 'error',
          message: error instanceof Error ? error.message : 'Unknown error occurred',
        });
    } catch (logError) {
      console.error('Failed to log error to database:', logError);
    }

    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Optional: Allow GET for manual testing (with proper auth)
export async function GET(request: NextRequest) {
  return POST(request);
}

