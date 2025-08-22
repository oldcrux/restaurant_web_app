import { ColumnDef } from "@tanstack/react-table";
import { Pencil, EyeOff, Eye, Trash2 } from "lucide-react";

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Store } from "@/lib/types";
import { TableMeta } from "@/types/table-meta";
import { canManageStore } from "@/auth/supertokens/config/app-utils";

export const storesColumns: ColumnDef<Store>[] = [
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
    enableHiding: false,
  },
  {
    accessorKey: "storeName",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
    cell: ({ row }) => <span>{row.original.storeName}</span>,
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "address",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Address" />,
    cell: ({ row }) => <span>{row.original.address1}, {row.original.city}, {row.original.state}, {row.original.zip}</span>,
    enableSorting: false,
  },
  {
    accessorKey: "isActive",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
    cell: ({ row }) => <Badge className={row.original.isActive ? "bg-green-200 text-green-800" : "bg-red-200 text-red-800"}>
    {row.original.isActive ? "Active" : "Inactive"}
  </Badge>,
    enableSorting: false,
  },
  {
    accessorKey: "createdBy",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Source" />,
    cell: ({ row }) => <Badge variant="outline">{row.original.createdBy}</Badge>,
    enableSorting: false,
  },
  {
    id: "actions",
    header: ({ column }) => <div className="text-center w-full"><DataTableColumnHeader column={column} title="Actions" /></div>,
    cell: ({ row, table }) => {
      const meta = table.options.meta as TableMeta<Store>;
      const store = row.original;
      return (
        <div className="text-center space-x-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <span>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => meta.onEdit?.(store)}
                disabled={!canManageStore()}
              >
                <Pencil className="w-4 h-4" />
                <span className="sr-only">Edit</span>
              </Button>
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p>{canManageStore() ? 'Edit Store' : 'You do not have permission to edit Store'}</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <span>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => meta.onToggleStoreStatus?.(row.original)}
                disabled={!canManageStore()}
              >
                {row.original.isActive ? (
                  <>
                    <EyeOff className="w-4 h-4" />
                    <span className="sr-only">Deactivate</span>
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4" />
                    <span className="sr-only">Activate</span>
                  </>
                )}
              </Button>
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p>{canManageStore() ? (row.original.isActive ? 'Deactivate Store' : 'Activate Store') : 'You do not have permission to perform this action'}</p>
            </TooltipContent>
          </Tooltip>
          {/* <Tooltip>
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
              <p>Delete Store</p>
            </TooltipContent>
          </Tooltip> */}
        </div>
      );
    },
    enableSorting: false,
  },
];
