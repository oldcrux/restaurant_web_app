"use client"
import { APP_CONFIG } from "@/config/app-config";
import { EmailPasswordForm } from "../components/email-password";
import { GoogleLoginButton } from "@/components/social-button/google-button";
import { FacebookLoginButton } from "@/components/social-button/facebook-button";

export default function Login() {
  const registerHref = process.env.NEXT_PUBLIC_WEBSITE+"/register" || "#";

  return (
    <>
      <div className="mx-auto flex w-full flex-col justify-center space-y-8 sm:w-[350px]">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-medium">Login to your account</h1>
          <p className="text-muted-foreground text-sm">Please enter your details to login.</p>
        </div>
        <div className="space-y-4">
          <GoogleLoginButton onClick={() => console.log("Google login clicked")}/>
          <FacebookLoginButton onClick={() => console.log("Facebook login clicked")}/>
          
          <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
            <span className="bg-background text-muted-foreground relative z-10 px-2">Or continue with</span>
          </div>
          <EmailPasswordForm />
        </div>
      </div>

      <div className="absolute top-5 flex w-full justify-center px-10">
        <div className="text-muted-foreground text-sm">
          Don&apos;t have an account?{" "}
          <a
            className="text-foreground"
            href={registerHref}
            target="_blank"
            rel="noopener noreferrer"
          >
            Register
          </a>
        </div>
      </div>

      <div className="absolute bottom-5 flex w-full justify-between px-10">
        <div className="text-sm">{APP_CONFIG.copyright}</div>
      </div>
    </>
  );
}
