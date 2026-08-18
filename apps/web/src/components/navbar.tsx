import { Button } from "@Productlytics/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@Productlytics/ui/components/dropdown-menu";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Package } from "lucide-react";
import { useState } from "react";

import { getMe, logout as logoutApi } from "@/api/auth";

export function Navbar() {
  return (
    <header className="flex items-center justify-around py-4">
      <Link to="/" className="flex items-center gap-2">
        <Package className="size-6" />
        <span className="text-lg font-semibold">Productlytics</span>
      </Link>

      {/* placeholder nav — final items decided later */}
      {/* <nav className="flex items-center gap-8 rounded-xl border px-8 py-2 text-sm">
        <span>Product</span>
        <span>Support</span>
      </nav> */}

      <AuthSection />
    </header>
  );
}

function AuthSection() {
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
