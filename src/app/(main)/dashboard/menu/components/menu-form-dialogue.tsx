import React, { useEffect } from "react";
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
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";
import { MenuItem } from "@/lib/types";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

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
  createdBy: "",
  updatedBy: "",
};

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  menu: MenuItem | null;
  orgName: string;
  storeName: string;
  onSave: (menuData: MenuItem, isEditMode: boolean) => void;
}

const MenuFormDialog: React.FC<Props> = ({
  open,
  onOpenChange,
  menu,
  orgName,
  storeName,
  onSave,
}) => {
  const isEditMode = !!menu;
  
  const form = useForm<MenuFormValues>({
    resolver: zodResolver(menuFormSchema),
    defaultValues: {
      ...defaultValues,
      orgName,
      storeName,
    },
  });

  const loading = form.formState.isSubmitting;

  useEffect(() => {
    if (isEditMode && menu) {
      form.reset({
        ...menu,
        orgName,
        storeName,
      });
    } else {
      form.reset({
        ...defaultValues,
        orgName,
        storeName,
      });
    }
  }, [menu, isEditMode, orgName, storeName, form]);

  const onSubmit = async (data: MenuFormValues) => {
    await onSave(data as MenuItem, isEditMode);
  };

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
                name="itemName"
                render={({ field }) => (
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
                render={({ field }) => (
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
                render={({ field }) => (
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
                render={({ field }) => (
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
                render={({ field }) => (
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
    </Dialog>
  );
};

export default MenuFormDialog;
