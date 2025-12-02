"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  getExpenses,
  getExpenseTypes,
  createExpense,
  updateExpense,
  deleteExpense,
  getSales,
} from "@/lib/supabase/queries";
import { formatCurrencyUGX, formatDate } from "@/lib/utils";
import { Plus, Trash2, Edit2, Receipt, Check, X } from "lucide-react";
import type { ExpenseWithType, ExpenseType, Sale } from "@/lib/supabase/types";

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<ExpenseWithType[]>([]);
  const [expenseTypes, setExpenseTypes] = useState<ExpenseType[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState<string | null>(null);
  
  // Form state
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);
  const [expenseTypeId, setExpenseTypeId] = useState("");
  const [amount, setAmount] = useState("");
  const [saleId, setSaleId] = useState("");
  const [notes, setNotes] = useState("");

  // Edit state
  const [editDate, setEditDate] = useState("");
  const [editTypeId, setEditTypeId] = useState("");
  const [editAmount, setEditAmount] = useState("");
  const [editNotes, setEditNotes] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [expensesData, typesData, salesData] = await Promise.all([
        getExpenses(),
        getExpenseTypes(),
        getSales(20), // Get recent sales for linking
      ]);
      setExpenses(expensesData);
      setExpenseTypes(typesData);
      setSales(salesData);
      
      if (typesData.length > 0 && !expenseTypeId) {
        setExpenseTypeId(typesData[0].id);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!expenseTypeId || !amount) {
      alert("Please fill required fields");
      return;
    }

    try {
      await createExpense({
        expense_date: expenseDate,
        expense_type_id: expenseTypeId,
        amount_ugx: parseInt(amount),
        sale_id: saleId || undefined,
        notes: notes || undefined,
      });
      
      // Reset form
      setExpenseDate(new Date().toISOString().split('T')[0]);
      setAmount("");
      setSaleId("");
      setNotes("");
      setShowForm(false);
      
      loadData();
    } catch (error) {
      console.error("Error creating expense:", error);
      alert("Error creating expense");
    }
  }

  async function handleUpdate(id: string) {
    try {
      await updateExpense(id, {
        expense_date: editDate,
        expense_type_id: editTypeId,
        amount_ugx: parseInt(editAmount),
        notes: editNotes || undefined,
      });
      
      setEditingExpense(null);
      loadData();
    } catch (error) {
      console.error("Error updating expense:", error);
      alert("Error updating expense");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this expense?")) return;
    
    try {
      await deleteExpense(id);
      loadData();
    } catch (error) {
      console.error("Error deleting expense:", error);
      alert("Error deleting expense");
    }
  }

  function startEdit(expense: ExpenseWithType) {
    setEditingExpense(expense.id);
    setEditDate(expense.expense_date);
    setEditTypeId(expense.expense_type_id);
    setEditAmount(expense.amount_ugx.toString());
    setEditNotes(expense.notes || "");
  }

  function cancelEdit() {
    setEditingExpense(null);
    setEditDate("");
    setEditTypeId("");
    setEditAmount("");
    setEditNotes("");
  }

  // Calculate summary by expense type
  const expenseSummary = expenseTypes.map(type => {
    const typeExpenses = expenses.filter(e => e.expense_type_id === type.id);
    const total = typeExpenses.reduce((sum, e) => sum + e.amount_ugx, 0);
    return { type: type.name, total, count: typeExpenses.length };
  }).filter(s => s.count > 0);

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount_ugx, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-coffee-600">Loading expenses...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-coffee-800 mb-2">Expenses</h1>
          <p className="text-coffee-600">Track all business expenses</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-2" />
          New Expense
        </Button>
      </div>

      {/* Expense Summary */}
      <Card className="coffee-texture">
        <CardHeader>
          <CardTitle>Expense Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {expenseSummary.map((summary) => (
              <div key={summary.type} className="p-3 border rounded-lg bg-white">
                <div className="text-sm text-coffee-600 mb-1">{summary.type}</div>
                <div className="font-semibold text-lg">UGX {formatCurrencyUGX(summary.total)}</div>
                <div className="text-xs text-coffee-500">{summary.count} entries</div>
              </div>
            ))}
            <div className="p-3 border-2 border-coffee-300 rounded-lg bg-coffee-50">
              <div className="text-sm text-coffee-600 mb-1 font-semibold">TOTAL</div>
              <div className="font-bold text-xl text-red-700">UGX {formatCurrencyUGX(totalExpenses)}</div>
              <div className="text-xs text-coffee-600">{expenses.length} entries</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Expense Form */}
      {showForm && (
        <Card className="coffee-texture">
          <CardHeader>
            <CardTitle>New Expense</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date">Expense Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={expenseDate}
                    onChange={(e) => setExpenseDate(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="type">Expense Type</Label>
                  <select
                    id="type"
                    value={expenseTypeId}
                    onChange={(e) => setExpenseTypeId(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                    required
                  >
                    <option value="">Select type...</option>
                    {expenseTypes.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="amount">Amount (UGX)</Label>
                  <Input
                    id="amount"
                    type="number"
                    min="0"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="sale">Link to Sale (Optional)</Label>
                  <select
                    id="sale"
                    value={saleId}
                    onChange={(e) => setSaleId(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="">None</option>
                    {sales.map((sale) => (
                      <option key={sale.id} value={sale.id}>
                        {formatDate(sale.sale_date)} - {sale.buyer_name || 'Sale'} - UGX {formatCurrencyUGX(sale.total_amount_ugx)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Input
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Expense details..."
                />
              </div>

              <div className="flex gap-3">
                <Button type="submit">
                  <Receipt className="h-4 w-4 mr-2" />
                  Save Expense
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Expenses List */}
      <Card className="coffee-texture">
        <CardHeader>
          <CardTitle>All Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          {expenses.length === 0 ? (
            <div className="text-center py-8 text-coffee-600">
              No expenses recorded yet. Add your first one!
            </div>
          ) : (
            <div className="space-y-2">
              {expenses.map((expense) => {
                const isEditing = editingExpense === expense.id;
                const linkedSale = expense.sale_id ? sales.find(s => s.id === expense.sale_id) : null;

                return (
                  <div key={expense.id} className="border rounded-lg bg-white">
                    {isEditing ? (
                      <div className="p-4 space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <Input
                            type="date"
                            value={editDate}
                            onChange={(e) => setEditDate(e.target.value)}
                            required
                          />
                          <select
                            value={editTypeId}
                            onChange={(e) => setEditTypeId(e.target.value)}
                            className="px-3 py-2 border rounded-md"
                            required
                          >
                            {expenseTypes.map((type) => (
                              <option key={type.id} value={type.id}>
                                {type.name}
                              </option>
                            ))}
                          </select>
                          <Input
                            type="number"
                            min="0"
                            value={editAmount}
                            onChange={(e) => setEditAmount(e.target.value)}
                            placeholder="Amount"
                            required
                          />
                        </div>
                        <Input
                          value={editNotes}
                          onChange={(e) => setEditNotes(e.target.value)}
                          placeholder="Notes"
                        />
                        <div className="flex gap-2">
                          <Button onClick={() => handleUpdate(expense.id)} size="sm">
                            <Check className="h-4 w-4 mr-2" />
                            Save
                          </Button>
                          <Button onClick={cancelEdit} variant="outline" size="sm">
                            <X className="h-4 w-4 mr-2" />
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <span className="font-semibold">{formatDate(expense.expense_date)}</span>
                            <Badge>{expense.expense_types.name}</Badge>
                            {linkedSale && (
                              <Badge variant="secondary">
                                Linked to {linkedSale.buyer_name || 'Sale'}
                              </Badge>
                            )}
                          </div>
                          {expense.notes && (
                            <p className="text-sm text-coffee-600">{expense.notes}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="font-semibold text-lg text-red-700">
                            UGX {formatCurrencyUGX(expense.amount_ugx)}
                          </div>
                          <div className="flex gap-2">
                            <Button onClick={() => startEdit(expense)} variant="outline" size="sm">
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button onClick={() => handleDelete(expense.id)} variant="destructive" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
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
