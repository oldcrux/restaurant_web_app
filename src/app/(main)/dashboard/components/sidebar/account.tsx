"use client";

import { useState } from "react";
import { LogOut } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { cn, getInitials } from "@/lib/utils";
import { logout } from "@/auth/supertokens/auth-actions";
import { StoreSwitcher } from "./store-switcher";

type User = {
  id: string;
  userId?: string | null;
  emailId?: string | null;
  image?: string | null;
  currentStore?: string;
  storeRoles?: any;
};

export function Account({ user }: { user?: User | null }) {
  const defaultUser: User = {
    id: '',
    userId: '',
    emailId: '',
    image: null,
  };

  const [sessionUser, setSessionUser] = useState<User>(user || defaultUser);

  // Ensure we always have a valid user object
  const currentUser = user || defaultUser;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="size-9 rounded-lg cursor-pointer">
          <AvatarImage
            src={sessionUser?.image || undefined}
            alt={sessionUser?.userId || 'User'}
          />
          <AvatarFallback className="rounded-lg">
            {getInitials(sessionUser?.userId || 'UU')}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="min-w-56 space-y-1 rounded-lg" side="bottom" align="end" sideOffset={4}>

        <DropdownMenuItem
          key={currentUser.id}
          className={cn(
            "p-0",
            currentUser.id === sessionUser?.id && "bg-accent/50 border-l-primary border-l-2"
          )}
        >
          <div className="flex w-full items-center justify-between gap-2 px-1 py-1.5">
            <Avatar className="size-9 rounded-lg">
              <AvatarImage
                src={currentUser?.image || undefined}
                alt={currentUser?.userId || 'User'}
              />
              <AvatarFallback className="rounded-lg">
                {getInitials(currentUser?.userId || 'UU')}
              </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight min-w-0">
              <span className="truncate font-semibold">
                {currentUser?.userId || 'User'}
              </span>
              {currentUser?.emailId && (
                <span className="truncate text-xs text-muted-foreground">
                  {currentUser.emailId}
                </span>
              )}
            </div>
          </div>
        </DropdownMenuItem>

        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <StoreSwitcher
              currentStore={sessionUser?.currentStore || ''}
              storeRoles={sessionUser?.storeRoles || []}
              onStoreChange={(storeName) =>
                setSessionUser((prev) => ({ ...prev, currentStore: storeName }))
              }
            />
          </DropdownMenuItem>
          {/* <DropdownMenuItem>
            <BadgeCheck />
            Account
          </DropdownMenuItem>
          <DropdownMenuItem>
            <CreditCard />
            Billing
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Bell />
            Notifications
          </DropdownMenuItem> */}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={async () => await logout()}>
          <LogOut />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
