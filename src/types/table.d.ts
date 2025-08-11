import { MenuItem } from "@/lib/types";
import { Order } from "@/lib/types";
import { Store } from "@/lib/types";

declare module '@tanstack/react-table' {
  interface TableMeta<TData> {
    // Common actions
    onEdit?: (item: TData) => void;
    onDelete?: (item: TData) => void;
    
    // Order specific actions
    onCancel?: (order: Order) => void;
    onStatusUpdate?: (order: Order, newStatus: string) => void;
    onPrint?: (order: Order) => void;
    
    // Menu specific actions (if any additional ones exist)
    
    // Store specific actions (if any additional ones exist)
  }
}
