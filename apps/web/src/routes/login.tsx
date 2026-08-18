import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@Productlytics/ui/components/card";
import { Button } from "@Productlytics/ui/components/button";
import { Input } from "@Productlytics/ui/components/input";
import { Label } from "@Productlytics/ui/components/label";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

import { login as loginApi } from "@/api/auth";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const login = useMutation({
    mutationFn: () => loginApi({ email, password }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["me"] });
      navigate({ to: "/" });
    },
  });

  return (
    <div className="flex h-full items-center justify-center px-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Log in</CardTitle>
          <CardDescription>Sign in to manage your products</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="flex flex-col gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              login.mutate();
            }}
          >
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {login.isError && (
              <p className="text-sm text-destructive">{login.error.message}</p>
            )}
            <Button type="submit" disabled={login.isPending}>
              {login.isPending ? "Logging in…" : "Log in"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
