import React from "react";
import { SocialLoginButtonBase } from "./social-button";
import type { SocialButtonVariant, SocialButtonSize } from "./social-button";

interface FacebookLoginButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
  variant?: SocialButtonVariant;
  size?: SocialButtonSize;
  children?: React.ReactNode;
}

export function FacebookLoginButton({
  className,
  variant,
  size,
  children = "Continue with Facebook",
  ...props
}: FacebookLoginButtonProps) {
  return (
    <SocialLoginButtonBase
      variant={variant}
      size={size}
      className={className}
      icon={<FacebookIcon className="size-5" />}
      bgClassName="bg-[#1877F2] hover:bg-[#166FE5] text-white border-[#1877F2] hover:border-[#166FE5] dark:bg-[#1877F2] dark:border-[#1877F2] dark:hover:bg-[#166FE5] dark:hover:border-[#166FE5]"
      {...props}
    >
      {children}
    </SocialLoginButtonBase>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

// svg icon from https://github.com/michaeljscript/react-social-login-buttons/