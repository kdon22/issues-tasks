// Sign-in Page - Linear Clone
import { SignInForm } from "@/components/auth/signin-form";
import { requireNoAuth } from "@/lib/auth-utils";

export default async function SignInPage() {
  await requireNoAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            Linear Clone
          </h1>
          <p className="text-muted-foreground mt-2">
            Welcome back! Please sign in to continue.
          </p>
        </div>
        <SignInForm />
      </div>
    </div>
  );
} 