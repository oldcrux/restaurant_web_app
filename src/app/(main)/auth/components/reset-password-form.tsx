'use client';

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { submitNewPassword } from "supertokens-web-js/recipe/emailpassword";
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const FormSchema = z.object({
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters." })
    .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter." })
    .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter." })
    .regex(/[0-9]/, { message: "Password must contain at least one number." }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

interface ResetPasswordFormProps {
  token: string;
}

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });
  
  const { setError } = form;

  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      const response = await submitNewPassword({
        formFields: [
          {
            id: "password",
            value: data.password,
          },
        ],
      });

      if (response.status === "FIELD_ERROR") {
        response.formFields.forEach((formField) => {
          if (formField.id === "password") {
            setError("password", {
              type: "manual",
              message: formField.error,
            });
          }
        });
      } else if (response.status === "RESET_PASSWORD_INVALID_TOKEN_ERROR") {
        setError("root", {
          type: "manual",
          message: "Password reset token is invalid or has expired. Please request a new password reset link.",
        });
      } else {
        // Success - show success message
        toast.success("Password reset successful!");
        toast.success("You can now sign in with your new password.");
        
        // Reset form
        form.reset();
        
        // Redirect to login after a short delay
        setTimeout(() => {
          router.push("/auth/login");
        }, 3000);
      }
    } catch (err: any) {
      console.error("Password reset error:", err);
      let errorMessage = "An unexpected error occurred. Please try again.";
      
      if (err.isSuperTokensGeneralError) {
        errorMessage = err.message || errorMessage;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      toast.error(errorMessage);
      setError("root", {
        type: "manual",
        message: errorMessage
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <div className="space-y-4">
        <p className="text-sm text-gray-600 mb-6">
          Enter your new password below. Make sure it's at least 8 characters long and includes a mix of uppercase and lowercase letters, numbers, and special characters.
        </p>
        
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {form.formState.errors.root && (
            <div className="p-4 text-sm text-red-700 bg-red-100 rounded-md">
              {form.formState.errors.root.message}
            </div>
          )}
        
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>New Password</FormLabel>
              <FormControl>
                <Input 
                  type="password" 
                  placeholder="Enter your new password" 
                  {...field} 
                  disabled={isSubmitting}
                  autoComplete="new-password"
                  className="w-full"
                />
              </FormControl>
              <FormMessage />
              <p className="mt-1 text-xs text-gray-500">
                Must be at least 8 characters with uppercase, lowercase, and a number.
              </p>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm New Password</FormLabel>
              <FormControl>
                <Input 
                  type="password" 
                  placeholder="Confirm your new password" 
                  {...field} 
                  disabled={isSubmitting}
                  autoComplete="new-password"
                  className="w-full"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex flex-col space-y-4">
          <Button 
            type="submit" 
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Resetting Password...
              </>
            ) : (
              'Reset Password'
            )}
          </Button>
          
          <div className="text-center">
            <Link 
              href="/auth/login" 
              className="text-sm text-primary-600 hover:text-primary-500 hover:underline"
            >
              Back to Sign In
            </Link>
          </div>
        </div>
      </form>
    </div>
    </Form>
  );
}
