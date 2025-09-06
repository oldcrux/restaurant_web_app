"use client";

import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Order, MenuItem } from "@/lib/types";
import { orderSchema } from "./schema";
import { fetchMenuItemsToCreateOrder } from "@/services/menu-services";
import { toast } from "sonner";
import { Loader2, Plus, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getClientSessionUser } from "@/auth/supertokens/config/app-utils";

interface OrderDetailForm {
  id: string;
  itemName: string;
  itemPrice: number;
  quantity: number;
  notes?: string;
  customizable: boolean;
}

interface OrderFormValues {
  customerName: string;
  customerPhoneNumber: string;
  orderNotes: string;
  orderDetails: OrderDetailForm[];
}

interface OrderFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order?: Order;
  onSave: (order: Order, isEditMode: boolean) => void;
  viewOnly?: boolean;
}

export function OrderFormDialog({
  open,
  onOpenChange,
  order,
  onSave,
  viewOnly = false,
}: OrderFormDialogProps) {
  const isEditMode = !!order && !viewOnly;
  const [loading, setLoading] = useState(false);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoadingMenuItems, setIsLoadingMenuItems] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<OrderFormValues & { orderNotes: string }>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      customerName: "",
      customerPhoneNumber: "",
      orderNotes: "",
      orderDetails: [{
        itemName: "",
        itemPrice: 0,
        quantity: 1,
        notes: "",
        customizable: false
      }]
    },
    disabled: viewOnly, // Disable all form fields in view-only mode
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "orderDetails",
  });

  const user = getClientSessionUser();
  const storeName = user?.currentStore;

  // Fetch menu items when the dialog opens
  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        setIsLoadingMenuItems(true);
        setError(null);

        // Use the menu service to fetch items
        const items = await fetchMenuItemsToCreateOrder();
        if (items) {
          setMenuItems(items);
        } else {
          throw new Error("Invalid menu items data format");
        }
      } catch (error) {
        console.error("Error fetching menu items:", error);
        setError("Failed to load menu items. Please try again later.");
        toast.error("Failed to load menu items");
      } finally {
        setIsLoadingMenuItems(false);
      }
    };

    if (open) {
      fetchMenuItems();
    }
  }, [open]);

  // Set form values when editing an existing order
  useEffect(() => {
    if (order) {
      // console.log("✅ Fetched order in dialog:", order);
      form.reset({
        customerName: order.customerName,
        customerPhoneNumber: order.customerPhoneNumber,
        orderNotes: order.notes || "",
        orderDetails: order.orderDetails?.map((detail) => ({
          itemName: detail.item,
          itemPrice: detail.itemPrice,
          quantity: detail.quantity,
          notes: detail.notes || "",
          customizable: !!detail.notes,
        })) || [{
          itemName: "",
          itemPrice: 0,
          quantity: 1,
          notes: "",
          customizable: false
        }],
      });
    } else {
      form.reset({
        customerName: "",
        customerPhoneNumber: "",
        orderDetails: [{
          itemName: "",
          itemPrice: 0,
          quantity: 1,
          notes: "",
          customizable: false
        }]
      });
    }
  }, [order, open, form]);

  const calculateTotal = (items: OrderDetailForm[]) => {
    return items.reduce((total, item) => {
      return total + (item.itemPrice * item.quantity);
    }, 0);
  };

  const handleAddItem = () => {
    append({
      id: "",
      itemName: "",
      itemPrice: 0,
      quantity: 1,
      notes: "",
      customizable: false,
    });
  };

  const handleMenuItemChange = (value: string, index: number) => {
    const selectedItem = menuItems.find(item => item.itemName === value);
    if (selectedItem) {
      form.setValue(`orderDetails.${index}.itemPrice`, selectedItem.itemPrice);
      form.setValue(`orderDetails.${index}.customizable`, selectedItem.customizable || false);
      form.setValue(`orderDetails.${index}.notes`, "");
    }
  };


  const onSubmit = async (data: OrderFormValues) => {
    // In view-only mode, just close the dialog without saving
    if (viewOnly) {
      onOpenChange(false);
      return;
    }

    try {
      setLoading(true);
      const totalCost = calculateTotal(data.orderDetails);
      const now = new Date().toISOString();

      // Map form order details to OrderDetails[]
      const orderDetails = data.orderDetails.map(detail => ({
        id: detail.id || "",
        orderId: order?.id || "",
        orderNumber: order?.orderNumber || 0,
        item: detail.itemName,
        itemPrice: detail.itemPrice,
        quantity: detail.quantity,
        status: "CREATED",
        notes: detail.customizable ? (detail.notes || "") : "",
        createdAt: now,
        updatedAt: now,
        createdBy: order?.createdBy || "system",
        updatedBy: "system"
      }));

      const orderData: Partial<Order> = {
        id: order?.id || "",
        customerName: data.customerName,
        customerPhoneNumber: data.customerPhoneNumber,
        totalCost,
        status: "CREATED",
        orderNumber: order?.orderNumber || 0,
        orderDetails,
        notes: data.orderNotes || "",
      };

      // console.log("✅ Order data:", orderData);
      onSave(orderData as Order, !!order);
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving order:", error);
      toast.error("Failed to save order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[100vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-3">
            {viewOnly ? 'Order Details' : (isEditMode ? 'Edit Order' : 'Create New Order')}
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-sm bg-muted/20">
                {storeName}
              </Badge>
            </div>

          </DialogTitle>
          <DialogDescription>
            {viewOnly ? 'View order details' : (isEditMode ? 'Update the order details below.' : 'Fill out the form to create a new order.')}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          {/* <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col h-full"> */}
          <form onSubmit={form.handleSubmit((data) => {
            onSubmit(data);
          }, (error) => {
            console.log("❌ Validation errors:", error);
          })} className="flex flex-col h-full">
            <ScrollArea className="h-[60vh] pr-4">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="customerName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Customer Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter customer name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="customerPhoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter phone number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="orderNotes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Order Notes</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Any special instructions or notes for the kitchen?"
                            {...field}
                            rows={3}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {error ? (
                    <div className="bg-red-50 p-4 rounded-md text-center">
                      <p className="text-red-600 mb-2">{error}</p>
                    </div>
                  ) : isLoadingMenuItems ? (
                    <div className="text-center py-8">
                      <p>Loading menu items...</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {fields.map((field, index) => (
                        <div key={field.id} className="space-y-3 border p-4 rounded-lg">
                          <div className="flex justify-between items-start">
                            <div className="grid grid-cols-2 gap-4 w-full">
                              <FormField
                                control={form.control}
                                name={`orderDetails.${index}.itemName`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Item</FormLabel>
                                    <Select
                                      disabled={viewOnly}
                                      onValueChange={(value) => {
                                        field.onChange(value);
                                        handleMenuItemChange(value, index);
                                      }}
                                      value={field.value}
                                    >
                                      <FormControl>
                                        <SelectTrigger>
                                          <SelectValue placeholder="Select an item">
                                            {field.value || 'Select an item'}
                                          </SelectValue>
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        {menuItems.map((item) => (
                                          <SelectItem key={item.itemName} value={item.itemName}>
                                            {item.itemName}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name={`orderDetails.${index}.quantity`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Quantity</FormLabel>
                                    <FormControl>
                                      <Input
                                        type="number"
                                        min="1"
                                        className="w-24"
                                        {...field}
                                        onChange={(e) => {
                                          const value = parseInt(e.target.value, 10);
                                          field.onChange(isNaN(value) ? 1 : value);
                                        }}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>

                            {index > 0 && !viewOnly && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => remove(index)}
                                className="h-8 w-8 text-red-500 hover:bg-red-50"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            )}
                          </div>

                          {form.watch(`orderDetails.${index}.customizable`) && (
                            <FormField
                              control={form.control}
                              name={`orderDetails.${index}.notes`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Notes</FormLabel>
                                  <FormControl>
                                    <Textarea
                                      placeholder="Any notes or modifications?"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          )}

                          <div className="flex justify-end pt-2 border-t">
                            <div className="text-sm text-muted-foreground">
                              <span className="mr-2">Item Total:</span>
                              <span className="font-medium">
                                ${(form.watch(`orderDetails.${index}.itemPrice`) *
                                  form.watch(`orderDetails.${index}.quantity`)).toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {!viewOnly && (
                    <div className="flex justify-between items-center">
                      <h4 className="text-sm font-medium">Order Items</h4>
                      <Button
                        type="button"
                        size="sm"
                        onClick={handleAddItem}
                        className="gap-1"
                      >
                        <Plus className="h-4 w-4" />
                        Add Item
                      </Button>
                    </div>
                  )}
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center font-medium">
                    <span>Total</span>
                    <span>${calculateTotal(form.watch('orderDetails')).toFixed(2)}
                      <em className="text-sm italic text-muted-foreground">(+taxes)</em>
                    </span>
                  </div>
                </div>
              </div>
            </ScrollArea>

            {!viewOnly && (
              <DialogFooter className="gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={form.handleSubmit((data) => onSubmit(data as unknown as OrderFormValues))}
                  disabled={loading}
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isEditMode ? 'Update Order' : 'Create Order'}
                </Button>
              </DialogFooter>
            )}
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
