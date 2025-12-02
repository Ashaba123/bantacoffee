"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  getPieceCategories,
  createPieceCategory,
  updatePieceCategory,
  getExpenseTypes,
  createExpenseType,
  updateExpenseType,
} from "@/lib/supabase/queries";
import { formatCurrencyUGX } from "@/lib/utils";
import { Plus, Edit2, Check, X, Package, DollarSign } from "lucide-react";
import type { PieceCategory, ExpenseType } from "@/lib/supabase/types";

export default function SettingsPage() {
  const [categories, setCategories] = useState<PieceCategory[]>([]);
  const [expenseTypes, setExpenseTypes] = useState<ExpenseType[]>([]);
  const [loading, setLoading] = useState(true);
  
  // New category state
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: "", weight_grams: "", rate_ugx: "" });
  
  // New expense type state
  const [showNewExpenseType, setShowNewExpenseType] = useState(false);
  const [newExpenseType, setNewExpenseType] = useState("");
  
  // Edit state
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editCategoryData, setEditCategoryData] = useState<Partial<PieceCategory>>({});

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [categoriesData, expenseTypesData] = await Promise.all([
        getPieceCategories(false), // Get all including inactive
        getExpenseTypes(false),
      ]);
      setCategories(categoriesData);
      setExpenseTypes(expenseTypesData);
    } catch (error) {
      console.error("Error loading settings:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateCategory() {
    if (!newCategory.name || !newCategory.weight_grams || !newCategory.rate_ugx) {
      alert("Please fill all fields");
      return;
    }

    try {
      await createPieceCategory({
        name: newCategory.name,
        weight_grams: parseInt(newCategory.weight_grams),
        rate_ugx: parseInt(newCategory.rate_ugx),
      });
      setNewCategory({ name: "", weight_grams: "", rate_ugx: "" });
      setShowNewCategory(false);
      loadData();
    } catch (error) {
      console.error("Error creating category:", error);
      alert("Error creating category");
    }
  }

  async function handleUpdateCategory(id: string) {
    try {
      await updatePieceCategory(id, editCategoryData);
      setEditingCategory(null);
      setEditCategoryData({});
      loadData();
    } catch (error) {
      console.error("Error updating category:", error);
      alert("Error updating category");
    }
  }

  async function toggleCategoryActive(id: string, currentActive: boolean) {
    try {
      await updatePieceCategory(id, { is_active: !currentActive });
      loadData();
    } catch (error) {
      console.error("Error toggling category:", error);
      alert("Error updating category");
    }
  }

  async function handleCreateExpenseType() {
    if (!newExpenseType.trim()) {
      alert("Please enter an expense type name");
      return;
    }

    try {
      await createExpenseType(newExpenseType);
      setNewExpenseType("");
      setShowNewExpenseType(false);
      loadData();
    } catch (error) {
      console.error("Error creating expense type:", error);
      alert("Error creating expense type");
    }
  }

  async function toggleExpenseTypeActive(id: string, currentActive: boolean) {
    try {
      await updateExpenseType(id, { is_active: !currentActive });
      loadData();
    } catch (error) {
      console.error("Error toggling expense type:", error);
      alert("Error updating expense type");
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-coffee-600">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-coffee-800 mb-2">Settings</h1>
        <p className="text-coffee-600">Manage piece categories and expense types</p>
      </div>

      {/* Piece Categories */}
      <Card className="coffee-texture">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Piece Categories
              </CardTitle>
              <CardDescription>
                Manage coffee piece sizes and rates
              </CardDescription>
            </div>
            <Button onClick={() => setShowNewCategory(!showNewCategory)} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Category
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* New Category Form */}
          {showNewCategory && (
            <div className="mb-6 p-4 border rounded-lg bg-coffee-50">
              <h3 className="font-semibold mb-4">New Category</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <Label>Name (e.g., 100g)</Label>
                  <Input
                    value={newCategory.name}
                    onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                    placeholder="100g"
                  />
                </div>
                <div>
                  <Label>Weight (grams)</Label>
                  <Input
                    type="number"
                    value={newCategory.weight_grams}
                    onChange={(e) => setNewCategory({ ...newCategory, weight_grams: e.target.value })}
                    placeholder="100"
                  />
                </div>
                <div>
                  <Label>Rate (UGX)</Label>
                  <Input
                    type="number"
                    value={newCategory.rate_ugx}
                    onChange={(e) => setNewCategory({ ...newCategory, rate_ugx: e.target.value })}
                    placeholder="5000"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleCreateCategory} size="sm">
                  <Check className="h-4 w-4 mr-2" />
                  Save
                </Button>
                <Button onClick={() => setShowNewCategory(false)} variant="outline" size="sm">
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Categories List */}
          <div className="space-y-3">
            {categories.map((category) => (
              <div
                key={category.id}
                className="flex items-center justify-between p-4 border rounded-lg bg-white"
              >
                {editingCategory === category.id ? (
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input
                      defaultValue={category.name}
                      onChange={(e) => setEditCategoryData({ ...editCategoryData, name: e.target.value })}
                      placeholder="Name"
                    />
                    <Input
                      type="number"
                      defaultValue={category.weight_grams}
                      onChange={(e) => setEditCategoryData({ ...editCategoryData, weight_grams: parseInt(e.target.value) })}
                      placeholder="Weight (g)"
                    />
                    <Input
                      type="number"
                      defaultValue={category.rate_ugx}
                      onChange={(e) => setEditCategoryData({ ...editCategoryData, rate_ugx: parseInt(e.target.value) })}
                      placeholder="Rate (UGX)"
                    />
                  </div>
                ) : (
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h4 className="font-semibold text-lg">{category.name}</h4>
                      {!category.is_active && (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </div>
                    <p className="text-sm text-coffee-600">
                      Weight: {category.weight_grams}g | Rate: UGX {formatCurrencyUGX(category.rate_ugx)}
                    </p>
                  </div>
                )}

                <div className="flex gap-2">
                  {editingCategory === category.id ? (
                    <>
                      <Button onClick={() => handleUpdateCategory(category.id)} size="sm">
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        onClick={() => {
                          setEditingCategory(null);
                          setEditCategoryData({});
                        }}
                        variant="outline"
                        size="sm"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        onClick={() => {
                          setEditingCategory(category.id);
                          setEditCategoryData(category);
                        }}
                        variant="outline"
                        size="sm"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        onClick={() => toggleCategoryActive(category.id, category.is_active)}
                        variant={category.is_active ? "outline" : "default"}
                        size="sm"
                      >
                        {category.is_active ? "Deactivate" : "Activate"}
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Expense Types */}
      <Card className="coffee-texture">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Expense Types
              </CardTitle>
              <CardDescription>
                Manage expense categories
              </CardDescription>
            </div>
            <Button onClick={() => setShowNewExpenseType(!showNewExpenseType)} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Type
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* New Expense Type Form */}
          {showNewExpenseType && (
            <div className="mb-6 p-4 border rounded-lg bg-coffee-50">
              <h3 className="font-semibold mb-4">New Expense Type</h3>
              <div className="flex gap-2 mb-4">
                <Input
                  value={newExpenseType}
                  onChange={(e) => setNewExpenseType(e.target.value)}
                  placeholder="Expense type name"
                  className="flex-1"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleCreateExpenseType} size="sm">
                  <Check className="h-4 w-4 mr-2" />
                  Save
                </Button>
                <Button onClick={() => setShowNewExpenseType(false)} variant="outline" size="sm">
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Expense Types Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {expenseTypes.map((type) => (
              <div
                key={type.id}
                className={`p-3 border rounded-lg flex items-center justify-between ${
                  type.is_active ? 'bg-white' : 'bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className={type.is_active ? 'font-medium' : 'text-gray-500'}>
                    {type.name}
                  </span>
                  {type.is_predefined && (
                    <Badge variant="secondary" className="text-xs">Default</Badge>
                  )}
                  {!type.is_active && (
                    <Badge variant="secondary" className="text-xs">Inactive</Badge>
                  )}
                </div>
                {!type.is_predefined && (
                  <Button
                    onClick={() => toggleExpenseTypeActive(type.id, type.is_active)}
                    variant="ghost"
                    size="sm"
                  >
                    {type.is_active ? (
                      <X className="h-4 w-4 text-red-600" />
                    ) : (
                      <Check className="h-4 w-4 text-green-600" />
                    )}
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
