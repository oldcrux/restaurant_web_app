"use client";

import { ColumnDef } from "@tanstack/react-table"
import { Eye, EyeOff, Pencil } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { User } from "@/lib/types"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { TableMeta } from "@/types/table-meta";

export const usersColumns: ColumnDef<User>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
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
    accessorKey: "userId",
    header: "User Id",
  },
  {
    accessorKey: "firstName",
    header: "Name",
    cell: ({ row }) => (
      <div className="font-medium">
        {row.original.firstName} {row.original.lastName}
      </div>
    ),
  },
  {
    accessorKey: "emailId",
    header: "Email",
  },
  {
    accessorKey: "phoneNumber",
    header: "Phone",
  },
  {
    accessorKey: "storeRoles",
    header: "Store Assignments",
    cell: ({ row }) => {
      const storeRoles = row.original.storeRoles || [];
      if (storeRoles.length === 0) {
        return <div>No store assignments</div>;
      }
      
      return (
        <div className="space-y-2">
          {storeRoles.map((assignment, index) => (
            <div key={index} className="space-y-1">
              <div className="font-medium">{assignment.storeName || 'All'}</div>
              <div className="flex flex-wrap gap-1">
                {assignment.roleIds?.map((roleId) => {
                  const roleName = assignment.roleNames?.find((_, i) => assignment.roleIds?.[i] === roleId) || roleId;
                  return (
                    <Badge key={roleId} variant="outline" className="text-xs">
                      {roleName}
                    </Badge>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      );
    },
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => {
      const isActive = row.original.isActive;
      return (
        <Badge className={row.original.isActive ? "bg-green-200 text-green-800" : "bg-red-200 text-red-800"}>
          {/* <Badge variant={isActive ? "default" : "secondary"}> */}
          {isActive ? "Active" : "Inactive"}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    header: () => <div className="text-center w-full">Actions</div>,
    cell: ({ row, table }) => {
      const meta = table.options.meta as TableMeta<User>;
      const user = row.original;
      return (
        <div className="text-center space-x-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => meta.onEdit?.(user)}
              >
                <Pencil className="w-4 h-4" />
                <span className="sr-only">Edit</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Edit User</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  meta.onToggleUserStatus?.(row.original)}}
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
            </TooltipTrigger>
            <TooltipContent>
              <p>{row.original.isActive ? 'Deactivate User' : 'Activate User'}</p>
            </TooltipContent>
          </Tooltip>
        </div>
      );
    },
    enableSorting: false,
  },
];
