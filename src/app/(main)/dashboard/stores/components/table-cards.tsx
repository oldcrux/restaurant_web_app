"use client";

import React from "react";
import { Download, Plus } from "lucide-react";

import { DataTable } from "@/components/data-table/data-table";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { DataTableViewOptions } from "@/components/data-table/data-table-view-options";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardAction } from "@/components/ui/card";
import { useDataTableInstance } from "@/hooks/use-data-table-instance";
import { toast } from "sonner";

import { storesColumns } from "./columns-stores";
import { useEffect, useState } from "react";
import { Store } from "@/lib/types";
import { activateStore, allStores, createStore, deActivateStore, updateStore } from "@/services/store-services";
import StoreFormDialog from "./store-form-dialog";
import { canCreateStore } from "@/auth/supertokens/config/app-utils";

export function TableCards() {

  const [stores, setStores] = useState<Store[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editStore, setEditStore] = useState<Store | null>(null);

  const fetchStores = async () => {
    try {
      setIsLoading(true);
      const data = await allStores();
      setStores(data.data.stores);
    } catch (err) {
      console.error(err);
      toast.error("Error fetching stores");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, []);

  const handleSave = async (storeData: Store, isEditMode: boolean) => {
    try {
      if (isEditMode) {
        await updateStore(storeData);
        toast.success("Store updated");
      } else {
        await createStore(storeData);
        toast.success("Store created");
      }
      fetchStores();
    } catch (err) {
      console.error(err);
      toast.error("Save failed");
    }
  };

  const handleToggleActive = async (store: Store) => {
    try {
      const updatedStore = { ...store, isActive: !store.isActive };
      store.isActive
        ? await deActivateStore(updatedStore)
        : await activateStore(updatedStore);
      fetchStores();
    } catch (err) {
      toast.error("Status toggle failed");
    }
  };

  const handleDelete = async (store: Store) => {
    if (window.confirm(`Are you sure you want to delete ${store.storeName}?`)) {
      try {
        await deActivateStore({ ...store, isActive: false });
        toast.success("Store deleted");
        fetchStores();
      } catch (err) {
        toast.error("Delete failed");
      }
    }
  };

  // Create a memoized version of columns with handlers
  const columnsWithHandlers = React.useMemo(() => {
    return storesColumns.map(column => {
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
                      onEdit: (store: Store) => {
                        setEditStore(store);
                        setDialogOpen(true);
                      },
                      onToggleStoreStatus: handleToggleActive,
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
  }, [storesColumns, handleToggleActive, handleDelete]);

  const table = useDataTableInstance({
    data: stores,
    columns: columnsWithHandlers,
    getRowId: (row) => row.storeName.toString(),
  });

  return (
    <div className="grid grid-cols-1 gap-4 *:data-[slot=card]:shadow-xs">
      <Card>
        <CardHeader>
          <CardTitle>Stores</CardTitle>
          <CardDescription>Track and manage your stores.</CardDescription>
          <CardAction>
            <div className="flex items-center gap-2">
              <DataTableViewOptions table={table} />
              <div className="flex justify-between items-center">
                <Button
                  onClick={() => {
                    setEditStore(null);
                    setDialogOpen(true);
                  }}
                  className="gap-2"
                  disabled={!canCreateStore()}
                >
                  <Plus className="w-4 h-4" />
                  Add Store
                </Button>
              </div>
            </div>
          </CardAction>
        </CardHeader>
        <CardContent className="flex size-full flex-col gap-4">
          <div className="overflow-hidden rounded-md border">
            <DataTable table={table} columns={storesColumns} />
          </div>
          <DataTablePagination table={table} />
        </CardContent>
      </Card>

      <StoreFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        store={editStore}
        onSave={handleSave}
      />

    </div>

    
  );
}
