import {
  Calendar,
  Users,
  LayoutDashboard,
  type LucideIcon,
  Menu,
  ShoppingBagIcon,
  DoorOpen,
} from "lucide-react";

export interface NavSubItem {
  title: string;
  url: string;
  icon?: LucideIcon;
  comingSoon?: boolean;
  newTab?: boolean;
  isNew?: boolean;
}

export interface NavMainItem {
  title: string;
  url: string;
  icon?: LucideIcon;
  subItems?: NavSubItem[];
  comingSoon?: boolean;
  newTab?: boolean;
  isNew?: boolean;
}

export interface NavGroup {
  id: number;
  label?: string;
  items: NavMainItem[];
}

export const sidebarItems: NavGroup[] = [
  {
    id: 1,
    label: "Dashboards",
    items: [
      {
        title: "Default",
        url: "/dashboard/default",
        icon: LayoutDashboard,
        comingSoon: true,
      },
      {
        title: "Orders",
        url: "/dashboard/orders",
        icon: ShoppingBagIcon,
      },
      {
        title: "Menu",
        url: "/dashboard/menu",
        icon: Menu,
      },
      {
        title: "Appointments",
        url: "/dashboard/appointments",
        icon: Calendar,
        comingSoon: true,
      },
    ],
  },
  {
    id: 2,
    label: "Pages",
    items: [
      {
        title: "Stores",
        url: "/dashboard/stores",
        icon: DoorOpen,
      },
      {
        title: "Users",
        url: "/dashboard/users",
        icon: Users,
      },
    ],
  },
];
