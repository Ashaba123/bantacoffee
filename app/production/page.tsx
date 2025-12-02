"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  getPieceCategories,
  getProductionRecords,
  createProduction,
  deleteProduction,
} from "@/lib/supabase/queries";
import { formatCurrencyUGX, formatDate } from "@/lib/utils";
import { Plus, Trash2, Package, ChevronDown, ChevronUp } from "lucide-react";
import type { PieceCategory, ProductionRecordWithItems } from "@/lib/supabase/types";

interface ProductionItem {
  piece_category_id: string;
  quantity: number;
  rate_ugx: number;
}

export default function ProductionPage() {
  const [categories, setCategories] = useState<PieceCategory[]>([]);
  const [productions, setProductions] = useState<ProductionRecordWithItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [expandedProduction, setExpandedProduction] = useState<string | null>(null);
  
  // Form state
  const [productionDate, setProductionDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<ProductionItem[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [categoriesData, productionsData] = await Promise.all([
        getPieceCategories(),
        getProductionRecords(),
      ]);
      setCategories(categoriesData);
      setProductions(productionsData);
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
        quantity: 0,
        rate_ugx: categories[0].rate_ugx,
      },
    ]);
  }

  function removeItem(index: number) {
    setItems(items.filter((_, i) => i !== index));
  }

  function updateItem(index: number, field: keyof ProductionItem, value: string | number) {
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
    }
    setItems(newItems);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (items.length === 0) {
      alert("Please add at least one item");
      return;
    }

    if (items.some(item => item.quantity <= 0)) {
      alert("All quantities must be greater than 0");
      return;
    }

    try {
      await createProduction({
        production_date: productionDate,
        notes: notes || undefined,
        items,
      });
      
      // Reset form
      setProductionDate(new Date().toISOString().split('T')[0]);
      setNotes("");
      setItems([]);
      setShowForm(false);
      
      loadData();
    } catch (error) {
      console.error("Error creating production:", error);
      alert("Error creating production record");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this production record?")) return;
    
    try {
      await deleteProduction(id);
      loadData();
    } catch (error) {
      console.error("Error deleting production:", error);
      alert("Error deleting production record");
    }
  }

  function toggleExpanded(id: string) {
    setExpandedProduction(expandedProduction === id ? null : id);
  }

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = items.reduce((sum, item) => sum + (item.quantity * item.rate_ugx), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-coffee-600">Loading production records...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-coffee-800 mb-2">Production</h1>
          <p className="text-coffee-600">Record coffee pieces produced</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-2" />
          New Production
        </Button>
      </div>

      {/* Production Form */}
      {showForm && (
        <Card className="coffee-texture">
          <CardHeader>
            <CardTitle>New Production Record</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date">Production Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={productionDate}
                    onChange={(e) => setProductionDate(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Input
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Batch notes..."
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <Label>Production Items</Label>
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
                      return (
                        <div key={index} className="flex gap-3 items-end p-3 border rounded-lg bg-white">
                          <div className="flex-1">
                            <Label className="text-xs">Category</Label>
                            <select
                              value={item.piece_category_id}
                              onChange={(e) => updateItem(index, 'piece_category_id', e.target.value)}
                              className="w-full px-3 py-2 border rounded-md"
                              required
                            >
                              {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                  {cat.name}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="w-32">
                            <Label className="text-xs">Quantity</Label>
                            <Input
                              type="number"
                              min="1"
                              value={item.quantity || ""}
                              onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                              placeholder="0"
                              required
                            />
                          </div>
                          <div className="w-32">
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
                          <div className="w-32">
                            <Label className="text-xs">Amount</Label>
                            <div className="px-3 py-2 border rounded-md bg-gray-50 text-sm">
                              {formatCurrencyUGX(item.quantity * item.rate_ugx)}
                            </div>
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
                      );
                    })}
                  </div>
                )}
              </div>

              {items.length > 0 && (
                <div className="flex justify-between items-center p-4 bg-coffee-50 rounded-lg">
                  <div className="text-lg font-semibold">
                    Total: {totalItems} pieces
                  </div>
                  <div className="text-lg font-semibold text-green-700">
                    UGX {formatCurrencyUGX(totalAmount)}
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <Button type="submit">
                  <Package className="h-4 w-4 mr-2" />
                  Save Production
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Production History */}
      <Card className="coffee-texture">
        <CardHeader>
          <CardTitle>Production History</CardTitle>
        </CardHeader>
        <CardContent>
          {productions.length === 0 ? (
            <div className="text-center py-8 text-coffee-600">
              No production records yet. Create your first one!
            </div>
          ) : (
            <div className="space-y-3">
              {productions.map((production) => {
                const totalQty = production.production_items.reduce((sum, item) => sum + item.quantity, 0);
                const totalAmt = production.production_items.reduce((sum, item) => sum + item.amount_ugx, 0);
                const isExpanded = expandedProduction === production.id;

                return (
                  <div key={production.id} className="border rounded-lg bg-white overflow-hidden">
                    <div
                      className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50"
                      onClick={() => toggleExpanded(production.id)}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <span className="font-semibold">{formatDate(production.production_date)}</span>
                          <Badge variant="secondary">{totalQty} pieces</Badge>
                        </div>
                        {production.notes && (
                          <p className="text-sm text-coffee-600">{production.notes}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="font-semibold text-green-700">
                            UGX {formatCurrencyUGX(totalAmt)}
                          </div>
                          <div className="text-xs text-coffee-600">
                            {production.production_items.length} item types
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
                              <th className="pb-2 text-right">Quantity</th>
                              <th className="pb-2 text-right">Rate</th>
                              <th className="pb-2 text-right">Amount</th>
                            </tr>
                          </thead>
                          <tbody className="text-sm">
                            {production.production_items.map((item) => (
                              <tr key={item.id} className="border-b last:border-0">
                                <td className="py-2">{item.piece_categories.name}</td>
                                <td className="py-2 text-right">{item.quantity}</td>
                                <td className="py-2 text-right">UGX {formatCurrencyUGX(item.rate_ugx)}</td>
                                <td className="py-2 text-right font-semibold">
                                  UGX {formatCurrencyUGX(item.amount_ugx)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        <div className="mt-4 flex justify-end">
                          <Button
                            onClick={() => handleDelete(production.id)}
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
