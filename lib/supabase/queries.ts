import { supabase } from './client';
import type {
  PieceCategory,
  ProductionRecord,
  ProductionRecordWithItems,
  Sale,
  SaleWithItems,
  Expense,
  ExpenseWithType,
  ExpenseType,
  StockInventory,
} from './types';

// ==================== PIECE CATEGORIES ====================

export async function getPieceCategories(activeOnly = true) {
  const query = supabase
    .from('piece_categories')
    .select('*')
    .order('weight_grams', { ascending: false });
  
  if (activeOnly) {
    query.eq('is_active', true);
  }
  
  const { data, error } = await query;
  if (error) throw error;
  return data as PieceCategory[];
}

export async function createPieceCategory(category: {
  name: string;
  weight_grams: number;
  rate_ugx: number;
}) {
  const { data, error } = await supabase
    .from('piece_categories')
    .insert(category)
    .select()
    .single();
  
  if (error) throw error;
  return data as PieceCategory;
}

export async function updatePieceCategory(id: string, updates: {
  name?: string;
  weight_grams?: number;
  rate_ugx?: number;
  is_active?: boolean;
}) {
  const { data, error } = await supabase
    .from('piece_categories')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data as PieceCategory;
}

export async function deletePieceCategory(id: string) {
  // Soft delete by deactivating
  const { error } = await supabase
    .from('piece_categories')
    .update({ is_active: false })
    .eq('id', id);
  
  if (error) throw error;
}

// ==================== PRODUCTION ====================

export async function getProductionRecords(limit = 50) {
  const { data, error } = await supabase
    .from('production_records')
    .select(`
      *,
      production_items (
        *,
        piece_categories (*)
      )
    `)
    .order('production_date', { ascending: false })
    .limit(limit);
  
  if (error) throw error;
  return data as ProductionRecordWithItems[];
}

export async function createProduction(production: {
  production_date: string;
  notes?: string;
  items: Array<{
    piece_category_id: string;
    quantity: number;
    rate_ugx: number;
  }>;
}) {
  // Insert production record
  const { data: record, error: recordError } = await supabase
    .from('production_records')
    .insert({
      production_date: production.production_date,
      notes: production.notes,
    })
    .select()
    .single();
  
  if (recordError) throw recordError;
  
  // Insert production items
  const items = production.items.map(item => ({
    production_record_id: record.id,
    piece_category_id: item.piece_category_id,
    quantity: item.quantity,
    rate_ugx: item.rate_ugx,
  }));
  
  const { error: itemsError } = await supabase
    .from('production_items')
    .insert(items);
  
  if (itemsError) throw itemsError;
  
  return record;
}

export async function deleteProduction(id: string) {
  const { error } = await supabase
    .from('production_records')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
}

// ==================== STOCK INVENTORY ====================

export async function getStockInventory() {
  const { data, error } = await supabase
    .from('stock_inventory')
    .select('*')
    .order('weight_grams', { ascending: false });
  
  if (error) throw error;
  return data as StockInventory[];
}

// ==================== SALES ====================

export async function getSales(limit = 50) {
  const { data, error } = await supabase
    .from('sales')
    .select(`
      *,
      sale_items (
        *,
        piece_categories (*)
      )
    `)
    .order('sale_date', { ascending: false })
    .limit(limit);
  
  if (error) throw error;
  return data as SaleWithItems[];
}

export async function createSale(sale: {
  sale_date: string;
  route_name?: string;
  buyer_name?: string;
  payment_type: 'cash' | 'credit';
  debtor_amount_ugx: number;
  notes?: string;
  items: Array<{
    piece_category_id: string;
    quantity_taken: number;
    quantity_sold: number;
    quantity_returned: number;
    quantity_replaced: number;
    rate_ugx: number;
  }>;
}) {
  // Insert sale record
  const { data: record, error: recordError } = await supabase
    .from('sales')
    .insert({
      sale_date: sale.sale_date,
      route_name: sale.route_name,
      buyer_name: sale.buyer_name,
      payment_type: sale.payment_type,
      debtor_amount_ugx: sale.debtor_amount_ugx,
      notes: sale.notes,
    })
    .select()
    .single();
  
  if (recordError) throw recordError;
  
  // Insert sale items
  const items = sale.items.map(item => ({
    sale_id: record.id,
    piece_category_id: item.piece_category_id,
    quantity_taken: item.quantity_taken,
    quantity_sold: item.quantity_sold,
    quantity_returned: item.quantity_returned,
    quantity_replaced: item.quantity_replaced,
    rate_ugx: item.rate_ugx,
  }));
  
  const { error: itemsError } = await supabase
    .from('sale_items')
    .insert(items);
  
  if (itemsError) throw itemsError;
  
  return record;
}

export async function deleteSale(id: string) {
  const { error } = await supabase
    .from('sales')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
}

// ==================== EXPENSE TYPES ====================

export async function getExpenseTypes(activeOnly = true) {
  const query = supabase
    .from('expense_types')
    .select('*')
    .order('name');
  
  if (activeOnly) {
    query.eq('is_active', true);
  }
  
  const { data, error } = await query;
  if (error) throw error;
  return data as ExpenseType[];
}

export async function createExpenseType(name: string) {
  const { data, error } = await supabase
    .from('expense_types')
    .insert({ name, is_predefined: false })
    .select()
    .single();
  
  if (error) throw error;
  return data as ExpenseType;
}

