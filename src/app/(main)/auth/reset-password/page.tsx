// src/app/(main)/auth/reset-password/page.tsx
"use client";

import { useSearchParams } from "next/navigation";
import { EmailPasswordResetForm } from "../components/email-password-reset";
import { ResetPasswordForm } from "../components/reset-password-form";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  if (token) {
    return (
      <div className="container flex h-screen w-screen flex-col items-center justify-center">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              Create a new password
            </h1>
            <p className="text-sm text-muted-foreground">
              Enter a new password for your account
            </p>
          </div>
          <ResetPasswordForm token={token} />
        </div>
      </div>
    );
  }

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Reset your password
          </h1>
          <p className="text-sm text-muted-foreground">
            Enter your email and we'll send you a password reset link
          </p>
        </div>
        <EmailPasswordResetForm />
      </div>
    </div>
  );
}