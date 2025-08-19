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
import { Loader2 } from "lucide-react";
import { Store, StoreHours, timezones } from "@/lib/types";
import StoreHoursEditor from "./store-hour-editor";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";


interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  store: Store | null;
  onSave: (storeData: Store, isEditMode: boolean) => void;
}

const defaultHours: StoreHours = {
  monday: ["09:00 EST", "19:00 EST"],
  tuesday: ["09:00 EST", "19:00 EST"],
  wednesday: ["09:00 EST", "19:00 EST"],
  thursday: ["09:00 EST", "19:00 EST"],
  friday: ["09:00 EST", "19:00 EST"],
  saturday: ["09:00 EST", "18:00 EST"],
  sunday: null,
};

const storeHourSchema = z.record(
  z.enum(["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]),
  z.union([z.tuple([z.string(), z.string()]), z.null()])
);

const storeFormSchema = z.object({
  storeName: z.string().min(1, "Store name is required"),
  phoneNumber: z.string().min(1, "Phone number is required"),
  trunkPhoneNumber: z.string().optional(),
  address1: z.string().min(1, "Address is required"),
  address2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zip: z.string().min(1, "ZIP code is required"),
  country: z.string().min(1, "Country is required"),
  dineInCapacity: z.number().int().min(0, "Dine-in capacity cannot be negative").optional(),
  slotDurationMinutes: z.number().int().min(1, "Slot duration must be at least 1 minute").optional(),
  timezone: z.string().min(1, "Timezone is required"),
  storeHour: z.any(), // You might want to add proper validation for store hours
  // storeHours: storeHourSchema,
  isActive: z.boolean(),
  updatedBy: z.string(),
});

type StoreFormValues = z.infer<typeof storeFormSchema>;

const StoreFormDialog: React.FC<Props> = ({
  open,
  onOpenChange,
  store,
  onSave,
}) => {
  const isEditMode = !!store;

  const form = useForm<StoreFormValues>({
    resolver: zodResolver(storeFormSchema),
    defaultValues: {
      storeName: "",
      phoneNumber: "",
      trunkPhoneNumber: "",
      address1: "",
      address2: "",
      city: "",
      state: "",
      zip: "",
      country: "",
      dineInCapacity: 0,
      slotDurationMinutes: 30,
      timezone: "UTC",
      storeHour: defaultHours,
      isActive: true,
      updatedBy: "",
    },
  });

  const loading = form.formState.isSubmitting;

  useEffect(() => {
    if (isEditMode && store) {
      form.reset({
        storeName: store.storeName ?? "",
        phoneNumber: store.phoneNumber ?? "",
        trunkPhoneNumber: store.trunkPhoneNumber ?? "",
        address1: store.address1 ?? "",
        address2: store.address2 ?? "",
        city: store.city ?? "",
        state: store.state ?? "",
        zip: store.zip ?? "",
        country: store.country ?? "",
        dineInCapacity: store.dineInCapacity ?? 0,
        slotDurationMinutes: store.slotDurationMinutes ?? 30,
        timezone: store.timezone ?? "UTC",
        storeHour: store.storeHour ?? defaultHours,
        isActive: store.isActive ?? true,
      });
    } else {
      form.reset({
        storeName: "",
        phoneNumber: "",
        trunkPhoneNumber: "",
        address1: "",
        address2: "",
        city: "",
        state: "",
        zip: "",
        country: "",
        dineInCapacity: 0,
        slotDurationMinutes: 30,
        timezone: "UTC",
        storeHour: defaultHours,
        isActive: true,
        updatedBy: "",
      });
    }
  }, [store, isEditMode, form]);

  const onSubmit = async (data: StoreFormValues) => {
    onSave(data as Store, isEditMode);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[100vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Edit Store" : "Add Store"}</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          {isEditMode
            ? "Update the store details below."
            : "Fill in the details to create a new store."}
        </DialogDescription>
        <Form {...form}>
          {/* <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4"> */}
          <form
            onSubmit={form.handleSubmit(onSubmit, (errors) => {
              console.log("Validation errors:", errors);
            })}
            className="space-y-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="storeName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Store Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Store name (Required)" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="timezone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Timezone</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select timezone" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {timezones.map((tz) => (
                          <SelectItem key={tz.value} value={tz.value}>
                            {tz.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <StoreHoursEditor
              timezone={form.watch('timezone')}
              hours={form.watch('storeHour')}
              onChange={(storeHour) => form.setValue('storeHour', storeHour)}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="+1 (123) 456-7890 (Required)" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="trunkPhoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Trunk Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="+1 (123) 456-7890 (Optional)" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="col-span-2 grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="address1"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address Line 1</FormLabel>
                    <FormControl>
                      <Input placeholder="123 Main St (Required)" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="address2"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address Line 2</FormLabel>
                    <FormControl>
                      <Input placeholder="Apt, suite, etc. (Optional)" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input placeholder="City (Required)" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State/Province</FormLabel>
                    <FormControl>
                      <Input placeholder="State/Province (Required)" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="zip"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ZIP/Postal Code</FormLabel>
                    <FormControl>
                      <Input placeholder="ZIP/Postal Code (Required)" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country</FormLabel>
                    <FormControl>
                      <Input placeholder="Country (Required)" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="dineInCapacity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dine-in Capacity (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        placeholder="Dine-in capacity"
                        {...field}
                        onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="slotDurationMinutes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slot Duration (minutes) (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="30"
                        placeholder="Slot duration in minutes"
                        {...field}
                        onChange={e => field.onChange(parseInt(e.target.value) || 30)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    {field.value ? "Active Store" : "Inactive Store"}
                  </FormLabel>
                </FormItem>
              )}
            />

            <DialogFooter className="mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditMode ? "Update Store" : "Add Store"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default StoreFormDialog;