export async function updateExpenseType(id: string, updates: {
  name?: string;
  is_active?: boolean;
}) {
  const { data, error } = await supabase
    .from('expense_types')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data as ExpenseType;
}

// ==================== EXPENSES ====================

export async function getExpenses(limit = 100) {
  const { data, error } = await supabase
    .from('expenses')
    .select(`
      *,
      expense_types (*)
    `)
    .order('expense_date', { ascending: false })
    .limit(limit);
  
  if (error) throw error;
  return data as ExpenseWithType[];
}

export async function createExpense(expense: {
  expense_date: string;
  expense_type_id: string;
  amount_ugx: number;
  sale_id?: string;
  notes?: string;
}) {
  const { data, error } = await supabase
    .from('expenses')
    .insert(expense)
    .select(`
      *,
      expense_types (*)
    `)
    .single();
  
  if (error) throw error;
  return data as ExpenseWithType;
}

export async function updateExpense(id: string, updates: {
  expense_date?: string;
  expense_type_id?: string;
  amount_ugx?: number;
  notes?: string;
}) {
  const { data, error } = await supabase
    .from('expenses')
    .update(updates)
    .eq('id', id)
    .select(`
      *,
      expense_types (*)
    `)
    .single();
  
  if (error) throw error;
  return data as ExpenseWithType;
}

export async function deleteExpense(id: string) {
  const { error } = await supabase
    .from('expenses')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
}

// ==================== REPORTS ====================

export async function getReportData(startDate?: string, endDate?: string) {
  // Get sales with items in date range
  let salesQuery = supabase
    .from('sales')
    .select(`
      *,
      sale_items (
        *,
        piece_categories (*)
      )
    `)
    .order('sale_date', { ascending: false });
  
  if (startDate) salesQuery = salesQuery.gte('sale_date', startDate);
  if (endDate) salesQuery = salesQuery.lte('sale_date', endDate);
  
  const { data: sales, error: salesError } = await salesQuery;
  if (salesError) throw salesError;
  
  // Get production with items in date range
  let productionQuery = supabase
    .from('production_records')
    .select(`
      *,
      production_items (
        *,
        piece_categories (*)
      )
    `)
    .order('production_date', { ascending: false });
  
  if (startDate) productionQuery = productionQuery.gte('production_date', startDate);
  if (endDate) productionQuery = productionQuery.lte('production_date', endDate);
  
  const { data: production, error: productionError } = await productionQuery;
  if (productionError) throw productionError;
  
  // Get expenses in date range
  let expensesQuery = supabase
    .from('expenses')
    .select(`
      *,
      expense_types (*)
    `)
    .order('expense_date', { ascending: false });
  
  if (startDate) expensesQuery = expensesQuery.gte('expense_date', startDate);
  if (endDate) expensesQuery = expensesQuery.lte('expense_date', endDate);
  
  const { data: expenses, error: expensesError } = await expensesQuery;
  if (expensesError) throw expensesError;
  
  // Get current stock
  const { data: stock, error: stockError } = await supabase
    .from('stock_inventory')
    .select('*');
  
  if (stockError) throw stockError;
  
  return {
    sales: sales as SaleWithItems[],
    production: production as ProductionRecordWithItems[],
    expenses: expenses as ExpenseWithType[],
    stock: stock as StockInventory[],
  };
}

// ==================== DASHBOARD STATS ====================

export async function getDashboardStats() {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);
  const startDateStr = startOfMonth.toISOString().split('T')[0];
  
  // Get stock inventory
  const { data: stock } = await supabase
    .from('stock_inventory')
    .select('quantity_in_stock, stock_value_ugx');
  
  const totalStock = stock?.reduce((sum, item) => sum + item.quantity_in_stock, 0) || 0;
  const totalStockValue = stock?.reduce((sum, item) => sum + item.stock_value_ugx, 0) || 0;
  
  // Get production this month
  const { data: production } = await supabase
    .from('production_items')
    .select('quantity, production_records!inner(production_date)')
    .gte('production_records.production_date', startDateStr);
  
  const totalProduction = production?.reduce((sum, item) => sum + item.quantity, 0) || 0;
  
  // Get sales this month
  const { data: sales } = await supabase
    .from('sales')
    .select('total_amount_ugx, debtor_amount_ugx')
    .gte('sale_date', startDateStr);
  
  const totalRevenue = sales?.reduce((sum, sale) => sum + sale.total_amount_ugx, 0) || 0;
  const totalDebtors = sales?.reduce((sum, sale) => sum + sale.debtor_amount_ugx, 0) || 0;
  
  // Get stock sold this month
  const { data: saleItems } = await supabase
    .from('sale_items')
    .select('quantity_sold, sales!inner(sale_date)')
    .gte('sales.sale_date', startDateStr);
  
  const totalStockSold = saleItems?.reduce((sum, item) => sum + item.quantity_sold, 0) || 0;
  
  // Get expenses this month
  const { data: expenses } = await supabase
    .from('expenses')
    .select('amount_ugx')
    .gte('expense_date', startDateStr);
  
  const totalExpenses = expenses?.reduce((sum, expense) => sum + expense.amount_ugx, 0) || 0;
  
  const netProfit = totalRevenue - totalExpenses;
  
  return {
    currentStock: totalStock,
    currentStockValue: totalStockValue,
    totalProduction,
    totalStockSold,
    totalRevenue,
    totalDebtors,
    totalExpenses,
    netProfit,
  };
}
