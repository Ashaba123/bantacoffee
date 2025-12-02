"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { getReportData } from "@/lib/supabase/queries";
import { formatCurrencyUGX, formatDate } from "@/lib/utils";
import { Download, FileSpreadsheet, Calendar } from "lucide-react";
import * as XLSX from 'xlsx';
import type { SaleWithItems, ProductionRecordWithItems, ExpenseWithType, StockInventory } from "@/lib/supabase/types";

interface ReportData {
  sales: SaleWithItems[];
  production: ProductionRecordWithItems[];
  expenses: ExpenseWithType[];
  stock: StockInventory[];
}

export default function ReportsPage() {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Date filters
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    // Set default dates (current month)
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    setStartDate(firstDay.toISOString().split('T')[0]);
    setEndDate(lastDay.toISOString().split('T')[0]);
  }, []);

  useEffect(() => {
    if (startDate && endDate) {
      loadReport();
    }
  }, [startDate, endDate]);

  async function loadReport() {
    setLoading(true);
    try {
      const data = await getReportData(startDate, endDate);
      setReportData(data);
    } catch (error) {
      console.error("Error loading report:", error);
    } finally {
      setLoading(false);
    }
  }

  function exportToExcel() {
    if (!reportData) return;

    const workbook = XLSX.utils.book_new();

    // Aggregate production by category
    const productionByCategory = new Map<string, { category: string; quantity: number; rate: number }>();
    reportData.production.forEach(prod => {
      prod.production_items.forEach(item => {
        const existing = productionByCategory.get(item.piece_category_id);
        if (existing) {
          existing.quantity += item.quantity;
        } else {
          productionByCategory.set(item.piece_category_id, {
            category: item.piece_categories.name,
            quantity: item.quantity,
            rate: item.rate_ugx,
          });
        }
      });
    });

    // Aggregate sales by category
    const salesByCategory = new Map<string, {
      category: string;
      taken: number;
      sold: number;
      returned: number;
      replaced: number;
      rate: number;
    }>();
    reportData.sales.forEach(sale => {
      sale.sale_items.forEach(item => {
        const existing = salesByCategory.get(item.piece_category_id);
        if (existing) {
          existing.taken += item.quantity_taken;
          existing.sold += item.quantity_sold;
          existing.returned += item.quantity_returned;
          existing.replaced += item.quantity_replaced;
        } else {
          salesByCategory.set(item.piece_category_id, {
            category: item.piece_categories.name,
            taken: item.quantity_taken,
            sold: item.quantity_sold,
            returned: item.quantity_returned,
            replaced: item.quantity_replaced,
            rate: item.rate_ugx,
          });
        }
      });
    });

    // Aggregate expenses by type
    const expensesByType = new Map<string, { type: string; amount: number }>();
    reportData.expenses.forEach(expense => {
      const existing = expensesByType.get(expense.expense_type_id);
      if (existing) {
        existing.amount += expense.amount_ugx;
      } else {
        expensesByType.set(expense.expense_type_id, {
          type: expense.expense_types.name,
          amount: expense.amount_ugx,
        });
      }
    });

    // Calculate totals
    const totalSales = reportData.sales.reduce((sum, sale) => sum + sale.total_amount_ugx, 0);
    const totalDebtors = reportData.sales.reduce((sum, sale) => sum + sale.debtor_amount_ugx, 0);
    const totalExpenses = reportData.expenses.reduce((sum, exp) => sum + exp.amount_ugx, 0);
    const netProfit = totalSales - totalExpenses;

    // Create worksheet data
    const wsData: any[][] = [
      [`COFFEE INVENTORY REPORT - ${formatDate(startDate)} to ${formatDate(endDate)}`],
      [],
      ['STOCK IN (PRODUCTION)'],
      ['PARTICULARS', 'QUANTITIES', 'RATE', 'AMOUNT'],
    ];

    // Add production data
    productionByCategory.forEach(prod => {
      wsData.push([
        prod.category,
        prod.quantity,
        prod.rate,
        prod.quantity * prod.rate,
      ]);
    });

    const totalProductionQty = Array.from(productionByCategory.values()).reduce((sum, p) => sum + p.quantity, 0);
    const totalProductionAmt = Array.from(productionByCategory.values()).reduce((sum, p) => sum + (p.quantity * p.rate), 0);
    
    wsData.push(['TOTAL STOCK', totalProductionQty, '', totalProductionAmt]);
    wsData.push([]);

    // Add sales data
    wsData.push(['STOCK OUT (SALES)']);
    wsData.push(['PARTICULARS', 'QUANTITIES', 'SOLD', 'RETURNS', 'REPLACEMENTS']);

    salesByCategory.forEach(sale => {
      wsData.push([
        sale.category,
        sale.taken,
        sale.sold,
        sale.returned,
        sale.replaced,
      ]);
    });

    wsData.push([]);
    wsData.push(['FINANCIAL SUMMARY']);
    wsData.push(['TOTAL CASH', totalSales]);
    wsData.push([]);

    // Add expenses breakdown
    wsData.push(['LESS EXPENSE']);
    expensesByType.forEach(exp => {
      wsData.push([exp.type.toUpperCase(), exp.amount]);
    });
    wsData.push(['TOTAL EXPENSES', totalExpenses]);
    wsData.push([]);

    // Add debtor info
    wsData.push(['DEBTORS']);
    const debtors = reportData.sales.filter(s => s.payment_type === 'credit' && s.debtor_amount_ugx > 0);
    debtors.forEach(debtor => {
      wsData.push([
        debtor.buyer_name || 'Unknown',
        debtor.debtor_amount_ugx,
        formatDate(debtor.sale_date),
      ]);
    });
    wsData.push(['TOTAL DEBTORS', totalDebtors]);
    wsData.push([]);

    wsData.push(['NET PROFIT', netProfit]);

    // Create worksheet and workbook
    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // Set column widths
    ws['!cols'] = [
      { wch: 20 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
    ];

    XLSX.utils.book_append_sheet(workbook, ws, 'Report');

    // Generate filename
    const filename = `Coffee_Report_${startDate}_to_${endDate}.xlsx`;

    // Write file
    XLSX.writeFile(workbook, filename);
  }

  if (!reportData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-coffee-600">Loading report...</p>
      </div>
    );
  }

  // Aggregate production by category
  const productionByCategory = new Map<string, { category: string; quantity: number; rate: number; amount: number }>();
  reportData.production.forEach(prod => {
    prod.production_items.forEach(item => {
      const existing = productionByCategory.get(item.piece_category_id);
      if (existing) {
        existing.quantity += item.quantity;
        existing.amount += item.amount_ugx;
      } else {
        productionByCategory.set(item.piece_category_id, {
          category: item.piece_categories.name,
          quantity: item.quantity,
          rate: item.rate_ugx,
          amount: item.amount_ugx,
        });
      }
    });
  });

  // Aggregate sales by category
  const salesByCategory = new Map<string, {
    category: string;
    taken: number;
    sold: number;
    returned: number;
    replaced: number;
    rate: number;
    amount: number;
  }>();
  reportData.sales.forEach(sale => {
    sale.sale_items.forEach(item => {
      const existing = salesByCategory.get(item.piece_category_id);
      if (existing) {
        existing.taken += item.quantity_taken;
        existing.sold += item.quantity_sold;
        existing.returned += item.quantity_returned;
        existing.replaced += item.quantity_replaced;
        existing.amount += item.amount_ugx;
      } else {
        salesByCategory.set(item.piece_category_id, {
          category: item.piece_categories.name,
          taken: item.quantity_taken,
          sold: item.quantity_sold,
          returned: item.quantity_returned,
          replaced: item.quantity_replaced,
          rate: item.rate_ugx,
          amount: item.amount_ugx,
        });
      }
    });
  });

  // Aggregate expenses by type
  const expensesByType = new Map<string, { type: string; amount: number }>();
  reportData.expenses.forEach(expense => {
    const existing = expensesByType.get(expense.expense_type_id);
    if (existing) {
      existing.amount += expense.amount_ugx;
    } else {
      expensesByType.set(expense.expense_type_id, {
        type: expense.expense_types.name,
        amount: expense.amount_ugx,
      });
    }
  });

  // Calculate totals
  const totalProductionQty = Array.from(productionByCategory.values()).reduce((sum, p) => sum + p.quantity, 0);
  const totalProductionAmt = Array.from(productionByCategory.values()).reduce((sum, p) => sum + p.amount, 0);
  const totalSales = reportData.sales.reduce((sum, sale) => sum + sale.total_amount_ugx, 0);
  const totalDebtors = reportData.sales.reduce((sum, sale) => sum + sale.debtor_amount_ugx, 0);
  const totalExpenses = reportData.expenses.reduce((sum, exp) => sum + exp.amount_ugx, 0);
  const netProfit = totalSales - totalExpenses;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-coffee-800 mb-2">Reports</h1>
          <p className="text-coffee-600">Comprehensive business reports and analytics</p>
        </div>
        <Button onClick={exportToExcel} className="bg-green-600 hover:bg-green-700">
          <Download className="h-4 w-4 mr-2" />
          Export to Excel
        </Button>
      </div>

      {/* Date Filter */}
      <Card className="coffee-texture">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Date Range
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={loadReport} className="w-full" disabled={loading}>
                {loading ? 'Loading...' : 'Generate Report'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="coffee-texture">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">
              UGX {formatCurrencyUGX(totalSales)}
            </div>
          </CardContent>
        </Card>

        <Card className="coffee-texture">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-700">
              UGX {formatCurrencyUGX(totalExpenses)}
            </div>
          </CardContent>
        </Card>

        <Card className="coffee-texture">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Debtors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-700">
              UGX {formatCurrencyUGX(totalDebtors)}
            </div>
          </CardContent>
        </Card>

        <Card className={`${netProfit >= 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${netProfit >= 0 ? 'text-green-700' : 'text-red-700'}`}>
              UGX {formatCurrencyUGX(netProfit)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stock IN (Production) */}
      <Card className="coffee-texture">
        <CardHeader>
          <CardTitle>Stock IN (Production)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-4">Particulars</th>
                  <th className="text-right py-2 px-4">Quantities</th>
                  <th className="text-right py-2 px-4">Rate</th>
                  <th className="text-right py-2 px-4">Amount</th>
                </tr>
              </thead>
              <tbody>
                {Array.from(productionByCategory.values()).map((prod, idx) => (
                  <tr key={idx} className="border-b">
                    <td className="py-2 px-4">{prod.category}</td>
                    <td className="py-2 px-4 text-right">{prod.quantity}</td>
                    <td className="py-2 px-4 text-right">UGX {formatCurrencyUGX(prod.rate)}</td>
                    <td className="py-2 px-4 text-right font-semibold">UGX {formatCurrencyUGX(prod.amount)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 bg-coffee-50 font-semibold">
                  <td className="py-2 px-4">TOTAL STOCK</td>
                  <td className="py-2 px-4 text-right">{totalProductionQty}</td>
                  <td className="py-2 px-4"></td>
                  <td className="py-2 px-4 text-right text-green-700">UGX {formatCurrencyUGX(totalProductionAmt)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Stock OUT (Sales) */}
      <Card className="coffee-texture">
        <CardHeader>
          <CardTitle>Stock OUT (Sales)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-4">Particulars</th>
                  <th className="text-right py-2 px-4">Quantities</th>
                  <th className="text-right py-2 px-4">Sold</th>
                  <th className="text-right py-2 px-4">Returns</th>
                  <th className="text-right py-2 px-4">Replacements</th>
                </tr>
              </thead>
              <tbody>
                {Array.from(salesByCategory.values()).map((sale, idx) => (
                  <tr key={idx} className="border-b">
                    <td className="py-2 px-4">{sale.category}</td>
                    <td className="py-2 px-4 text-right">{sale.taken}</td>
                    <td className="py-2 px-4 text-right text-green-700 font-semibold">{sale.sold}</td>
                    <td className="py-2 px-4 text-right text-blue-700">{sale.returned}</td>
                    <td className="py-2 px-4 text-right text-amber-700">{sale.replaced}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Expenses Breakdown */}
      <Card className="coffee-texture">
        <CardHeader>
          <CardTitle>Expenses Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Array.from(expensesByType.values()).map((exp, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 border rounded-lg bg-white">
                <span className="font-medium">{exp.type}</span>
                <span className="font-semibold text-red-700">UGX {formatCurrencyUGX(exp.amount)}</span>
              </div>
            ))}
            <div className="flex items-center justify-between p-3 border-2 border-coffee-300 rounded-lg bg-coffee-50">
              <span className="font-bold">TOTAL EXPENSES</span>
              <span className="font-bold text-lg text-red-700">UGX {formatCurrencyUGX(totalExpenses)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Debtors List */}
      <Card className="coffee-texture">
        <CardHeader>
          <CardTitle>Debtors (Credit Sales)</CardTitle>
        </CardHeader>
        <CardContent>
          {reportData.sales.filter(s => s.payment_type === 'credit' && s.debtor_amount_ugx > 0).length === 0 ? (
            <p className="text-center py-4 text-coffee-600">No debtors in this period</p>
          ) : (
            <div className="space-y-2">
              {reportData.sales
                .filter(s => s.payment_type === 'credit' && s.debtor_amount_ugx > 0)
                .map((sale) => (
                  <div key={sale.id} className="flex items-center justify-between p-3 border rounded-lg bg-white">
                    <div>
                      <div className="font-medium">{sale.buyer_name || 'Unknown Buyer'}</div>
                      <div className="text-sm text-coffee-600">{formatDate(sale.sale_date)}</div>
                    </div>
                    <Badge variant="destructive" className="text-base px-3 py-1">
                      UGX {formatCurrencyUGX(sale.debtor_amount_ugx)}
                    </Badge>
                  </div>
                ))}
              <div className="flex items-center justify-between p-3 border-2 border-amber-300 rounded-lg bg-amber-50">
                <span className="font-bold">TOTAL DEBTORS</span>
                <span className="font-bold text-lg text-amber-700">UGX {formatCurrencyUGX(totalDebtors)}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
