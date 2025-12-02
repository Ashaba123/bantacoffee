"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  getPieceCategories,
  getSales,
  createSale,
  deleteSale,
  getStockInventory,
} from "@/lib/supabase/queries";
import { formatCurrencyUGX, formatDate } from "@/lib/utils";
import { Plus, Trash2, ShoppingCart, ChevronDown, ChevronUp, CreditCard, Wallet, AlertTriangle } from "lucide-react";
import type { PieceCategory, SaleWithItems, StockInventory } from "@/lib/supabase/types";

interface SaleItemInput {
  piece_category_id: string;
  quantity_taken: number;
  quantity_sold: number;
  quantity_returned: number;
  quantity_replaced: number;
  rate_ugx: number;
}

export default function SalesPage() {
  const [categories, setCategories] = useState<PieceCategory[]>([]);
  const [sales, setSales] = useState<SaleWithItems[]>([]);
  const [stock, setStock] = useState<StockInventory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [expandedSale, setExpandedSale] = useState<string | null>(null);
  
  // Form state
  const [saleDate, setSaleDate] = useState(new Date().toISOString().split('T')[0]);
  const [routeName, setRouteName] = useState("");
  const [buyerName, setBuyerName] = useState("");
  const [paymentType, setPaymentType] = useState<'cash' | 'credit'>('cash');
  const [debtorAmount, setDebtorAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<SaleItemInput[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [categoriesData, salesData, stockData] = await Promise.all([
        getPieceCategories(),
        getSales(),
        getStockInventory(),
      ]);
      setCategories(categoriesData);
      setSales(salesData);
      setStock(stockData);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  }

  function addItem() {
    if (categories.length === 0) return;
    setItems([
      ...items,
      {
        piece_category_id: categories[0].id,
        quantity_taken: 0,
        quantity_sold: 0,
        quantity_returned: 0,
        quantity_replaced: 0,
        rate_ugx: categories[0].rate_ugx,
      },
    ]);
  }

  function removeItem(index: number) {
    setItems(items.filter((_, i) => i !== index));
  }

  function updateItem(index: number, field: keyof SaleItemInput, value: string | number) {
    const newItems = [...items];
    if (field === 'piece_category_id' && typeof value === 'string') {
      const category = categories.find(c => c.id === value);
      if (category) {
        newItems[index] = {
          ...newItems[index],
          piece_category_id: value,
          rate_ugx: category.rate_ugx,
        };
      }
    } else {
      newItems[index] = { ...newItems[index], [field]: value };
      
      // Auto-calculate returned quantity: Returned = Taken - Sold - Replaced
      if (field === 'quantity_taken' || field === 'quantity_sold' || field === 'quantity_replaced') {
        const item = newItems[index];
        const returned = Math.max(0, item.quantity_taken - item.quantity_sold - item.quantity_replaced);
        newItems[index].quantity_returned = returned;
      }
    }
    setItems(newItems);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (items.length === 0) {
      alert("Please add at least one item");
      return;
    }

    // Validate quantities
    for (const item of items) {
      if (item.quantity_taken < 0 || item.quantity_sold < 0 || item.quantity_returned < 0 || item.quantity_replaced < 0) {
        alert("All quantities must be zero or positive");
        return;
      }
      const total = item.quantity_sold + item.quantity_returned + item.quantity_replaced;
      if (total !== item.quantity_taken) {
        alert(`Invalid quantities: Taken (${item.quantity_taken}) must equal Sold + Returned + Replaced (${total})`);
        return;
      }
      
      // Check stock availability
      const stockItem = stock.find(s => s.piece_category_id === item.piece_category_id);
      const availableStock = stockItem?.quantity_in_stock || 0;
      if (item.quantity_taken > availableStock) {
        const category = categories.find(c => c.id === item.piece_category_id);
        alert(`Insufficient stock for ${category?.name}: Only ${availableStock} pieces available, but you're trying to take ${item.quantity_taken}`);
        return;
      }
    }

    const debtorAmountNum = paymentType === 'credit' ? parseInt(debtorAmount) || 0 : 0;

    try {
      await createSale({
        sale_date: saleDate,
        route_name: routeName || undefined,
        buyer_name: buyerName || undefined,
        payment_type: paymentType,
        debtor_amount_ugx: debtorAmountNum,
        notes: notes || undefined,
        items,
      });
      
      // Reset form
      setSaleDate(new Date().toISOString().split('T')[0]);
      setRouteName("");
      setBuyerName("");
      setPaymentType('cash');
      setDebtorAmount("");
      setNotes("");
      setItems([]);
      setShowForm(false);
      
      loadData();
    } catch (error) {
      console.error("Error creating sale:", error);
      alert("Error creating sale record");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this sale? Stock will be adjusted accordingly.")) return;
    
    try {
      await deleteSale(id);
      loadData();
    } catch (error) {
      console.error("Error deleting sale:", error);
      alert("Error deleting sale record");
    }
  }

  function toggleExpanded(id: string) {
    setExpandedSale(expandedSale === id ? null : id);
  }

  const totalSalesAmount = items.reduce((sum, item) => sum + (item.quantity_sold * item.rate_ugx), 0);
  const totalPiecesSold = items.reduce((sum, item) => sum + item.quantity_sold, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-coffee-600">Loading sales...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-coffee-800 mb-2">Sales & Stock Out</h1>
          <p className="text-coffee-600">Record sales with returns and replacements</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-2" />
          New Sale
        </Button>
      </div>

      {/* Sale Form */}
      {showForm && (
        <Card className="coffee-texture">
          <CardHeader>
            <CardTitle>New Sale Record</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="date">Sale Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={saleDate}
                    onChange={(e) => setSaleDate(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="route">Route/Location (Optional)</Label>
                  <Input
                    id="route"
                    value={routeName}
                    onChange={(e) => setRouteName(e.target.value)}
                    placeholder="e.g., Mityana Route"
                  />
                </div>
                <div>
                  <Label htmlFor="buyer">Buyer Name (Optional)</Label>
                  <Input
                    id="buyer"
                    value={buyerName}
                    onChange={(e) => setBuyerName(e.target.value)}
                    placeholder="Customer name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="payment">Payment Type</Label>
                  <select
                    id="payment"
                    value={paymentType}
                    onChange={(e) => setPaymentType(e.target.value as 'cash' | 'credit')}
                    className="w-full px-3 py-2 border rounded-md"
                    required
                  >
                    <option value="cash">Cash</option>
                    <option value="credit">Credit (Debtor)</option>
                  </select>
                </div>
                {paymentType === 'credit' && (
                  <div>
                    <Label htmlFor="debtor">Debtor Amount (UGX)</Label>
                    <Input
                      id="debtor"
                      type="number"
                      min="0"
                      value={debtorAmount}
                      onChange={(e) => setDebtorAmount(e.target.value)}
                      placeholder="0"
                      required
                    />
                  </div>
                )}
                <div>
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Input
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Sale notes..."
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <Label>Sale Items</Label>
                  <Button type="button" onClick={addItem} size="sm" variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Item
                  </Button>
                </div>

                {items.length === 0 ? (
                  <div className="text-center py-8 text-coffee-600 border-2 border-dashed rounded-lg">
                    No items added. Click "Add Item" to start.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {items.map((item, index) => {
                      const category = categories.find(c => c.id === item.piece_category_id);
                      const stockItem = stock.find(s => s.piece_category_id === item.piece_category_id);
                      const availableStock = stockItem?.quantity_in_stock || 0;
                      const amount = item.quantity_sold * item.rate_ugx;
                      const isOverStock = item.quantity_taken > availableStock;
                      
                      return (
                        <div key={index} className={`p-4 border rounded-lg bg-white space-y-3 ${isOverStock ? 'border-red-300 bg-red-50' : ''}`}>
                          <div className="flex gap-3 items-end">
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <Label className="text-xs">Category</Label>
                                <div className="flex items-center gap-1 text-xs">
                                  {availableStock === 0 ? (
                                    <Badge variant="destructive" className="text-xs">
                                      <AlertTriangle className="h-3 w-3 mr-1" />
                                      Out of Stock
                                    </Badge>
                                  ) : availableStock < 20 ? (
                                    <Badge variant="secondary" className="text-xs bg-amber-100 text-amber-800">
                                      {availableStock} available
                                    </Badge>
                                  ) : (
                                    <span className="text-coffee-600">{availableStock} in stock</span>
                                  )}
                                </div>
                              </div>
                              <select
                                value={item.piece_category_id}
                                onChange={(e) => updateItem(index, 'piece_category_id', e.target.value)}
                                className="w-full px-3 py-2 border rounded-md"
                                required
                              >
                                {categories.map((cat) => {
                                  const catStock = stock.find(s => s.piece_category_id === cat.id);
                                  const catAvailable = catStock?.quantity_in_stock || 0;
                                  return (
                                    <option key={cat.id} value={cat.id}>
                                      {cat.name} ({catAvailable} available)
                                    </option>
                                  );
                                })}
                              </select>
                            </div>
                            <div className="w-24">
                              <Label className="text-xs">Rate (UGX)</Label>
                              <Input
                                type="number"
                                min="0"
                                value={item.rate_ugx || ""}
                                onChange={(e) => updateItem(index, 'rate_ugx', parseInt(e.target.value) || 0)}
                                placeholder="0"
                                required
                              />
                            </div>
                            <Button
                              type="button"
                              onClick={() => removeItem(index)}
                              variant="destructive"
                              size="sm"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                            <div>
                              <Label className="text-xs">Taken</Label>
                              <Input
                                type="number"
                                min="0"
                                max={availableStock}
                                value={item.quantity_taken || ""}
                                onChange={(e) => updateItem(index, 'quantity_taken', parseInt(e.target.value) || 0)}
                                placeholder="0"
                                className={isOverStock ? 'border-red-500' : ''}
                                required
                              />
                              {isOverStock && (
                                <p className="text-xs text-red-600 mt-1">
                                  Max: {availableStock}
                                </p>
                              )}
                            </div>
                            <div>
                              <Label className="text-xs text-green-700">Sold</Label>
                              <Input
                                type="number"
                                min="0"
                                value={item.quantity_sold || ""}
                                onChange={(e) => updateItem(index, 'quantity_sold', parseInt(e.target.value) || 0)}
                                placeholder="0"
                                className="border-green-300"
                                required
                              />
                            </div>
                            <div>
                              <Label className="text-xs text-blue-700">Returned</Label>
                              <Input
                                type="number"
                                min="0"
                                value={item.quantity_returned || ""}
                                placeholder="0"
                                className="border-blue-300 bg-gray-50"
                                disabled
                                title="Auto-calculated: Taken - Sold - Replaced"
                              />
                            </div>
                            <div>
                              <Label className="text-xs text-amber-700">Replaced</Label>
                              <Input
                                type="number"
                                min="0"
                                value={item.quantity_replaced || ""}
                                onChange={(e) => updateItem(index, 'quantity_replaced', parseInt(e.target.value) || 0)}
                                placeholder="0"
                                className="border-amber-300"
                              />
                            </div>
                            <div>
                              <Label className="text-xs">Amount</Label>
                              <div className="px-3 py-2 border rounded-md bg-gray-50 text-sm font-semibold">
                                {formatCurrencyUGX(amount)}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {items.length > 0 && (
                <div className="flex justify-between items-center p-4 bg-coffee-50 rounded-lg">
                  <div className="text-lg font-semibold">
                    Total: {totalPiecesSold} pieces sold
                  </div>
                  <div className="text-lg font-semibold text-green-700">
                    UGX {formatCurrencyUGX(totalSalesAmount)}
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <Button type="submit">
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Save Sale
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Sales History */}
      <Card className="coffee-texture">
        <CardHeader>
          <CardTitle>Sales History</CardTitle>
        </CardHeader>
        <CardContent>
          {sales.length === 0 ? (
            <div className="text-center py-8 text-coffee-600">
              No sales records yet. Create your first one!
            </div>
          ) : (
            <div className="space-y-3">
              {sales.map((sale) => {
                const totalQtySold = sale.sale_items.reduce((sum, item) => sum + item.quantity_sold, 0);
                const isExpanded = expandedSale === sale.id;

                return (
                  <div key={sale.id} className="border rounded-lg bg-white overflow-hidden">
                    <div
                      className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50"
                      onClick={() => toggleExpanded(sale.id)}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <span className="font-semibold">{formatDate(sale.sale_date)}</span>
                          {sale.route_name && (
                            <Badge variant="secondary">{sale.route_name}</Badge>
                          )}
                          {sale.buyer_name && (
                            <span className="text-sm text-coffee-600">• {sale.buyer_name}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant={sale.payment_type === 'cash' ? 'default' : 'destructive'}>
                            {sale.payment_type === 'cash' ? (
                              <><Wallet className="h-3 w-3 mr-1" /> Cash</>
                            ) : (
                              <><CreditCard className="h-3 w-3 mr-1" /> Credit</>
                            )}
                          </Badge>
                          {sale.payment_type === 'credit' && (
                            <span className="text-sm text-red-600 font-semibold">
                              Debtor: UGX {formatCurrencyUGX(sale.debtor_amount_ugx)}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="font-semibold text-green-700 text-lg">
                            UGX {formatCurrencyUGX(sale.total_amount_ugx)}
                          </div>
                          <div className="text-xs text-coffee-600">
                            {totalQtySold} pieces • {sale.sale_items.length} item types
                          </div>
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="h-5 w-5 text-coffee-600" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-coffee-600" />
                        )}
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="border-t bg-gray-50 p-4">
                        <table className="w-full">
                          <thead>
                            <tr className="text-left text-sm text-coffee-600 border-b">
                              <th className="pb-2">Category</th>
                              <th className="pb-2 text-right">Taken</th>
                              <th className="pb-2 text-right">Sold</th>
                              <th className="pb-2 text-right">Returned</th>
                              <th className="pb-2 text-right">Replaced</th>
                              <th className="pb-2 text-right">Rate</th>
                              <th className="pb-2 text-right">Amount</th>
                            </tr>
                          </thead>
                          <tbody className="text-sm">
                            {sale.sale_items.map((item) => (
                              <tr key={item.id} className="border-b last:border-0">
                                <td className="py-2">{item.piece_categories.name}</td>
                                <td className="py-2 text-right">{item.quantity_taken}</td>
                                <td className="py-2 text-right text-green-700 font-semibold">{item.quantity_sold}</td>
                                <td className="py-2 text-right text-blue-700">{item.quantity_returned}</td>
                                <td className="py-2 text-right text-amber-700">{item.quantity_replaced}</td>
                                <td className="py-2 text-right">UGX {formatCurrencyUGX(item.rate_ugx)}</td>
                                <td className="py-2 text-right font-semibold">
                                  UGX {formatCurrencyUGX(item.amount_ugx)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        {sale.notes && (
                          <div className="mt-3 p-2 bg-blue-50 rounded text-sm">
                            <strong>Notes:</strong> {sale.notes}
                          </div>
                        )}
                        <div className="mt-4 flex justify-end">
                          <Button
                            onClick={() => handleDelete(sale.id)}
                            variant="destructive"
                            size="sm"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
