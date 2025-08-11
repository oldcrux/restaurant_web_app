import React from "react";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";

export type SocialButtonVariant = 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
export type SocialButtonSize = 'default' | 'sm' | 'lg' | 'icon';

export interface SocialLoginButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
  variant?: SocialButtonVariant;
  size?: SocialButtonSize;
  children?: React.ReactNode;
  icon: React.ReactNode;
  bgClassName: string;
}

export function SocialLoginButtonBase({
  className,
  variant = "outline",
  size = "default",
  children,
  icon,
  bgClassName,
  ...props
}: SocialLoginButtonProps) {
  return (
    <Button
      variant={variant}
      size={size}
      className={cn(
        "w-full justify-center gap-3",
        bgClassName,
        className
      )}
      {...props}
    >
      {icon}
      {children}
    </Button>
  );
}
