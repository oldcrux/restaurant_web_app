"use client";

import React, { useEffect, useState } from "react";
import { Download, Plus } from "lucide-react";
import { generatePrintContent } from "./print-order-template";

import { DataTable } from "@/components/data-table/data-table";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { Button } from "@/components/ui/button";
import { flexRender } from "@tanstack/react-table";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardAction } from "@/components/ui/card";
import { useDataTableInstance } from "@/hooks/use-data-table-instance";
import { toast } from "sonner";

import { Order } from "@/lib/types";
import { allOrders, createOrder, updateOrder, cancelOrder, updateOrderStatus, updateOrderStatusToDelivered } from "@/services/order-services";
import { ordersColumns } from "./columns-orders";
import { OrderFormDialog } from "./order-form-dialogue";
import { OrderViewDialog } from "./order-view-dialog";
import { DataTableViewOptions } from "@/components/data-table/data-table-view-options";
import { FilterToolbar } from "./filter-toolbar";
import { getClientSessionUser } from "@/auth/supertokens/config/app-utils";

export function TableCards() {
  const user = getClientSessionUser();
  const storeName = user?.currentStore;

  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editOrder, setEditOrder] = useState<Order>();
  const [viewOrder, setViewOrder] = useState<Order | null>(null);

  const fetchOrders = async () => {

    try {
      setIsLoading(true);
      const data = await allOrders();
      setOrders(data.data.orders || []);
    } catch (err) {
      console.error(err);
      toast.error("Error fetching orders");
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchOrders();
    const interval = setInterval(() => {
      // console.log("✅ Auto-refreshing orders...");
      fetchOrders();
    }, 60000); // Execute every 1 minute (60000ms)
    return () => clearInterval(interval);
  }, []);

  const handleSave = async (orderData: Order, isEditMode: boolean) => {
    // console.log("✅ Saving order:", orderData);
    try {
      if (isEditMode) {
        await updateOrder(orderData);
        toast.success("Order updated successfully");
      } else {
        await createOrder(orderData);
        toast.success("Order created successfully");
      }
      fetchOrders();
      setDialogOpen(false);
      setEditOrder(undefined);
    } catch (err) {
      console.error(err);
      toast.error(`Error ${isEditMode ? 'updating' : 'creating'} order`);
    }
  };

  const handleUpdateOrderStatusToDelivered = async (orderData: Order) => {
    console.log("✅ Updating order:", orderData);
    try {
      await updateOrderStatusToDelivered(orderData);
      toast.success("Order updated successfully");
      fetchOrders();
      setDialogOpen(false);
      setEditOrder(undefined);
    } catch (err) {
      console.error(err);
      toast.error(`Error updating order`);
    }
  };

  const handleRowClick = (order: Order) => {
    setViewOrder(order);
  };

  const handleViewClose = () => {
    setViewOrder(null);
  };

  const handleCancel = async (order: Order) => {
    try {
      await cancelOrder(order);
      toast.success("Order cancelled successfully");
      fetchOrders();
    } catch (err) {
      console.error(err);
      toast.error("Error cancelling order");
    }
  };

  const handleStatusUpdate = async (order: Order, newStatus: string) => {
    try {
      const updatedOrder = { ...order, status: newStatus };
      await updateOrderStatus(updatedOrder);
      toast.success(`Order status updated to ${newStatus.toLowerCase()}`);
      fetchOrders();
    } catch (err) {
      console.error(err);
      toast.error('Error updating order status');
    }
  };

  const handlePrintOrder = (order: Order) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const printContent = generatePrintContent(order);

    printWindow.document.open();
    printWindow.document.write(printContent);
    printWindow.document.close();
  };

  const columnsWithHandlers = React.useMemo(() => {
      return ordersColumns.map(column => {
        if (column.id === 'actions' || column.id === 'statusActions') {
          return {
            ...column,
            cell: (props: any) => {
              const originalCell = column.cell;
              if (typeof originalCell === 'function') {
                return originalCell({
                  ...props,
                  table: {
                    ...props.table,
                    options: {
                      ...props.table.options,
                      meta: {
                        onEdit: (order: Order) => {
                          setEditOrder(order);
                          setDialogOpen(true);
                        },
                        onCancel: handleCancel,
                        onStatusUpdate: handleStatusUpdate,
                        onOrderUpdate: handleUpdateOrderStatusToDelivered,
                        onPrint: handlePrintOrder
                      }
                    }
                  }
                });
              }
              return null;
            }
          };
        }
        return column;
      });
    }, [ordersColumns, handleCancel, handleStatusUpdate, handleUpdateOrderStatusToDelivered, handlePrintOrder]);
  // }, [ordersColumns, handleCancel]);

  const table = useDataTableInstance({
      data: orders,
      columns: columnsWithHandlers,
      getRowId: (row) => row.orderNumber?.toString(),
      meta: {
        hideStoreColumn: !!storeName, // Hide store column if storeName is set (user is logged into a specific store)
        onEdit: (order: Order) => {
          setEditOrder(order);
          setDialogOpen(true);
        },
        onCancel: handleCancel,
        onStatusUpdate: handleStatusUpdate,
        onOrderUpdate: handleUpdateOrderStatusToDelivered,
        onPrint: handlePrintOrder
      }
    });

  return (
    <div className="space-y-4">
      <FilterToolbar table={table} />
    <Card>
            <CardHeader>
              <CardTitle>Orders</CardTitle>
              <CardDescription>Track and manage all orders.</CardDescription>
              <CardAction>
                <div className="flex items-center gap-2">
                  <DataTableViewOptions table={table} />
                  <div className="flex justify-between items-center">
                    <Button
                      onClick={() => {
                        setEditOrder(undefined);
                        setDialogOpen(true);
                      }}
                      className="gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Create Order
                    </Button>
                  </div>
                </div>
              </CardAction>
            </CardHeader>
            <CardContent className="flex size-full flex-col gap-4">
              <div className="overflow-hidden rounded-md border">
                <DataTable 
                  table={table} 
                  columns={ordersColumns}
                  onRowClick={handleRowClick} // TODO: implement row click
                  rowClassName="hover:bg-muted/50"
                />
              </div>
              <DataTablePagination table={table} />
            </CardContent>
          </Card>

      <OrderFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        order={editOrder}
        onSave={handleSave}
        viewOnly={false}
      />
      <OrderViewDialog
        open={!!viewOrder}
        onOpenChange={(open) => !open && setViewOrder(null)}
        order={viewOrder}
        onOrderUpdate={(updatedOrder) => {
          // Update the orders list with the updated order
          setOrders(prevOrders => 
            prevOrders.map(order => 
              order.id === updatedOrder.id ? updatedOrder : order
            )
          );
          // If the updated order is the currently viewed one, update it
          if (viewOrder && viewOrder.id === updatedOrder.id) {
            setViewOrder(updatedOrder);
          }
        }}
      />
    
    </div>
  );
}
