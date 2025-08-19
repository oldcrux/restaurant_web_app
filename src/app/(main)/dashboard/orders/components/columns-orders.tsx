import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Pencil, Phone, Printer, Trash } from "lucide-react";
import { statusMap } from "@/lib/utils/order-utils";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Order } from "@/lib/types";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { TableMeta } from "@/types/table-meta";
import { DeliverOrderDialog } from "./deliver-order-dialog";
import { useState } from "react";

export const ordersColumns: ColumnDef<Order>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "orderNumber",
    header: "Order #",
    cell: ({ row }) => {
      const order = row.original;
      return (
        <div className="text-center w-full space-y-1">
          <span className="text-muted-foreground">{order.orderNumber}</span>
          {order.notes && (
            <div className="text-xs text-muted-foreground italic">
              Note: {order.notes}
            </div>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "customerName",
    header: () => <div className="text-center w-full">Customer</div>,
    cell: ({ row }) => {
      const order = row.original;
      return (
        <div className="text-center w-full flex flex-col">
          <span className="font-medium">{order.customerName}</span>
          <span className="text-sm text-muted-foreground flex items-center gap-1 justify-center">
            <Phone className="w-3 h-3" />
            {order.customerPhoneNumber}
          </span>
        </div>
      );
    },
    filterFn: (row, columnId, filterValue) => {
      if (!filterValue) return true;
      const name = String(row.getValue('customerName') || '').toLowerCase();
      const phone = String(row.original.customerPhoneNumber || '').toLowerCase();
      const search = String(filterValue).toLowerCase();
      return name.includes(search) || phone.includes(search);
    },
  },
  {
    accessorKey: "orderDetails",
    header: () => <div className="text-center w-full">Order Items</div>,
    cell: ({ row }) => {
      const order = row.original;
      const orderDetails = order.orderDetails || [];

      return (
        <div className="text-center w-full space-y-1">
          {orderDetails.map((detail, index) => (
            <div key={index} className="text-sm">
              <span className="font-medium">{detail.item}</span>
              <span className="text-muted-foreground"> × {detail.quantity}</span>
              {detail.notes && (
                <div className="text-xs text-muted-foreground italic">
                  Note: {detail.notes}
                </div>
              )}
            </div>
          ))}
        </div>
      );
    },
  },
  {
    accessorKey: "totalCost",
    header: () => <div className="text-center w-full">Total</div>,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("totalCost"));
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(amount);

      return <div className="text-center w-full font-medium">{formatted}
        <div className="text-xs text-muted-foreground italic">
          (+taxes)
        </div>
      </div>;

    },
  },
  {
    accessorKey: "status",
    header: () => <div className="text-center w-full">Status</div>,
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      // Status color mapping imported from @/lib/utils/order-utils

      return (
        <div className="text-center w-full">
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusMap[status] || "bg-gray-100 text-gray-800"
              }`}
          >
            {row.original.status}
          </span>
        </div>
        // <Badge variant="outline" className="text-muted-foreground px-1.5">
        // {row.original.status === "DELIVERED" ? (
        //   <CircleCheck className="stroke-border fill-green-500 dark:fill-green-400" />
        // ) : (
        //   <Loader className="animate-spin" />
        // )}
        // {row.original.status}
        // </Badge>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "createdAt",
    header: () => <div className="text-center w-full">Created At</div>,
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt"));
      return <div className="text-center w-full">{format(date, "MMM d, yyyy h:mm a")}</div>;
    },
  },
  // {
  //   id: "statusActions",
  //   header: () => <div className="text-center w-full">Update Status</div>,
  //   cell: ({ row, table }) => {
  //     const order = row.original;
  //     const meta = table.options.meta as TableMeta;

  //     const getStatusButtonConfig = () => {
  //       const status = order.status.toUpperCase();
  //       switch (status) {
  //         case 'CREATED':
  //           return { label: 'Confirm', nextStatus: 'CONFIRMED', variant: 'default' as const };
  //         case 'CONFIRMED':
  //           return { label: 'Process', nextStatus: 'PROCESSING', variant: 'default' as const };
  //         case 'PROCESSING':
  //           return { label: 'Ready', nextStatus: 'READY', variant: 'default' as const };
  //         case 'READY':
  //           return { label: 'Deliver', nextStatus: 'DELIVERED', variant: 'default' as const };
  //         default:
  //           return null;
  //       }
  //     };

  //     const buttonConfig = getStatusButtonConfig();

  //     if (!buttonConfig) return null;

  //     return (
  //       <div className="flex justify-center">
  //         <Button
  //           variant={buttonConfig.variant}
  //           size="sm"
  //           onClick={() => meta.onStatusUpdate?.(order, buttonConfig.nextStatus)}
  //         >
  //           {buttonConfig.label}
  //         </Button>
  //       </div>
  //     );
  //   },
  // },
  {
    id: "statusActions",
    header: () => <div className="text-center w-full">Update Status</div>,
    cell: ({ row, table }) => {
      const order = row.original;
      const meta = table.options.meta as TableMeta;

      const getStatusButtonConfig = () => {
        const status = order.status.toUpperCase();
        switch (status) {
          case 'CREATED':
            return { label: 'Confirm', nextStatus: 'CONFIRMED', variant: 'default' as const };
          case 'CONFIRMED':
            return { label: 'Process', nextStatus: 'PROCESSING', variant: 'default' as const };
          case 'PROCESSING':
            return { label: 'Ready', nextStatus: 'READY', variant: 'default' as const };
          case 'READY':
            return { label: 'Deliver', nextStatus: 'DELIVERED', variant: 'default' as const, openDeliverDialog: true };
          default:
            return null;
        }
      };

      const buttonConfig = getStatusButtonConfig();
      const [showDeliverDialog, setShowDeliverDialog] = useState(false);

      if (!buttonConfig) return null;

      return (
        <div className="flex justify-center">
          <Button
            variant={buttonConfig.variant}
            size="sm"
            onClick={() => {
              if (buttonConfig.openDeliverDialog) {
                setShowDeliverDialog(true);
              } else {
                meta.onStatusUpdate?.(order, buttonConfig.nextStatus);
              }
            }}
          >
            {buttonConfig.label}
          </Button>

          {buttonConfig.openDeliverDialog && (
            <DeliverOrderDialog
              open={showDeliverDialog}
              onOpenChange={setShowDeliverDialog}
              order={order}
              onDeliver={(updatedOrder) => {
                meta.onOrderUpdate?.(updatedOrder);
              }}
            />
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "storeName",
    header: ({ table }) => {
      const hideStoreColumn = (table.options.meta as any)?.hideStoreColumn;
      return hideStoreColumn ? null : <div className="text-center w-full">Store</div>;
    },
    cell: ({ row, table }) => {
      const storeName = row.getValue("storeName");
      const hideStoreColumn = (table.options.meta as any)?.hideStoreColumn;
      return hideStoreColumn ? null : <div className="text-center w-full">{!storeName}</div>;
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    id: "actions",
    header: () => <div className="text-center w-full">Actions</div>,
    cell: ({ row, table }) => {
      const meta = table.options.meta as TableMeta<Order>;

      const order = row.original;

      return (
        <div className="text-center space-x-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => meta.onPrint?.(order)}
                className="text-blue-600 hover:text-blue-700"
              >
                <Printer className="w-4 h-4" />
                <span className="sr-only">Print Order</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Print Order</p>
            </TooltipContent>
          </Tooltip>
          {(order.status === 'CREATED' || order.status === 'CONFIRMED') && (
            <>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => meta.onEdit?.(row.original)}
                  >
                    <Pencil className="w-4 h-4" />
                    <span className="sr-only">Edit</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Edit Order</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => meta.onCancel?.(row.original)}
                    className="text-red-500 hover:text-red-600"
                  >
                    <Trash className="w-4 h-4" />
                    <span className="sr-only">Cancel Order</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Cancel Order</p>
                </TooltipContent>
              </Tooltip>
            </>
          )}
        </div>
      );
    },
  },
];
