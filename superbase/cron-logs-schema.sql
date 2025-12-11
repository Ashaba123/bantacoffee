-- Cron Logs Table Schema
-- This table stores execution logs from scheduled cron jobs

CREATE TABLE IF NOT EXISTS cron_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  executed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  status TEXT NOT NULL CHECK (status IN ('success', 'error')),
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create index for faster queries on execution time
CREATE INDEX IF NOT EXISTS idx_cron_logs_executed_at ON cron_logs(executed_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE cron_logs ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (adjust based on your auth needs)
-- For cron jobs, you may want to restrict this further
CREATE POLICY "Allow all operations on cron_logs" ON cron_logs
  FOR ALL
  USING (true)
  WITH CHECK (true);

