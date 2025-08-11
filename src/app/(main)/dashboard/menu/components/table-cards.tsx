"use client";

import React, { useEffect, useState } from "react";
import { Download, Plus } from "lucide-react";

import { DataTable } from "@/components/data-table/data-table";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardAction } from "@/components/ui/card";
import { useDataTableInstance } from "@/hooks/use-data-table-instance";
import { toast } from "sonner";

import { MenuItem } from "@/lib/types";
import { allMenuItems, createMenuItem, updateMenuItem, deleteMenuItem } from "@/services/menu-services";
import { menusColumns } from "./columns-menus";
import MenuFormDialog from "./menu-form-dialogue";
import { DataTableViewOptions } from "@/components/data-table/data-table-view-options";

export function TableCards() {
  const idToken = "your-token";
  const orgName = "Acme Corporation";
  const storeName = "001";

  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editMenu, setEditMenu] = useState<MenuItem | null>(null);

  const fetchMenus = async () => {
    try {
      setIsLoading(true);
      const data = await allMenuItems(idToken, orgName, storeName);
      setMenus(data.data.items || []);
    } catch (err) {
      console.error(err);
      toast.error("Error fetching menu items");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMenus();
  }, []);

  const handleSave = async (menuData: MenuItem, isEditMode: boolean) => {
    try {
      if (isEditMode) {
        await updateMenuItem(idToken, orgName, storeName, menuData);
        toast.success("Menu item updated successfully");
      } else {
        await createMenuItem(idToken, orgName, storeName, menuData);
        toast.success("Menu item created successfully");
      }
      setDialogOpen(false);
      fetchMenus();
    } catch (error) {
      console.error("Error saving menu item:", error);
      toast.error("Failed to save menu item");
    }
  };

  const handleDelete = async (menuItem: MenuItem) => {
    if (window.confirm(`Are you sure you want to delete ${menuItem.itemName}?`)) {
      try {
        await deleteMenuItem(idToken, orgName, storeName, menuItem.itemName);
        toast.success("Menu item deleted successfully");
        fetchMenus();
      } catch (error) {
        console.error("Error deleting menu item:", error);
        toast.error("Failed to delete menu item");
      }
    }
  };

  // Create a memoized version of columns with handlers
  const columnsWithHandlers = React.useMemo(() => {
    return menusColumns.map(column => {
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
                      onEdit: (menu: MenuItem) => {
                        setEditMenu(menu);
                        setDialogOpen(true);
                      },
                      onDelete: handleDelete
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
  }, [menusColumns, handleDelete]);

  const table = useDataTableInstance({
    data: menus,
    columns: columnsWithHandlers,
    getRowId: (row) => row.itemName?.toString(),
  });

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Menu Items</CardTitle>
          <CardDescription>Track and manage your menu items.</CardDescription>
          <CardAction>
            <div className="flex items-center gap-2">
              <DataTableViewOptions table={table} />
              <div className="flex justify-between items-center">
                <Button
                  onClick={() => {
                    setEditMenu(null);
                    setDialogOpen(true);
                  }}
                  className="gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Menu Item
                </Button>
              </div>
            </div>
          </CardAction>
        </CardHeader>
        <CardContent className="flex size-full flex-col gap-4">
          <div className="overflow-hidden rounded-md border">
            <DataTable table={table} columns={menusColumns} />
          </div>
          <DataTablePagination table={table} />
        </CardContent>
      </Card>

      <MenuFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        menu={editMenu}
        onSave={handleSave}
        orgName={orgName}
        storeName={storeName}
      />
    </div>
  );
}
