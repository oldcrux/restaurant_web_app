"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, FormProvider } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { signIn } from "supertokens-web-js/recipe/emailpassword";
import { useRouter } from 'next/navigation';
import Link from 'next/link';
const FormSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
  remember: z.boolean().optional(),
});

export function EmailPasswordForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      email: "",
      password: "",
      remember: false,
    },
  });
  
  const { setError } = form;

  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    await signInClicked(data.email, data.password);
  };


  async function signInClicked(email: string, password: string) {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
        let response = await signIn({
            formFields: [{
                id: "email",
                value: email
            }, {
                id: "password",
                value: password
            }]
        })
        if (response.status === "FIELD_ERROR") {
            response.formFields.forEach(formField => {
                if (formField.id === "email") {
                    // Email validation failed (for example incorrect email syntax).
                    setError("email", {
                      type: "manual",
                      message: formField.error
                    });
                }
            })
        } else if (response.status === "WRONG_CREDENTIALS_ERROR") {
            setError("root", {
              type: "manual",
              message: "Email or password is incorrect. Please try again."
            });
            setError("password", { type: "manual" });
        } else if (response.status === "SIGN_IN_NOT_ALLOWED") {
            window.alert(response.reason)
        } else {
            router.push("/dashboard/default");
        }
    } catch (err: any) {
      console.error("Sign in error:", err);
      let errorMessage = "An unexpected error occurred. Please try again.";
      
      if (err.isSuperTokensGeneralError === true) {
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
  }

  return (
    <div className="w-full">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {form.formState.errors.root && (
            <div className="p-4 text-sm text-red-700 bg-red-100 rounded-md mb-4">
              {form.formState.errors.root.message}
            </div>
          )}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email Address</FormLabel>
              <FormControl>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="you@example.com" 
                  autoComplete="email" 
                  disabled={isSubmitting}
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    autoComplete="current-password"
                    disabled={isSubmitting}
                    {...field}
                  />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="remember"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center">
              <FormControl>
                <Checkbox
                  id="login-remember"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  className="size-4"
                />
              </FormControl>
              <FormLabel htmlFor="login-remember" className="text-muted-foreground ml-1 text-sm font-medium">
                Remember me for 30 days
              </FormLabel>
            </FormItem>
          )}
        />
        <div className="flex flex-col space-y-4">
          <Button 
            type="submit"
            disabled={isSubmitting}
            className="w-full"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Signing in...
              </>
            ) : (
              'Sign in'
            )}
          </Button>
          <div className="text-center">
            <div className="text-sm">
              <Link 
                href="/auth/reset-password" 
                className="font-medium text-primary hover:underline"
              >
                Forgot password?
              </Link>
            </div>
          </div>
        </div>
        </form>
      </Form>
    </div>
  );
}
