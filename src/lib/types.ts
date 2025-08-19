export interface Organization {
  orgName: string;
  phoneNumber: string;
  emailId: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  timezone: string;
}

export interface StoreHours {
  monday: [string, string] | null;  // Format: ["HH:MM TZ", "HH:MM TZ"]
  tuesday: [string, string] | null;
  wednesday: [string, string] | null;
  thursday: [string, string] | null;
  friday: [string, string] | null;
  saturday: [string, string] | null;
  sunday: [string, string] | null;
}

export const timezones = [
  { value: 'EST', label: 'Eastern Time (EST/EDT)' },
  { value: 'CST', label: 'Central Time (CST/CDT)' },
  { value: 'MST', label: 'Mountain Time (MST/MDT)' },
  { value: 'PST', label: 'Pacific Time (PST/PDT)' },
  { value: 'AKST', label: 'Alaska Time (AKST/AKDT)' },
  { value: 'HST', label: 'Hawaii Time (HST/HDT)' },
  { value: 'UTC', label: 'Coordinated Universal Time (UTC)' },
];

export interface Store {
  orgName: string;
  storeId: string;
  storeName: string;
  timezone: string;
  storeHour: StoreHours;
  dineInCapacity: number;
  slotDurationMinutes: number;
  isActive: boolean;
  phoneNumber: string;
  trunkPhoneNumber: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  createdBy: string;
  updatedBy: string;
}

export interface StoreRoleAssignment {
  storeName?: string;
  roleIds: string[];
  roleNames?: string[];
  isCurrentStore?: boolean;
}

export interface User {
  emailId: string;
  userId: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  isActive: boolean;
  address1: string;
  address2: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  userType: string;
  password: string;
  createdBy: string;
  updatedBy: string;
  orgName: string;
  storeId?: string;
  storeName: string;
  roles: string[];
  permissions: string[];
  storeRoles?: StoreRoleAssignment[];
}

export interface Role {
  roleName: string;
  roleId: string;
  label?: string;
  value?: string;
}

export interface MenuItem {
  orgName: string;
  storeName?: string;
  selectedStores?: string[];
  itemName: string;
  itemDescription: string;
  itemPrice: number;
  itemComposition: string;
  customizable: boolean;
  createdBy: string;
  updatedBy: string;
}

export interface Order {
  id: string,
  customerName: string;
  customerPhoneNumber: string;
  totalCost: number;
  totalDiscount: number;
  status: string;
  createdBy: string;
  updatedBy: string;
  orgName: string;
  storeName: string;
  orderNumber: number;
  notes: string,
  createdAt: string,
  updatedAt: string,
  orderDetails?: OrderDetails[];
}

export interface OrderDetails {
  id: string,
  orderId: string,
  orderNumber: number,
  status: string;
  item: string,
  itemPrice: number,
  quantity: number,
  notes: string,
  createdBy: string,
  updatedBy: string,
}