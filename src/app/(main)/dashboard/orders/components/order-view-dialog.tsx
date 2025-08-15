"use client";

import { useState } from "react";
import { getStatusColor } from "@/lib/utils/order-utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { Order, OrderDetails } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { updateOrderDetailStatus, updateOrderStatus } from "@/services/order-services";
import { toast } from "sonner";
import { DeliverOrderDialog } from "./deliver-order-dialogue";
import { Loader2, Phone, User, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface OrderViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: Order | null;
  onOrderUpdate?: (order: Order) => void;
}

export function OrderViewDialog({ open, onOpenChange, order, onOrderUpdate }: OrderViewDialogProps) {
  if (!order) return null;

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "PPpp");
    } catch (error) {
      return dateString;
    }
  };

  const calculateSubtotal = (items: OrderDetails[] = []) => {
    return items.reduce((sum, detail) => sum + (detail.itemPrice * detail.quantity), 0);
  };

  const subtotal = calculateSubtotal(order.orderDetails);
  const total = order.totalCost;
  const discount = order.totalDiscount || 0;

  const [showDeliverDialog, setShowDeliverDialog] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const getStatusButtonConfig = () => {
    if (!order?.status) return null;
    const status = order.status.toUpperCase();
    switch (status) {
      case 'CREATED':
        return { label: 'Confirm Order', nextStatus: 'CONFIRMED', variant: 'default' as const };
      case 'CONFIRMED':
        return { label: 'Start Processing', nextStatus: 'PROCESSING', variant: 'default' as const };
      case 'PROCESSING':
        return { label: 'Mark as Ready', nextStatus: 'READY', variant: 'default' as const };
      case 'READY':
        return {
          label: 'Mark as Delivered',
          nextStatus: 'DELIVERED',
          variant: 'default' as const,
          openDeliverDialog: true
        };
      default:
        return null;
    }
  };

  const buttonConfig = getStatusButtonConfig();

  const handleStatusUpdate = async (nextStatus: string) => {
    if (!order) return;

    try {
      setIsUpdating(true);
      // Create a new order object with the updated status
      const updatedOrderData = {
        ...order,
        status: nextStatus
      };
      const updatedOrder = await updateOrderStatus(updatedOrderData);
      toast.success(`Order marked as ${nextStatus.toLowerCase()}`);
      onOrderUpdate?.(updatedOrder);
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleActionClick = () => {
    if (!buttonConfig) return;

    if (buttonConfig.openDeliverDialog) {
      setShowDeliverDialog(true);
    } else {
      handleStatusUpdate(buttonConfig.nextStatus);
    }
  };

  const handleDeliverComplete = (updatedOrder: Order) => {
    onOrderUpdate?.(updatedOrder);
    setShowDeliverDialog(false);
  };

  const handleOrderDetailStatusUpdate = async (itemId: string, newStatus: string) => {
    if (!order) return;

    try {
      setIsUpdating(true);

      const orderDetail = order.orderDetails?.find(detail => detail.id === itemId);
      if (!orderDetail) {
        throw new Error('Order detail not found');
      }

      const updatedOrderDetail = {
        ...orderDetail,
        status: newStatus,
        orderId: order.id,
        storeName: order.storeName,
        orgName: order.orgName
      };

      await updateOrderDetailStatus(updatedOrderDetail);
      // toast.success(`Item status updated to ${newStatus.toLowerCase()}`);

      // Update local order details
      let updatedDetails = order.orderDetails?.map(detail =>
        detail.id === itemId ? { ...detail, status: newStatus } : detail
      );

      let updatedOrder = { ...order, orderDetails: updatedDetails };

      // If this change makes all details DELIVERED, mark order as DELIVERED too
      if (newStatus === 'DELIVERED' && updatedDetails?.every(d => d.status === 'DELIVERED')) {
        updatedOrder = { ...updatedOrder, status: 'DELIVERED' };
      }

      onOrderUpdate?.(updatedOrder);
    } catch (error) {
      console.error('Error updating item status:', error);
      toast.error('Failed to update item status');
    } finally {
      setIsUpdating(false);
    }
  };


  const getStatusVariant = (status: string) => {
    const s = status?.toUpperCase();
    switch (s) {
      case 'CREATED':
        return 'secondary';
      case 'CONFIRMED':
        return 'default';
      case 'PROCESSING':
        return 'outline';
      case 'READY':
        return 'default';
      case 'DELIVERED':
        return 'default';
      case 'CANCELLED':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  // Status color utility moved to @/lib/utils/order-utils

  const getNextStatus = (currentStatus: string, orderStatus: string) => {
    const parentStatus = orderStatus?.toUpperCase();
    const status = currentStatus?.toUpperCase();

    // Only allow progression if order is CONFIRMED
    if (parentStatus !== 'CONFIRMED') return null;

    switch (status) {
      case 'CREATED':
        return { label: 'Start Processing', value: 'PROCESSING' };
      case 'PROCESSING':
        return { label: 'Mark as Ready', value: 'READY' };
      case 'READY':
        return { label: 'Mark as Delivered', value: 'DELIVERED' };
      default:
        return null; // no button for DELIVERED or CANCELLED
    }
  };

  const shouldShowCancel = (detailStatus: string) => {
    const s = detailStatus?.toUpperCase();
    return s === 'CREATED'; // Cancel only before processing starts
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[100vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <div className="flex justify-between items-start">
            <div>
              <DialogTitle className="text-2xl font-bold flex items-center gap-3">
                Order #{order.orderNumber || 'N/A'}

                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-sm bg-muted/20">
                    {order.storeName}
                  </Badge>
                </div>
              </DialogTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge
                  variant="outline"
                  className={cn(
                    getStatusColor(order.status),
                    "text-xs font-medium py-1 px-2 border-0 capitalize"
                  )}
                >
                  {order.status?.toLowerCase() || 'N/A'}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {formatDate(order.createdAt || '')}
                </span>
              </div>
            </div>

          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-6">
            {/* Customer Information */}
            <div className="pb-4 border-b border-muted">
              <h3 className="font-medium mb-3 text-base">Customer Information</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <span className="font-medium">{order.customerName || 'Guest'}</span>
                </div>
                {order.customerPhoneNumber && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <a
                      href={`tel:${order.customerPhoneNumber}`}
                      className="text-sm text-muted-foreground hover:underline hover:text-foreground transition-colors"
                      aria-label={`Call ${order.customerPhoneNumber}`}
                    >
                      {order.customerPhoneNumber}
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Order Items */}
            <div>
              <h3 className="font-medium mb-2">Order Items</h3>
              <div className="space-y-4">
                {order.orderDetails?.map((detail: OrderDetails, index: number) => {
                  const nextStatus = getNextStatus(detail.status, order.status);
                  return (
                    <div key={detail.id}>
                      <div className="flex justify-between items-start gap-4 pb-2">
                        <div className="flex-1">
                          <p className="font-medium">
                            {detail.quantity}x {detail.item}
                          </p>
                          {detail.notes && (
                            <p className="text-sm text-muted-foreground mt-1">Note: {detail.notes}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium whitespace-nowrap">
                            ${(detail.itemPrice * detail.quantity).toFixed(2)}
                          </p>
                          <div className="flex gap-1">
                            {nextStatus && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleOrderDetailStatusUpdate(detail.id, nextStatus.value)}
                                disabled={isUpdating}
                                className="h-8"
                              >
                                {nextStatus.label}
                              </Button>
                            )}
                            {shouldShowCancel(detail.status) && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleOrderDetailStatusUpdate(detail.id, 'CANCELLED')}
                                disabled={isUpdating}
                                className="h-8 text-destructive border-destructive/20 hover:bg-destructive/10 hover:text-destructive"
                              >
                                Cancel
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Light line separator except after last item */}
                      {index < (order?.orderDetails?.length || 0 - 1) && (
                        <Separator className="bg-muted-foreground/10" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* <Separator /> */}

            {/* Order Summary */}
            {/* <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between">
                  <span>Discount</span>
                  <span className="text-destructive">-${discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-lg pt-2">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div> */}

            {/* Additional Information */}
            {order.notes && (
              <div className="space-y-2">
                <div>
                  <h4 className="text-sm font-medium">Order Notes</h4>
                  <p className="text-sm text-muted-foreground">{order.notes}</p>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <DialogFooter className="flex justify-between items-center pt-4 border-t border-muted">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isUpdating}
            className="min-w-24"
          >
            Close
          </Button>
          {buttonConfig && (
            <div className="flex items-center gap-2">
              <Button
                variant={buttonConfig.variant}
                onClick={handleActionClick}
                disabled={isUpdating}
                className="min-w-32"
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  buttonConfig.label
                )}
              </Button>
            </div>
          )}
        </DialogFooter>

        {buttonConfig?.openDeliverDialog && (
          <DeliverOrderDialog
            open={showDeliverDialog}
            onOpenChange={setShowDeliverDialog}
            order={order}
            onDeliver={handleDeliverComplete}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
