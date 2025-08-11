"use client"

import { useEffect, useState, useMemo } from "react"
import { Table } from "@tanstack/react-table"
import { X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DataTableFacetedFilter } from "./data-table-faceted-filter"
import { orderStatuses } from "./schema"

interface FilterToolbarProps<TData> {
  table: Table<TData>
}

export function FilterToolbar<TData>({ table }: FilterToolbarProps<TData>) {
  const [filtersReady, setFiltersReady] = useState(false)

  const customerColumn = table.getColumn("customerName")
  const statusColumn = table.getColumn("status")
  const storeColumn = table.getColumn("storeName")

  const isFiltered = table.getState().columnFilters.length > 0

  // Get unique store names and format them for the filter
  const storeOptions = useMemo(() => {
    if (!storeColumn) return [];
    const values = new Set<string>();
    table.getFilteredRowModel().rows.forEach((row) => {
      const value = row.getValue(storeColumn.id) as string;
      if (value) values.add(value);
    });
    return Array.from(values).map((value) => ({
      label: value,
      value: value,
    }));
  }, [storeColumn, table.getFilteredRowModel()]);

  useEffect(() => {
    if (statusColumn && storeColumn) {
      setFiltersReady(true);
    }
  }, [statusColumn, storeColumn])

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center gap-2">
        {customerColumn && (
          <Input
            placeholder="Filter by customer or phone..."
            value={(customerColumn.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              customerColumn.setFilterValue(event.target.value)
            }
            className="h-8 w-[150px] lg:w-[250px]"
          />
        )}

        {filtersReady && storeColumn && (
          // <div className="h-8 w-[150px] lg:w-[250px]">
            <DataTableFacetedFilter
              column={storeColumn}
              title="Store"
              options={storeOptions}
            />
          // {/* </div> */}
        )}

        {filtersReady && (
          <DataTableFacetedFilter
            column={statusColumn}
            title="Status"
            options={orderStatuses}
          />
        )}

        {isFiltered && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => table.resetColumnFilters()}
          >
            Reset
            <X className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  )
}
