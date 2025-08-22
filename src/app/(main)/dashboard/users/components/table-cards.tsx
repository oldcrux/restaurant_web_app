"use client";

import React, { useEffect, useState } from "react";
import { Download, Plus } from "lucide-react";

import { DataTable } from "@/components/data-table/data-table";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { DataTableViewOptions } from "@/components/data-table/data-table-view-options";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
  CardAction,
} from "@/components/ui/card";
import { useDataTableInstance } from "@/hooks/use-data-table-instance";
import { toast } from "sonner";

import { usersColumns } from "./columns-users";
import { User } from "@/lib/types";
import { allUsers, createUser, updateUser, activateUser, deActivateUser } from "@/services/user-services";
import { UserFormDialog } from "./user-form-dialog";
import { canManageUser } from "@/auth/supertokens/config/app-utils";

export function TableCards() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [orgName, setOrgName] = useState("");
  const [userId, setUserId] = useState("");

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const data = await allUsers();
      setUsers(data.data.users || []);
    } catch (err) {
      console.error(err);
      toast.error("Error fetching users");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSave = async (userData: User, isEditMode: boolean) => {
    try {
      // Prepare the user data with storeRoles
      const userToSave = {
        ...userData,
        // For backward compatibility, set storeName and roles from the first storeRole if it exists
        storeName: userData.storeRoles?.[0]?.storeName || '',
        roles: userData.storeRoles?.flatMap(sr => sr.roleIds) || []
      };

      if (isEditMode) {
        await updateUser(userToSave);
        toast.success("User updated successfully");
      } else {
        await createUser(userToSave);
        toast.success("User created successfully");
      }
      
      fetchUsers();
      setDialogOpen(false);
      setEditUser(null);
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to save user");
    }
  };

  const handleToggleStatus = async (user: User) => {
    try {
      const updatedUser = { ...user, isActive: !user.isActive };
      
      if (updatedUser.isActive) {
        await activateUser(updatedUser);
        toast.success("User activated successfully");
      } else {
        await deActivateUser(updatedUser);
        toast.success("User deactivated successfully");
      }
      
      fetchUsers();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update user status");
    }
  };

  // Format user data for editing
  const handleEditUser = (user: User) => {
    // Ensure storeRoles is properly formatted for the form
    const formattedUser = {
      ...user,
      storeRoles: user.storeRoles?.length 
        ? user.storeRoles 
        : [{
            storeName: user.storeName || '',
            roleIds: user.roles || [],
            roleNames: user.roles || []
          }]
    };
    setEditUser(formattedUser);
    setDialogOpen(true);
  };

  // Create a memoized version of columns with handlers
  const columnsWithHandlers = React.useMemo(() => {
    return usersColumns.map(column => {
      if (column.id === 'actions') {
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
                      onEdit: (user: User) => handleEditUser(user),
                      onToggleUserStatus: handleToggleStatus,
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
  }, [handleToggleStatus]);

  const table = useDataTableInstance({
    data: users,
    columns: columnsWithHandlers,
    getRowId: (row) => row.userId.toString(),
  });

  return (
    <div className="grid grid-cols-1 gap-4 *:data-[slot=card]:shadow-xs">
      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>Manage your organization's users and their permissions.</CardDescription>
          <CardAction>
            <div className="flex items-center gap-2">
              <DataTableViewOptions table={table} />
              <div className="flex justify-between items-center">
                <Button
                  onClick={() => {
                    setEditUser(null);
                    setDialogOpen(true);
                  }}
                  className="gap-2"
                  disabled={!canManageUser()}
                >
                  <Plus className="w-4 h-4" />
                  {canManageUser() ? 'Add User' : 'You do not have permission to add User'}
                </Button>
              </div>
            </div>
          </CardAction>
        </CardHeader>
        <CardContent className="flex size-full flex-col gap-4">
          <div className="overflow-hidden rounded-md border">
            <DataTable table={table} columns={usersColumns} />
          </div>
          <DataTablePagination table={table} />
        </CardContent>
      </Card>

      <UserFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        user={editUser}
        onSave={handleSave}
        orgName={orgName}
        userId={userId}
      />
    </div>
  );
}
