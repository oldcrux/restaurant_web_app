"use client";

import { useState, useEffect } from "react";
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
import { DateTime } from "luxon";
import { Order, OrderDetails } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { updateOrderDetailStatus, updateOrderStatus, updateOrderStatusToDelivered } from "@/services/order-services";
import { toast } from "sonner";
import { DeliverOrderDialog } from "./deliver-order-dialog";
import { Loader2, Phone, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface OrderViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: Order | null;
  onOrderUpdate?: (order: Order) => void;
}

export function OrderViewDialog({ open, onOpenChange, order: initialOrder, onOrderUpdate }: OrderViewDialogProps) {
  const [currentOrder, setCurrentOrder] = useState<Order | null>(initialOrder);
  const [showDeliverDialog, setShowDeliverDialog] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Update internal state when the prop changes
  useEffect(() => {
      setCurrentOrder(initialOrder);
  }, [initialOrder]);

  if (!currentOrder) return null;

  const formatDate = (dateString: string) => {
    try {
      const date = DateTime.fromSQL(dateString as string, { zone: 'utc' });
      return date.isValid ? date.toFormat("MMM d, yyyy h:mm a") : "Invalid Date";
    } catch (error) {
      return dateString;
    }
  };

  // const calculateSubtotal = (items: OrderDetails[] = []) => {
  //   return items.reduce((sum, detail) => sum + (detail.itemPrice * detail.quantity), 0);
  // };

  // const subtotal = calculateSubtotal(currentOrder.orderDetails);
  // const total = currentOrder.totalCost;
  // const discount = currentOrder.totalDiscount || 0;


  const getStatusButtonConfig = () => {
    if (!currentOrder?.status) return null;
    const status = currentOrder.status.toUpperCase();
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

  const buttonConfig = currentOrder ? getStatusButtonConfig() : null;

  const handleStatusUpdate = async (nextStatus: string) => {
    if (!currentOrder) return;

    try {
      setIsUpdating(true);
      // Create a new order object with the updated status
      const updatedOrderData = {
        ...currentOrder,
        status: nextStatus
      };
      const updatedOrder = await updateOrderStatus(updatedOrderData);
      console.log("✅ Updated order:", updatedOrder);
      toast.success(`Order marked as ${nextStatus.toLowerCase()}`);
      
      // Update the local state first for immediate feedback
      setCurrentOrder(updatedOrder.data);
      // Notify parent component about the update
      onOrderUpdate?.(updatedOrder.data);
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleActionClick = async () => {
    if (!buttonConfig) return;

    if (buttonConfig.openDeliverDialog) {
      setShowDeliverDialog(true);
    } else {
      await handleStatusUpdate(buttonConfig.nextStatus);
    }
  };

  const handleUpdateOrderStatusToDelivered = async (orderData: Order) => {
      // console.log("✅ Updating order to Delivered:", orderData);
      try {
        await updateOrderStatusToDelivered(orderData);
        toast.success("Order updated successfully");
      } catch (err) {
        console.error(err);
        toast.error(`Error updating order`);
      }
    };
    
  const handleDeliverComplete = async (updatedOrder: Order) => {
    // console.log("✅ Deliver complete:", updatedOrder);
    await handleUpdateOrderStatusToDelivered(updatedOrder);
    onOrderUpdate?.(updatedOrder);
    setShowDeliverDialog(false);
    onOpenChange(false)
  };

  const handleOrderDetailStatusUpdate = async (itemId: string, newStatus: string) => {
    if (!currentOrder) return;

    try {
      setIsUpdating(true);

      const orderDetail = currentOrder.orderDetails?.find((detail: OrderDetails) => detail.id === itemId);
      if (!orderDetail) {
        throw new Error('Order detail not found');
      }

      const updatedOrderDetail = {
        ...orderDetail,
        status: newStatus,
        orderId: currentOrder.id,
        storeName: currentOrder.storeName,
        orgName: currentOrder.orgName
      };

      await updateOrderDetailStatus(updatedOrderDetail);

      // Update local order details
      const updatedDetails = currentOrder.orderDetails?.map((detail: OrderDetails) =>
        detail.id === itemId ? { ...detail, status: newStatus } : detail
      );

      let updatedOrder = { ...currentOrder, orderDetails: updatedDetails };

      // If this change makes all details DELIVERED, mark order as DELIVERED too
      if (newStatus === 'DELIVERED' && updatedDetails?.every((d: OrderDetails) => d.status === 'DELIVERED')) {
        updatedOrder = { ...updatedOrder, status: 'DELIVERED' };
      }

      // Update local state first for immediate feedback
      setCurrentOrder(updatedOrder);
      // Notify parent component about the update
      onOrderUpdate?.(updatedOrder);
    } catch (error) {
      console.error('Error updating item status:', error);
      toast.error('Failed to update item status');
    } finally {
      setIsUpdating(false);
    }
  };


  // const getStatusVariant = (status: string) => {
  //   const s = status?.toUpperCase();
  //   switch (s) {
  //     case 'CREATED':
  //       return 'secondary';
  //     case 'CONFIRMED':
  //       return 'default';
  //     case 'PROCESSING':
  //       return 'outline';
  //     case 'READY':
  //       return 'default';
  //     case 'DELIVERED':
  //       return 'default';
  //     case 'CANCELLED':
  //       return 'destructive';
  //     default:
  //       return 'outline';
  //   }
  // };

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
                Order #{currentOrder.orderNumber || 'N/A'}

                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-sm bg-muted/20">
                    {currentOrder.storeName}
                  </Badge>
                </div>
              </DialogTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge
                  variant="outline"
                  className={cn(
                    getStatusColor(currentOrder.status),
                    "text-xs font-medium py-1 px-2 border-0 capitalize"
                  )}
                >
                  {currentOrder.status?.toLowerCase() || 'N/A'}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {formatDate(currentOrder.createdAt || '')}
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
                  <span className="font-medium">{currentOrder.customerName || 'Guest'}</span>
                </div>
                {currentOrder.customerPhoneNumber && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <a
                      href={`tel:${currentOrder.customerPhoneNumber}`}
                      className="text-sm text-muted-foreground hover:underline hover:text-foreground transition-colors"
                      aria-label={`Call ${currentOrder.customerPhoneNumber}`}
                    >
                      {currentOrder.customerPhoneNumber}
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Order Items */}
            <div>
              <h3 className="font-medium mb-2">Order Items</h3>
              <div className="space-y-4">
                {(currentOrder.orderDetails || []).map((detail: OrderDetails, index: number) => {
                  const nextStatus = getNextStatus(detail.status, currentOrder.status);
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
                      {index < (currentOrder?.orderDetails?.length || 0 - 1) && (
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
            {currentOrder.notes && (
              <div className="space-y-2">
                <div>
                  <h4 className="text-sm font-medium">Order Notes</h4>
                  <p className="text-sm text-muted-foreground">{currentOrder.notes}</p>
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
            order={currentOrder}
            onDeliver={handleDeliverComplete}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
