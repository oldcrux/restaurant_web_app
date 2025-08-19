import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter, 
  DialogClose, 
  DialogDescription 
} from "@/components/ui/dialog";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Loader2, Check, ChevronsUpDown } from "lucide-react";
import { MenuItem } from "@/lib/types";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { getClientSessionUser } from "@/auth/supertokens/config/app-utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";



const menuFormSchema = z.object({
  itemName: z.string().min(1, "Item name is required"),
  itemDescription: z.string().optional(),
  itemPrice: z.number({
    required_error: "Price is required",
    invalid_type_error: "Price must be a number",
  }).min(0.01, "Price must be greater than 0"),
  itemComposition: z.string().optional(),
  customizable: z.boolean().default(false),
  orgName: z.string(),
  storeName: z.string(),
  selectedStores: z.array(z.string()).optional(),
  createdBy: z.string(),
  updatedBy: z.string(),
});

type MenuFormValues = z.infer<typeof menuFormSchema>;

const defaultValues: MenuFormValues = {
  itemName: "",
  itemDescription: "",
  itemPrice: 0,
  itemComposition: "",
  customizable: false,
  orgName: "",
  storeName: "",
  selectedStores: [],
  createdBy: "",
  updatedBy: "",
};

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  menu: MenuItem | null;
  // orgName: string;
  // storeName: string;
  onSave: (menuData: MenuItem, isEditMode: boolean) => void;
}

const MenuFormDialog: React.FC<Props> = ({
  open,
  onOpenChange,
  menu,
  // orgName,
  // storeName,
  onSave,
}) => {
  const isEditMode = !!menu;
  
  const form = useForm<MenuFormValues>({
    resolver: zodResolver(menuFormSchema),
    defaultValues: {
      ...defaultValues,
      // orgName,
      // storeName,
    },
  });

  const loading = form.formState.isSubmitting;
  const [showInfoDialog, setShowInfoDialog] = useState(false);

  const sessionUser = getClientSessionUser();
  
  useEffect(() => {
    if (isEditMode && menu) {
      form.reset({
        ...menu,
        // orgName,
        // storeName,
      });
    } else {
      form.reset({
        ...defaultValues,
        // orgName,
        // storeName,
      });
    }
  }, [menu, isEditMode, /*orgName, storeName,*/ 
    form]);

  const onSubmit = async (data: MenuFormValues) => {
    // If no stores are selected, show info dialog and don't submit
    if (hasStoreCreatePermission && (!data.selectedStores || data.selectedStores.length === 0)) {
      setShowInfoDialog(true);
      return;
    }

    console.log("menu item data", data);
    const menuItem: MenuItem = {
      ...data,
      itemDescription: data.itemDescription || '',
      itemComposition: data.itemComposition || '',
      createdBy: data.createdBy || '',
      updatedBy: data.updatedBy || '',
    };
    onSave(menuItem, isEditMode);
  };

  const handleContinueWithoutStores = () => {
    setShowInfoDialog(false);
    const formData = form.getValues();
    const menuItem: MenuItem = {
      ...formData,
      itemDescription: formData.itemDescription || '',
      itemComposition: formData.itemComposition || '',
      createdBy: formData.createdBy || '',
      updatedBy: formData.updatedBy || '',
    };
    onSave(menuItem, isEditMode);
  };

  const hasStoreCreatePermission = sessionUser?.permissions?.includes("store_create");
  const allStoreOptions = sessionUser?.storeRoles?.map((role: { storeName: string }) => role.storeName) || [];
  const storeOptions = hasStoreCreatePermission 
    ? ["All", ...allStoreOptions]
    : [sessionUser?.currentStore];

  const handleStoreSelect = (store: string) => {
    const currentStores = form.getValues("selectedStores") || [];
    
    if (store === "All") {
      // If "All" is selected, select all stores or clear all if already selected
      form.setValue("selectedStores", 
        currentStores.length === allStoreOptions.length ? [] : [...allStoreOptions]
      );
    } else {
      // Toggle individual store selection
      const newStores = currentStores.includes(store)
        ? currentStores.filter(s => s !== store)
        : [...currentStores, store];
      
      form.setValue("selectedStores", newStores);
    }
  };

  // const [popoverOpen, setPopoverOpen] = React.useState(false);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[100vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Edit Menu Item" : "Add New Menu Item"}</DialogTitle>
          <DialogDescription>
            {isEditMode 
              ? "Update the menu item details below." 
              : "Fill in the details to create a new menu item."}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <FormField
                control={form.control}
                name="selectedStores"
                render={({ field }: { field: any }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Stores</FormLabel>
                    {hasStoreCreatePermission ? (
                      <Popover //open={popoverOpen} onOpenChange={setPopoverOpen}
                      >
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              role="combobox"
                              className={cn(
                                "w-1/2 justify-between",
                                !field.value?.length && "text-muted-foreground"
                              )}
                            >
                              {field.value?.length 
                                ? field.value.length === allStoreOptions.length 
                                  ? "All stores selected" 
                                  : field.value.join(", ")
                                : "Select stores"}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0">
                          <Command>
                            <CommandInput placeholder="Search stores..." />
                            <CommandEmpty>No stores found.</CommandEmpty>
                            <CommandGroup className="max-h-[300px] overflow-y-auto">
                              {storeOptions.map((store) => {
                                const isSelected = store === "All" 
                                  ? field.value?.length === allStoreOptions.length
                                  : field.value?.includes(store);
                                return (
                                  <CommandItem
                                    value={store}
                                    key={store}
                                    onSelect={() => {
                                      handleStoreSelect(store);
                                      // setPopoverOpen(false);
                                    }}
                                    className="cursor-pointer"
                                  >
                                    <div className="flex items-center">
                                      <div className={cn(
                                        "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                                        isSelected 
                                          ? "bg-primary text-primary-foreground" 
                                          : "opacity-50 [&_svg]:invisible"
                                      )}>
                                        <Check className={cn("h-4 w-4")} />
                                      </div>
                                      <span>{store}</span>
                                    </div>
                                  </CommandItem>
                                );
                              })}
                            </CommandGroup>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    ) : (
                      <Input 
                        value={field.value?.join(", ") || ''} 
                        disabled 
                        className="bg-muted/50"
                      />
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="itemName"
                render={({ field }: { field: any }) => (
                  <FormItem>
                    <FormLabel>Item Name (Required)</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter item name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="itemDescription"
                render={({ field }: { field: any }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter item description"
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="itemPrice"
                render={({ field }: { field: any }) => (
                  <FormItem>
                    <FormLabel>Price (Required)</FormLabel>
                    <div className="relative">
                      <span className="absolute left-3 top-2">$</span>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          className="pl-8"
                          placeholder="0.00"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="itemComposition"
                render={({ field }: { field: any }) => (
                  <FormItem>
                    <FormLabel>Composition</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="List ingredients or components, separated by commas"
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="customizable"
                render={({ field }: { field: any }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Customizable</FormLabel>
                      <p className="text-sm text-muted-foreground">
                        {field.value 
                          ? "Customers can customize this item" 
                          : "This item cannot be customized"}
                      </p>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="mt-4">
              <DialogClose asChild>
                <Button type="button" variant="outline" disabled={loading}>
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditMode ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
      
      {/* Alert for no stores selected */}
      <AlertDialog open={showInfoDialog} onOpenChange={setShowInfoDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>No Stores Selected</AlertDialogTitle>
            <AlertDialogDescription>
              The menu item will be created for all existing and future stores.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleContinueWithoutStores}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
};

export default MenuFormDialog;
