"use client";

import { useState } from "react";
import { Command, CommandInput, CommandList, CommandItem, CommandEmpty } from "@/components/ui/command";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Check, DoorOpen } from "lucide-react";
import { toast } from "sonner"; // optional, for feedback
import { changeCurrentStore } from "@/services/user-services";

type StoreRole = {
  storeName: string;
  roleIds: string[];
  isActive: boolean;
  isCurrentStore: boolean;
};

// Backend API call
async function changeCurrentStoreAPI(storeName: string) {
    // console.log("Switching to store:", storeName);
    await changeCurrentStore(storeName);
}

export function StoreSwitcher({ currentStore, storeRoles, onStoreChange }: {
  currentStore: string;
  storeRoles: StoreRole[];
  onStoreChange: (storeName: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [loadingStore, setLoadingStore] = useState<string | null>(null);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div className="flex cursor-pointer items-center gap-2 px-2 py-1 text-sm hover:bg-accent rounded-md">
          <DoorOpen className="h-4 w-4" />
          <span>Switch Store</span>
        </div>
      </DialogTrigger>

      <DialogContent className="p-0 overflow-hidden sm:max-w-[400px]">
      <DialogHeader>
          <DialogTitle className="py-2"></DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        <Command>
          <CommandInput placeholder="Search store..." />
          <CommandList>
            <CommandEmpty>No store found.</CommandEmpty>
            {storeRoles.map((role) => (
              <CommandItem
                key={role.storeName}
                disabled={role.storeName === currentStore || loadingStore !== null}
                className="hover:bg-accent/60 cursor-pointer"
                onSelect={async () => {
                  if (role.storeName === currentStore) return;
                  
                  // Optimistic update
                  const prevStore = currentStore;
                  onStoreChange(role.storeName);
                  setLoadingStore(role.storeName);

                  try {
                    await changeCurrentStoreAPI(role.storeName);
                    toast.success(`Switched to store ${role.storeName}`);
                  } catch {
                    // revert if error
                    onStoreChange(prevStore);
                    toast.error("Failed to switch store");
                  } finally {
                    setLoadingStore(null);
                    setOpen(false);
                  }
                }}
              >
                <span className="flex-1">{role.storeName}</span>
                {role.storeName === currentStore && (
                  <Check className="h-4 w-4 text-primary" />
                )}
                {loadingStore === role.storeName && (
                  <span className="text-xs text-muted-foreground">(Switching...)</span>
                )}
              </CommandItem>
            ))}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
