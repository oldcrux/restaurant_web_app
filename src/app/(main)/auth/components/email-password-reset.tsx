"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { sendPasswordResetEmail } from "supertokens-web-js/recipe/emailpassword";
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const FormSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
});

export function EmailPasswordResetForm() {
  const router = useRouter();
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      email: "",
    },
  });
  
  const { setError } = form;

  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      const response = await sendPasswordResetEmail({
        formFields: [{
          id: "email",
          value: data.email.trim()
        }]
      });

      if (response.status === "FIELD_ERROR") {
        response.formFields.forEach(formField => {
          if (formField.id === "email") {
            setError("email", {
              type: "manual",
              message: formField.error || "Please enter a valid email address."
            });
          }
        });
      } else {
        // Always show success message even if email doesn't exist (for security)
        toast.success("If an account with this email exists, you will receive a password reset link.");
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
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {form.formState.errors.root && (
            <div className="p-4 text-sm text-red-700 bg-red-100 rounded-md">
              {form.formState.errors.root.message}
            </div>
          )}
          
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input 
                    type="email" 
                    placeholder="Enter your email" 
                    {...field} 
                    className="w-full"
                    disabled={isSubmitting}
                    autoComplete="email"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="space-y-4">
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
                  Sending...
                </>
              ) : (
                'Send Reset Link'
              )}
            </Button>
            
            <div className="text-center text-sm">
              <span className="text-gray-600">Remember your password? </span>
              <Link 
                href="/auth/login" 
                className="font-medium text-primary hover:underline"
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
