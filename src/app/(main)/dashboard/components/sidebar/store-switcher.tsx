"use client";

import { useState } from "react";
import {
    Popover,
    PopoverTrigger,
    PopoverContent,
    PopoverArrow
} from "@/components/ui/popover";
import {
    Command,
    CommandInput,
    CommandList,
    CommandItem,
    CommandEmpty
} from "@/components/ui/command";
import { Check, DoorOpen } from "lucide-react";
import { toast } from "sonner";
import { changeCurrentStore } from "@/services/user-services";

type StoreRole = {
    storeName: string;
    roleIds: string[];
    isActive: boolean;
    isCurrentStore: boolean;
};

async function changeCurrentStoreAPI(storeName: string) {
    await changeCurrentStore(storeName);
}

export function StoreSwitcher({
    currentStore,
    storeRoles,
    onStoreChange,
}: {
    currentStore: string;
    storeRoles: StoreRole[];
    onStoreChange: (storeName: string) => void;
}) {
    const [loadingStore, setLoadingStore] = useState<string | null>(null);

    return (
        <Popover>
            <PopoverTrigger asChild>
                <div className="flex cursor-pointer items-center gap-2 px-2 py-1 text-sm hover:bg-accent rounded-md">
                    <DoorOpen className="h-4 w-4" />
                    <span>Switch Store</span>
                </div>
            </PopoverTrigger>
            <PopoverContent
                className="w-64 p-0 rounded-xl shadow-lg border border-muted bg-popover"
                align="start"
                side="right"
                sideOffset={8}
            >
                {/* Bubble Arrow */}
                <PopoverArrow className="fill-popover" />
                
                {/* Store Search & List */}
                <Command>
                    <CommandInput placeholder="Search store..." />
                    <CommandList>
                        <CommandEmpty>No store found.</CommandEmpty>
                        {[...storeRoles]
                            .sort((a, b) => a.storeName.localeCompare(b.storeName))
                            .map((role) => (
                                <CommandItem
                                    key={role.storeName}
                                    disabled={role.storeName === currentStore || loadingStore !== null}
                                    className="hover:bg-accent/60 cursor-pointer"
                                    onSelect={async () => {
                                        if (role.storeName === currentStore) return;
                                        const prevStore = currentStore;
                                        onStoreChange(role.storeName);
                                        setLoadingStore(role.storeName);

                                        try {
                                            await changeCurrentStoreAPI(role.storeName);
                                            toast.success(`Switched to store ${role.storeName}`);
                                        } catch {
                                            onStoreChange(prevStore);
                                            toast.error("Failed to switch store");
                                        } finally {
                                            setLoadingStore(null);
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
            </PopoverContent>
        </Popover>
    );
}
