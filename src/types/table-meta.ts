import { Order, MenuItem, Store, User } from "@/lib/types";

export interface TableMeta<T = any> {
  // Common actions
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  
  // Order specific actions
  onCancel?: (order: Order) => void;
  onStatusUpdate?: (order: Order, newStatus: string) => void;
  onOrderUpdate?: (order: Order) => void;
  onPrint?: (order: Order) => void;
  
  // Store specific actions
  onToggleStoreStatus?: (store: Store) => void;

  // user specific actions
  onToggleUserStatus?: (user: User) => void;
}
