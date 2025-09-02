"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group z-[100]"
      position="top-center"
      toastOptions={{
        classNames: {
          toast: 'group [&>div[role="status"]]:text-inherit rounded-lg border p-4 shadow-lg',
          success: '!bg-[var(--toast-success-bg)] !text-[var(--toast-success-text)] !border-[var(--toast-success-border)]',
          error: '!bg-[var(--toast-error-bg)] !text-[var(--toast-error-text)] !border-[var(--toast-error-border)]',
          warning: '!bg-[var(--toast-warning-bg)] !text-[var(--toast-warning-text)] !border-[var(--toast-warning-border)]',
          info: '!bg-[var(--toast-info-bg)] !text-[var(--toast-info-text)] !border-[var(--toast-info-border)]',
          title: 'font-medium',
          description: 'opacity-90 mt-1',
          closeButton: '!text-current hover:!bg-black/10 dark:hover:!bg-white/10',
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
