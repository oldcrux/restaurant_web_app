"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Order } from "@/lib/types";

interface DeliverOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: Order | null;
  onDeliver: (order: Order) => void;
}

export function DeliverOrderDialog({
  open,
  onOpenChange,
  order,
  onDeliver,
}: DeliverOrderDialogProps) {
  const [discountAmount, setDiscountAmount] = useState(0);
  const [discountPercentage, setDiscountPercentage] = useState(0);
  const [isPercentage, setIsPercentage] = useState(false);

  if (!order) return null;

  const originalTotal = order.totalCost || 0;
  
  // Calculate discount based on which field was last updated
  const discount = isPercentage 
    ? (originalTotal * (discountPercentage / 100))
    : discountAmount;
    
  const finalTotal = Math.max(originalTotal - discount, 0);
  
  // Update the other discount field when one changes
  const handleDiscountAmountChange = (value: number) => {
    setDiscountAmount(value);
    setDiscountPercentage(originalTotal > 0 ? (value / originalTotal) * 100 : 0);
    setIsPercentage(false);
  };
  
  const handleDiscountPercentageChange = (value: number) => {
    setDiscountPercentage(value);
    setDiscountAmount(originalTotal * (value / 100));
    setIsPercentage(true);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Deliver Order #{order.orderNumber}</DialogTitle>
          <DialogDescription>Review order and apply any discounts before marking as delivered.</DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4 space-y-4">
          <div className="space-y-2">
            <div>
              <p className="font-medium">Customer</p>
              <p className="text-muted-foreground">{order.customerName} — {order.customerPhoneNumber}</p>
            </div>

            <div>
              <p className="font-medium">Items</p>
              {order.orderDetails?.map((item, idx) => (
                <div key={idx} className="text-sm flex justify-between border-b py-1">
                  <span>{item.item} × {item.quantity}</span>
                  <span>${(item.itemPrice * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-between font-medium">
              <span>Original Total</span>
              <span>${originalTotal.toFixed(2)}</span>
            </div>

            <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-2">
              <div>
                <label className="block text-sm font-medium mb-1">Discount ($)</label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={discountAmount.toFixed(2)}
                  onChange={(e) => handleDiscountAmountChange(parseFloat(e.target.value) || 0)}
                  className="w-full"
                />
              </div>
              <div className="flex items-center justify-center h-10 text-sm text-muted-foreground">
                -Or-
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Discount (%)</label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  step="0.5"
                  value={discountPercentage.toFixed(1)}
                  onChange={(e) => handleDiscountPercentageChange(parseFloat(e.target.value) || 0)}
                  className="w-full"
                />
              </div>
            </div>

            <div className="flex justify-between font-bold text-lg border-t pt-2">
              <span>Final Total</span>
              <span>${finalTotal.toFixed(2)}</span>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button
            onClick={() => {
              const updatedOrder = {
                ...order,
                totalCost: finalTotal,
                totalDiscount: discount,
                status: 'DELIVERED'
              };
              onDeliver(updatedOrder);
              onOpenChange(false);
            }}
          >
            Deliver
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
