export interface Database {
  public: {
    Tables: {
      piece_categories: {
        Row: {
          id: string;
          name: string;
          weight_grams: number;
          rate_ugx: number;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          weight_grams: number;
          rate_ugx?: number;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          weight_grams?: number;
          rate_ugx?: number;
          is_active?: boolean;
          created_at?: string;
        };
      };
      production_records: {
        Row: {
          id: string;
          production_date: string;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          production_date?: string;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          production_date?: string;
          notes?: string | null;
          created_at?: string;
        };
      };
      production_items: {
        Row: {
          id: string;
          production_record_id: string;
          piece_category_id: string;
          quantity: number;
          rate_ugx: number;
          amount_ugx: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          production_record_id: string;
          piece_category_id: string;
          quantity: number;
          rate_ugx: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          production_record_id?: string;
          piece_category_id?: string;
          quantity?: number;
          rate_ugx?: number;
          created_at?: string;
        };
      };
      sales: {
        Row: {
          id: string;
          sale_date: string;
          route_name: string | null;
          buyer_name: string | null;
          payment_type: 'cash' | 'credit';
          total_amount_ugx: number;
          debtor_amount_ugx: number;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          sale_date?: string;
          route_name?: string | null;
          buyer_name?: string | null;
          payment_type: 'cash' | 'credit';
          total_amount_ugx?: number;
          debtor_amount_ugx?: number;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          sale_date?: string;
          route_name?: string | null;
          buyer_name?: string | null;
          payment_type?: 'cash' | 'credit';
          total_amount_ugx?: number;
          debtor_amount_ugx?: number;
          notes?: string | null;
          created_at?: string;
        };
      };
      sale_items: {
        Row: {
          id: string;
          sale_id: string;
          piece_category_id: string;
          quantity_taken: number;
          quantity_sold: number;
          quantity_returned: number;
          quantity_replaced: number;
          rate_ugx: number;
          amount_ugx: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          sale_id: string;
          piece_category_id: string;
          quantity_taken: number;
          quantity_sold: number;
          quantity_returned?: number;
          quantity_replaced?: number;
          rate_ugx: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          sale_id?: string;
          piece_category_id?: string;
          quantity_taken?: number;
          quantity_sold?: number;
          quantity_returned?: number;
          quantity_replaced?: number;
          rate_ugx?: number;
          created_at?: string;
        };
      };
      expense_types: {
        Row: {
          id: string;
          name: string;
          is_predefined: boolean;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          is_predefined?: boolean;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          is_predefined?: boolean;
          is_active?: boolean;
          created_at?: string;
        };
      };
      expenses: {
        Row: {
          id: string;
          expense_date: string;
          expense_type_id: string;
          amount_ugx: number;
          sale_id: string | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          expense_date?: string;
          expense_type_id: string;
          amount_ugx: number;
          sale_id?: string | null;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          expense_date?: string;
          expense_type_id?: string;
          amount_ugx?: number;
          sale_id?: string | null;
          notes?: string | null;
          created_at?: string;
        };
      };
    };
    Views: {
      stock_inventory: {
        Row: {
          piece_category_id: string;
          category_name: string;
          weight_grams: number;
          rate_ugx: number;
          is_active: boolean;
          total_produced: number;
          total_taken: number;
          total_returned: number;
          quantity_in_stock: number;
          stock_value_ugx: number;
        };
      };
    };
  };
}

// Type exports
export type PieceCategory = Database['public']['Tables']['piece_categories']['Row'];
export type ProductionRecord = Database['public']['Tables']['production_records']['Row'];
export type ProductionItem = Database['public']['Tables']['production_items']['Row'];
export type Sale = Database['public']['Tables']['sales']['Row'];
export type SaleItem = Database['public']['Tables']['sale_items']['Row'];
export type ExpenseType = Database['public']['Tables']['expense_types']['Row'];
export type Expense = Database['public']['Tables']['expenses']['Row'];
export type StockInventory = Database['public']['Views']['stock_inventory']['Row'];

// Extended types for queries with joins
export interface ProductionRecordWithItems extends ProductionRecord {
  production_items: (ProductionItem & { piece_categories: PieceCategory })[];
}

export interface SaleWithItems extends Sale {
  sale_items: (SaleItem & { piece_categories: PieceCategory })[];
}

export interface ExpenseWithType extends Expense {
  expense_types: ExpenseType;
}
