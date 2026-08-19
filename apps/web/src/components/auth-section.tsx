import { getMe } from "@/api/auth";
import { Button } from "@Productlytics/ui/components/button";
import {
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@Productlytics/ui/components/dropdown-menu";

import { DropdownMenu } from "@Productlytics/ui/components/dropdown-menu";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useState } from "react";

import { logout as logoutApi } from "@/api/auth";

export function AuthSection() {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const me = useQuery({
    queryKey: ["me"],
    queryFn: getMe,
    retry: false,
  });

  const logout = useMutation({
    mutationFn: logoutApi,
    onSuccess: () => {
      setOpen(false);
      window.location.href = "/login";
      queryClient.invalidateQueries({ queryKey: ["me"] });
    },
  });

  if (!me.data) {
    return (
      <Button size="sm" render={<Link to="/login" />}>
        Log In
      </Button>
    );
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger
        render={<Button variant="outline" size="sm" />}
        onMouseEnter={() => setOpen(true)}
      >
        {me.data.email}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" onMouseLeave={() => setOpen(false)}>
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => logout.mutate()}>
            Log out
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
