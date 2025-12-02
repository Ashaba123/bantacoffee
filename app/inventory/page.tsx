"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getStockInventory } from "@/lib/supabase/queries";
import { formatCurrencyUGX } from "@/lib/utils";
import { Package, TrendingUp, DollarSign, AlertTriangle } from "lucide-react";
import type { StockInventory } from "@/lib/supabase/types";

export default function InventoryPage() {
  const [stock, setStock] = useState<StockInventory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStock();
    
    // Refresh every 30 seconds
    const interval = setInterval(loadStock, 30000);
    return () => clearInterval(interval);
  }, []);

  async function loadStock() {
    try {
      const data = await getStockInventory();
      setStock(data);
    } catch (error) {
      console.error("Error loading stock:", error);
    } finally {
      setLoading(false);
    }
  }

  const totalPieces = stock.reduce((sum, item) => sum + item.quantity_in_stock, 0);
  const totalValue = stock.reduce((sum, item) => sum + item.stock_value_ugx, 0);
  const lowStockItems = stock.filter(item => item.quantity_in_stock < 50);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-coffee-600">Loading inventory...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-coffee-800 mb-2">Stock Inventory</h1>
        <p className="text-coffee-600">Real-time stock levels by category</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="coffee-texture">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Stock</CardTitle>
            <Package className="h-4 w-4 text-coffee-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-coffee-800">{totalPieces}</div>
            <p className="text-xs text-coffee-600 mt-1">Total pieces in stock</p>
          </CardContent>
        </Card>

        <Card className="coffee-texture">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stock Value</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">
              UGX {formatCurrencyUGX(totalValue)}
            </div>
            <p className="text-xs text-coffee-600 mt-1">Total inventory value</p>
          </CardContent>
        </Card>

        <Card className="coffee-texture">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
            <AlertTriangle className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${lowStockItems.length > 0 ? 'text-amber-600' : 'text-green-600'}`}>
              {lowStockItems.length}
            </div>
            <p className="text-xs text-coffee-600 mt-1">Items below 50 pieces</p>
          </CardContent>
        </Card>
      </div>

      {/* Stock Table */}
      <Card className="coffee-texture">
        <CardHeader>
          <CardTitle>Stock by Category</CardTitle>
        </CardHeader>
        <CardContent>
          {stock.length === 0 ? (
            <div className="text-center py-8 text-coffee-600">
              No stock data available. Start by recording production.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold">Category</th>
                    <th className="text-right py-3 px-4 font-semibold">Produced</th>
                    <th className="text-right py-3 px-4 font-semibold">Taken</th>
                    <th className="text-right py-3 px-4 font-semibold">Returned</th>
                    <th className="text-right py-3 px-4 font-semibold">In Stock</th>
                    <th className="text-right py-3 px-4 font-semibold">Rate</th>
                    <th className="text-right py-3 px-4 font-semibold">Value</th>
                    <th className="text-center py-3 px-4 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {stock.map((item) => {
                    const stockLevel = 
                      item.quantity_in_stock === 0 ? 'out' :
                      item.quantity_in_stock < 20 ? 'critical' :
                      item.quantity_in_stock < 50 ? 'low' : 'good';

                    return (
                      <tr key={item.piece_category_id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="font-semibold">{item.category_name}</div>
                          <div className="text-xs text-coffee-600">{item.weight_grams}g per piece</div>
                        </td>
                        <td className="py-3 px-4 text-right text-green-700 font-medium">
                          {item.total_produced}
                        </td>
                        <td className="py-3 px-4 text-right text-red-700 font-medium">
                          {item.total_taken}
                        </td>
                        <td className="py-3 px-4 text-right text-blue-700 font-medium">
                          {item.total_returned}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="text-lg font-bold text-coffee-800">
                            {item.quantity_in_stock}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right text-sm">
                          UGX {formatCurrencyUGX(item.rate_ugx)}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="font-semibold text-green-700">
                            UGX {formatCurrencyUGX(item.stock_value_ugx)}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          {stockLevel === 'out' && (
                            <Badge variant="destructive">Out of Stock</Badge>
                          )}
                          {stockLevel === 'critical' && (
                            <Badge variant="destructive">Critical</Badge>
                          )}
                          {stockLevel === 'low' && (
                            <Badge className="bg-amber-500 hover:bg-amber-600">Low Stock</Badge>
                          )}
                          {stockLevel === 'good' && (
                            <Badge className="bg-green-600 hover:bg-green-700">Good</Badge>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 bg-coffee-50 font-semibold">
                    <td className="py-3 px-4">TOTAL</td>
                    <td className="py-3 px-4 text-right text-green-700">
                      {stock.reduce((sum, item) => sum + item.total_produced, 0)}
                    </td>
                    <td className="py-3 px-4 text-right text-red-700">
                      {stock.reduce((sum, item) => sum + item.total_taken, 0)}
                    </td>
                    <td className="py-3 px-4 text-right text-blue-700">
                      {stock.reduce((sum, item) => sum + item.total_returned, 0)}
                    </td>
                    <td className="py-3 px-4 text-right text-lg text-coffee-800">
                      {totalPieces}
                    </td>
                    <td className="py-3 px-4"></td>
                    <td className="py-3 px-4 text-right text-green-700">
                      UGX {formatCurrencyUGX(totalValue)}
                    </td>
                    <td className="py-3 px-4"></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Low Stock Alert */}
      {lowStockItems.length > 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-800">
              <AlertTriangle className="h-5 w-5" />
              Low Stock Alert
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {lowStockItems.map((item) => (
                <div key={item.piece_category_id} className="flex items-center justify-between p-3 bg-white rounded-lg">
                  <div>
                    <span className="font-semibold">{item.category_name}</span>
                    <span className="text-sm text-coffee-600 ml-2">
                      Only {item.quantity_in_stock} pieces left
                    </span>
                  </div>
                  <Badge variant="destructive">
                    {item.quantity_in_stock < 20 ? 'Critical' : 'Low'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
