import { ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash2 } from "lucide-react";

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { MenuItem } from "@/lib/types";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { TableMeta } from "@/types/table-meta";

export const menusColumns: ColumnDef<MenuItem>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      </div>
    ),
    enableSorting: false,
  },
  {
    accessorKey: "itemName",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Item Name" />,
    cell: ({ row }) => <span>{row.original.itemName}</span>,
    enableSorting: false,

  },
  {
    accessorKey: "itemDescription",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Description" />,
    cell: ({ row }) => <span className="line-clamp-2">{row.original.itemDescription}</span>,
    enableSorting: false,
  },
  {
    accessorKey: "itemPrice",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Price" />,
    cell: ({ row }) => `$${row.original.itemPrice?.toFixed(2) || '0.00'}`,
    enableSorting: false,
  },
  {
    accessorKey: "customizable",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Customizable" />,
    cell: ({ row }) => (
      <Badge variant={row.original.customizable ? "default" : "secondary"}>
        {row.original.customizable ? "Yes" : "No"}
      </Badge>
    ),
    enableSorting: false,
  },
  {
    id: "actions",
    header: () => <div className="text-center w-full">Actions</div>,
    cell: ({ row, table }) => {
      const meta = table.options.meta as TableMeta<MenuItem>;
      
      return (
        <div className="text-center space-x-2">
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
              <p>Edit Menu Item</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => meta.onDelete?.(row.original)} 
                className="text-red-500 hover:text-red-600"
              >
                <Trash2 className="w-4 h-4" />
                <span className="sr-only">Delete</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Delete Menu Item</p>
            </TooltipContent>
          </Tooltip>
        </div>
      );
    },
    enableSorting: false,
  },
];
