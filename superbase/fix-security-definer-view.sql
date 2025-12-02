-- Fix for security_definer_view warning
-- This recreates the current_inventory view with SECURITY INVOKER
-- to ensure it respects RLS policies of the querying user

CREATE OR REPLACE VIEW current_inventory 
WITH (security_invoker = true) AS
SELECT
  COALESCE(SUM(CASE WHEN movement_type = 'production_in' THEN quantity_grams ELSE -quantity_grams END), 0) as total_stock_grams
FROM stock_movements;

