import { z } from "zod";

// export const orderSchema = z.object({
//   customerName: z.string().min(1, "Customer name is required"),
//   customerPhoneNumber: z.string().min(1, "Phone number is required"),
//   totalCost: z.number().min(0, "Total cost must be a positive number"),
//   // status: z.string().min(1, "Status is required"),
// });

export const orderSchema = z.object({
  customerName: z.string().min(1, "Required"),
  customerPhoneNumber: z.string().min(10, "Enter valid number"),
  orderNotes: z.string().optional(),
  orderDetails: z.array(z.object({
    itemName: z.string().min(1),
    itemPrice: z.number().min(0),
    quantity: z.number().min(1),
    notes: z.string().optional(),
    customizable: z.boolean(),
  }))
});

export type OrderFormValues = z.infer<typeof orderSchema>;

export const orderStatuses = [
  { value: "CREATED", label: "Created" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "PROCESSING", label: "Processing" },
  { value: "READY", label: "Ready" },
  { value: "COMPLETED", label: "Completed" },
  { value: "DELIVERED", label: "Delivered" },
  { value: "CANCELLED", label: "Cancelled" },
];
