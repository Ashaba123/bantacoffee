import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format weight in grams to display as grams or kilograms
 * @param grams - Weight in grams
 * @returns Formatted string with appropriate unit
 */
export function formatWeight(grams: number): string {
  if (grams >= 1000) {
    return `${(grams / 1000).toFixed(2)} kg`;
  }
  return `${grams.toFixed(0)} g`;
}

/**
 * Format currency in UGX (Uganda Shillings)
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-UG', {
    style: 'currency',
    currency: 'UGX',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format currency in UGX without currency symbol
 */
export function formatCurrencyUGX(amount: number): string {
  return new Intl.NumberFormat('en-UG', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format date
 */
export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format date and time
 */
export function formatDateTime(date: Date | string): string {
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Calculate percentage
 */
export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0;
  return (value / total) * 100;
}

/**
 * Get stock alert level
 */
export function getStockAlertLevel(
  currentStock: number,
  threshold: number
): 'danger' | 'warning' | 'success' {
  if (currentStock < threshold * 0.25) return 'danger';
  if (currentStock < threshold) return 'warning';
  return 'success';
}

/**
 * Get stock alert color
 */
export function getStockAlertColor(level: 'danger' | 'warning' | 'success'): string {
  switch (level) {
    case 'danger':
      return 'text-red-600 bg-red-50';
    case 'warning':
      return 'text-amber-600 bg-amber-50';
    case 'success':
      return 'text-green-600 bg-green-50';
  }
}

/**
 * Calculate sale total from items
 */
export function calculateSaleTotal(items: Array<{
  quantity_sold: number;
  rate_ugx: number;
}>): number {
  return items.reduce((sum, item) => sum + (item.quantity_sold * item.rate_ugx), 0);
}

/**
 * Calculate net profit
 */
export function calculateNetProfit(totalRevenue: number, totalExpenses: number): number {
  return totalRevenue - totalExpenses;
}

/**
 * Format piece quantity with proper pluralization
 */
export function formatPieceQuantity(quantity: number, categoryName: string): string {
  return `${quantity} ${categoryName} ${quantity === 1 ? 'piece' : 'pieces'}`;
}
