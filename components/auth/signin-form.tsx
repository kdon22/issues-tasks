// Sign-in Form Component - Linear Clone
"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Github, Mail } from "lucide-react";

export function SignInForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        console.error("Sign in error:", result.error);
      } else {
        // After successful login, redirect to last accessed workspace
        const response = await fetch('/api/auth/last-workspace');
        if (response.ok) {
          const data = await response.json();
          if (data.workspaceUrl) {
            router.push(`/workspace/${data.workspaceUrl}`);
          } else {
            // No workspace found, redirect to home
            router.push("/");
          }
        } else {
          // Fallback to home if API call fails
          router.push("/");
        }
      }
    } catch (error) {
      console.error("Sign in error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProviderSignIn = async (provider: string) => {
    const result = await signIn(provider, { redirect: false });
    if (result?.ok) {
      // After successful OAuth login, redirect to last accessed workspace
      const response = await fetch('/api/auth/last-workspace');
      if (response.ok) {
        const data = await response.json();
        if (data.workspaceUrl) {
          router.push(`/workspace/${data.workspaceUrl}`);
        } else {
          router.push("/");
        }
      } else {
        router.push("/");
      }
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">
          Sign in to Linear Clone
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* OAuth Providers */}
        <div className="space-y-3">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => handleProviderSignIn("github")}
          >
            <Github className="mr-2 h-4 w-4" />
            Continue with GitHub
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => handleProviderSignIn("google")}
          >
            <Mail className="mr-2 h-4 w-4" />
            Continue with Google
          </Button>
        </div>

        <Separator className="my-4" />

        {/* Email/Password Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Button 
            type="submit" 
            className="w-full bg-orange text-orange-foreground hover:bg-orange/90"
            disabled={isLoading}
          >
            {isLoading ? "Signing in..." : "Sign in"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
} 