"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MultiSelect } from "../../../../../components/ui/multi-select";
import { Role, User } from "@/lib/types";
import { allStores } from "@/services/store-services";
import { Store } from "@/lib/types";
import { allRoles } from "@/services/role-services";
import { Trash2, Plus } from "lucide-react";

const storeRoleAssignmentSchema = z.object({
  storeName: z.string().optional(),
  roleIds: z.array(z.string()).min(1, "At least one role is required"),
  roleNames: z.array(z.string()).optional(),
  isCurrentStore: z.boolean().default(false),
});

const userFormSchema = z.object({
  emailId: z.string().email("Please enter a valid email"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phoneNumber: z.string().min(1, "Phone number is required"),
  storeRoles: z.array(storeRoleAssignmentSchema).min(1, "At least one store assignment is required"),
  userType: z.string().default("human"),
  password: z.string().optional(),
  address1: z.string().min(1, "Address line 1 is required"),
  address2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zip: z.string().min(1, "ZIP code is required"),
  country: z.string().min(1, "Country is required"),
  isActive: z.boolean().default(true),
});

type UserFormValues = z.infer<typeof userFormSchema>;

interface UserFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: User | null;
  onSave: (data: User, isEditMode: boolean) => void;
  orgName: string;
  userId: string;
}

export function UserFormDialog({
  open,
  onOpenChange,
  user,
  onSave,
  orgName,
  userId,
}: UserFormDialogProps) {
  const [stores, setStores] = useState<Store[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [availableRoles, setAvailableRoles] = useState<Role[]>([]);

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      emailId: "",
      firstName: "",
      lastName: "",
      phoneNumber: "",
      storeRoles: [{ storeName: "", roleIds: [] }],
      userType: "human",
      password: "",
      address1: "",
      address2: "",
      city: "",
      state: "",
      zip: "",
      country: "",
      isActive: true,
    },
  });

  useEffect(() => {
    if (user) {
      form.reset({
        emailId: user.emailId,
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber,
        storeRoles: user.storeRoles?.length
          ? user.storeRoles.map(role => ({
            ...role,
            isCurrentStore: role.isCurrentStore || false
          }))
          : user.storeName
            ? [{
              storeName: user.storeName || "",
              roleIds: user.roles || [],
              roleNames: user.roles?.map(roleId =>
                availableRoles.find(r => r.value === roleId)?.label
              ).filter(Boolean) || [],
              isCurrentStore: true
            }]
            : [{ storeName: "", roleIds: [], isCurrentStore: false }],
        userType: user.userType || "human",
        password: "",
        address1: user.address1 || "",
        address2: user.address2 || "",
        city: user.city || "",
        state: user.state || "",
        zip: user.zip || "",
        country: user.country || "",
        isActive: user.isActive ?? true,
      });
    } else {
      form.reset({
        emailId: "",
        firstName: "",
        lastName: "",
        phoneNumber: "",
        storeRoles: [{ storeName: "", roleIds: [], isCurrentStore: false }],
        userType: "human",
        password: "",
        address1: "",
        address2: "",
        city: "",
        state: "",
        zip: "",
        country: "",
        isActive: true,
      });
    }
  }, [user, open, form, availableRoles]);

  useEffect(() => {
    // Update the fetchStores function in UserFormDialog
    const fetchStores = async () => {
      try {
        setIsLoading(true);
        const response = await allStores();
        // Ensure we're working with an array
        const storesData = Array.isArray(response) ? response :
          response.data ? response.data.stores || response.data : [];
          // TODO if user does not have 'org_admin' role, filter out stores that
        setStores(storesData);
      } catch (error) {
        console.error("Error fetching stores:", error);
        setStores([]); // Ensure stores is always an array
      } finally {
        setIsLoading(false);
      }
    };

    fetchStores();
  }, []);

  useEffect(() => {
    // Update the fetchStores function in UserFormDialog
    const fetchRoles = async () => {
      try {
        setIsLoading(true);
        const response = await allRoles();
        // Ensure we're working with an array
        const rolesData = Array.isArray(response) ? response :
          response.data ? response.data.roles || response.data : [];
        const roles = rolesData.map((role: Role) => ({
          label: role.roleName,
          value: role.roleId,
        }));
        setAvailableRoles(roles);
      } catch (error) {
        console.error("Error fetching roles:", error);
        setAvailableRoles([]); // Ensure stores is always an array
      } finally {
        setIsLoading(false);
      }
    };
    fetchRoles();
  }, []);


  const handleAddAssignment = () => {
    const currentAssignments = form.getValues("storeRoles") || [];
    form.setValue("storeRoles", [...currentAssignments, { storeName: "", roleIds: [], isCurrentStore: false }]);
  };

  const handleRemoveAssignment = (index: number) => {
    const currentAssignments = [...(form.getValues("storeRoles") || [])];
    if (currentAssignments.length <= 1) return; // At least one assignment required
    currentAssignments.splice(index, 1);
    form.setValue("storeRoles", currentAssignments);
  };

  const handleStoreChange = (index: number, storeName: string) => {
    const currentAssignments = [...(form.getValues("storeRoles") || [])];
    currentAssignments[index] = {
      ...currentAssignments[index],
      storeName,
      // Reset roles when store changes
      roleIds: [],
      roleNames: [],
      isCurrentStore: currentAssignments[index]?.isCurrentStore || false,
    };
    form.setValue("storeRoles", currentAssignments);
  };

  const handleCurrentStoreChange = (index: number, isCurrentStore: boolean) => {
    const currentAssignments = [...(form.getValues("storeRoles") || [])];

    // If setting to current, unset all other current flags
    if (isCurrentStore) {
      currentAssignments.forEach((_, i) => {
        if (i !== index) {
          currentAssignments[i] = {
            ...currentAssignments[i],
            isCurrentStore: false,
          };
        }
      });
    }

    // Update the current assignment
    currentAssignments[index] = {
      ...currentAssignments[index],
      isCurrentStore,
    };

    form.setValue("storeRoles", currentAssignments, { shouldValidate: true });
  };

  const handleRoleChange = (index: number, roleIds: string[]) => {
    const currentAssignments = [...(form.getValues("storeRoles") || [])];
    const roleNames = roleIds
      .map(id => availableRoles.find(r => r.value === id)?.label)
      .filter((name): name is string => Boolean(name));
    currentAssignments[index] = {
      ...currentAssignments[index],
      roleIds,
      roleNames
    };
    form.setValue("storeRoles", currentAssignments);
  };

  const getAvailableStores = (currentIndex: number) => {
    const currentAssignments = form.getValues("storeRoles") || [];
    const selectedStoreNames = currentAssignments
      .map((assignment, idx) => idx === currentIndex ? null : assignment.storeName)
      .filter(Boolean);

    return stores.filter(store => !selectedStoreNames.includes(store.storeName));
  };

  const onSubmit = (data: UserFormValues) => {
    const userData: User = {
      ...data,
      userId: user?.userId || "",
      isActive: data.isActive ?? true,
      createdBy: user?.createdBy || "",
      updatedBy: userId,
      orgName: orgName,
      storeName: data.storeRoles[0]?.storeName || "",
      roles: data.storeRoles.flatMap(sr => sr.roleIds),
      permissions: [],
      address1: data.address1 || "",
      address2: data.address2 || "",
      city: data.city || "",
      state: data.state || "",
      zip: data.zip || "",
      country: data.country || "",
      password: data.password || "",
      storeRoles: data.storeRoles,
    };

    onSave(userData, !!user);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* <DialogContent className="sm:max-w-[600px]"> */}
      <DialogContent className="max-h-[100vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{user ? "Edit User" : "Add New User"}</DialogTitle>
          <DialogDescription>
            {user
              ? "Update the user details below."
              : "Fill in the details to create a new user."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="emailId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="john.doe@example.com"
                      type="email"
                      disabled={!!user}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input placeholder="+1 123 456 7890" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="col-span-2 grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="address1"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address Line 1</FormLabel>
                    <FormControl>
                      <Input placeholder="123 Main St" {...field} />
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
                    <FormLabel>Address Line 2 (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Apt, suite, etc." {...field} />
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
                      <Input placeholder="City" {...field} />
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
                      <Input placeholder="State" {...field} />
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
                      <Input placeholder="ZIP code" {...field} />
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
                      <Input placeholder="Country" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="storeRoles"
              render={({ field }) => (
                <FormItem className="rounded-md border p-4">
                  <FormLabel>Store Assignments</FormLabel>
                  <div className="space-y-4">
                    {field.value?.map((assignment, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <div className="grid grid-cols-3 gap-2 flex-1">
                          <FormControl>
                            <Select
                              value={assignment.storeName || ''}
                              onValueChange={(value) => {
                                handleStoreChange(index, value);
                              }}
                              disabled={isLoading}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select store" />
                              </SelectTrigger>
                              <SelectContent>
                                {getAvailableStores(index).map((store) => (
                                  <SelectItem key={store.storeName} value={store.storeName}>
                                    {store.storeName}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormControl>
                            <MultiSelect
                              options={availableRoles as any}
                              selected={assignment.roleIds || []}
                              onChange={(values: string[]) => handleRoleChange(index, values)}
                              placeholder="Select roles..."
                              disabled={isLoading || !assignment.storeName}
                            />
                          </FormControl>
                          <FormControl>
                            <div className="flex items-center justify-end space-x-2 h-full">
                              <Switch
                                id={`current-store-${index}`}
                                checked={assignment.isCurrentStore || false}
                                onCheckedChange={(checked) => handleCurrentStoreChange(index, checked)}
                                disabled={!assignment.storeName}
                              />
                              <label
                                htmlFor={`current-store-${index}`}
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                              >
                                Current
                              </label>
                            </div>
                          </FormControl>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveAssignment(index)}
                          className="text-destructive"
                          disabled={isLoading || field.value?.length <= 1}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={handleAddAssignment}
                      disabled={isLoading}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Store Assignment
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                  <div className="space-y-1 leading-none">
                    <FormLabel className="text-sm font-medium">
                      {field.value ? "Active User" : "Inactive User"}
                    </FormLabel>
                  </div>
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : user ? "Update User" : "Create User"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
