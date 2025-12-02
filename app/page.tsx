"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getDashboardStats } from "@/lib/supabase/queries";
import { formatCurrencyUGX } from "@/lib/utils";
import {
  Coffee,
  Package,
  TrendingUp,
  DollarSign,
  Receipt,
  Wallet,
  ShoppingCart,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";

interface DashboardStats {
  currentStock: number;
  currentStockValue: number;
  totalProduction: number;
  totalStockSold: number;
  totalRevenue: number;
  totalDebtors: number;
  totalExpenses: number;
  netProfit: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    currentStock: 0,
    currentStockValue: 0,
    totalProduction: 0,
    totalStockSold: 0,
    totalRevenue: 0,
    totalDebtors: 0,
    totalExpenses: 0,
    netProfit: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStats();
    
    // Refresh every 60 seconds
    const interval = setInterval(loadStats, 60000);
    return () => clearInterval(interval);
  }, []);

  async function loadStats() {
    try {
      const data = await getDashboardStats();
      setStats(data);
      setError(null);
    } catch (err) {
      setError("Failed to load dashboard data. Please check your Supabase connection.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Coffee className="w-12 h-12 text-coffee-500 mx-auto mb-4 animate-pulse" />
          <p className="text-coffee-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 border border-red-200 p-6">
        <h3 className="text-lg font-semibold text-red-800 mb-2 flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          Connection Error
        </h3>
        <p className="text-red-600 mb-4">{error}</p>
        <p className="text-sm text-red-700">
          Make sure you have:
          <ul className="list-disc ml-6 mt-2 space-y-1">
            <li>Created a Supabase project</li>
            <li>Run the SQL script from superbase/piece-based-schema.sql</li>
            <li>Added your Supabase credentials to .env.local</li>
          </ul>
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-coffee-800 mb-2">Dashboard</h1>
        <p className="text-coffee-600">Welcome to Banta Coffee Inventory Management</p>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="card-hover coffee-texture">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Stock</CardTitle>
            <Package className="h-4 w-4 text-coffee-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-coffee-800">
              {stats.currentStock} pieces
            </div>
            <div className="text-xs text-coffee-600 mt-2">
              Value: UGX {formatCurrencyUGX(stats.currentStockValue)}
            </div>
            <Link href="/inventory">
              <Badge variant="secondary" className="mt-2 cursor-pointer hover:bg-coffee-200">
                View Inventory →
              </Badge>
            </Link>
          </CardContent>
        </Card>

        <Card className="card-hover coffee-texture">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Production (This Month)</CardTitle>
            <Coffee className="h-4 w-4 text-coffee-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-coffee-800">
              {stats.totalProduction} pieces
            </div>
            <p className="text-xs text-coffee-600 mt-2">Coffee pieces produced</p>
            <Link href="/production">
              <Badge variant="secondary" className="mt-2 cursor-pointer hover:bg-coffee-200">
                Record Production →
              </Badge>
            </Link>
          </CardContent>
        </Card>

        <Card className="card-hover coffee-texture">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pieces Sold (This Month)</CardTitle>
            <ShoppingCart className="h-4 w-4 text-coffee-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-coffee-800">
              {stats.totalStockSold} pieces
            </div>
            <p className="text-xs text-coffee-600 mt-2">Coffee pieces sold</p>
            <Link href="/sales">
              <Badge variant="secondary" className="mt-2 cursor-pointer hover:bg-coffee-200">
                Record Sale →
              </Badge>
            </Link>
          </CardContent>
        </Card>

        <Card className="card-hover coffee-texture bg-green-50 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue (This Month)</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">
              UGX {formatCurrencyUGX(stats.totalRevenue)}
            </div>
            <p className="text-xs text-coffee-600 mt-2">Total sales revenue</p>
          </CardContent>
        </Card>

        <Card className="card-hover coffee-texture bg-red-50 border-red-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expenses (This Month)</CardTitle>
            <Receipt className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-700">
              UGX {formatCurrencyUGX(stats.totalExpenses)}
            </div>
            <p className="text-xs text-coffee-600 mt-2">Total expenses</p>
            <Link href="/expenses">
              <Badge variant="secondary" className="mt-2 cursor-pointer hover:bg-red-100">
                Record Expense →
              </Badge>
            </Link>
          </CardContent>
        </Card>

        <Card className="card-hover coffee-texture bg-amber-50 border-amber-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Debtors (This Month)</CardTitle>
            <Wallet className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-700">
              UGX {formatCurrencyUGX(stats.totalDebtors)}
            </div>
            <p className="text-xs text-coffee-600 mt-2">Outstanding credit</p>
          </CardContent>
        </Card>

        <Card className={`card-hover ${stats.netProfit >= 0 ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'}`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Profit (This Month)</CardTitle>
            <TrendingUp className="h-4 w-4 text-coffee-500" />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                stats.netProfit >= 0 ? "text-green-700" : "text-red-700"
              }`}
            >
              UGX {formatCurrencyUGX(stats.netProfit)}
            </div>
            <p className="text-xs text-coffee-600 mt-2">Revenue - Expenses</p>
            <Link href="/reports">
              <Badge variant="secondary" className="mt-2 cursor-pointer hover:bg-green-100">
                View Reports →
              </Badge>
            </Link>
          </CardContent>
        </Card>

        <Card className="card-hover coffee-texture bg-blue-50 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Link href="/production">
                <button className="w-full text-left px-3 py-2 text-sm bg-white border rounded hover:bg-coffee-50">
                  + Production
                </button>
              </Link>
              <Link href="/sales">
                <button className="w-full text-left px-3 py-2 text-sm bg-white border rounded hover:bg-coffee-50">
                  + Sale
                </button>
              </Link>
              <Link href="/expenses">
                <button className="w-full text-left px-3 py-2 text-sm bg-white border rounded hover:bg-coffee-50">
                  + Expense
                </button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Start Guide */}
      <Card className="coffee-texture">
        <CardHeader>
          <CardTitle>Quick Start Guide</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-coffee-500 rounded-full flex items-center justify-center text-white font-bold">
              1
            </div>
            <div>
              <h4 className="font-semibold text-coffee-800">Setup Categories</h4>
              <p className="text-sm text-coffee-600">
                Go to Settings to manage piece categories (100g, 250g, etc.) and expense types
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-coffee-500 rounded-full flex items-center justify-center text-white font-bold">
              2
            </div>
            <div>
              <h4 className="font-semibold text-coffee-800">Record Production</h4>
              <p className="text-sm text-coffee-600">
                Go to Production page to record coffee pieces produced from grinding
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-coffee-500 rounded-full flex items-center justify-center text-white font-bold">
              3
            </div>
            <div>
              <h4 className="font-semibold text-coffee-800">Monitor Inventory</h4>
              <p className="text-sm text-coffee-600">
                Check Inventory page for real-time stock levels by category
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-coffee-500 rounded-full flex items-center justify-center text-white font-bold">
              4
            </div>
            <div>
              <h4 className="font-semibold text-coffee-800">Record Sales</h4>
              <p className="text-sm text-coffee-600">
                Use Sales page to record transactions with quantities taken, sold, returned, and replaced
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-coffee-500 rounded-full flex items-center justify-center text-white font-bold">
              5
            </div>
            <div>
              <h4 className="font-semibold text-coffee-800">Track Expenses</h4>
              <p className="text-sm text-coffee-600">
                Record all business expenses (fuel, transport, etc.) on the Expenses page
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-coffee-500 rounded-full flex items-center justify-center text-white font-bold">
              6
            </div>
            <div>
              <h4 className="font-semibold text-coffee-800">Generate Reports</h4>
              <p className="text-sm text-coffee-600">
                View comprehensive reports and export to Excel for analysis
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
