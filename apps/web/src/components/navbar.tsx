import { Link } from "@tanstack/react-router";
import { Package } from "lucide-react";

import { AuthSection } from "./auth-section";

export function Navbar() {
  return (
    <header className="flex items-center justify-around py-4">
      <Link to="/" className="flex items-center gap-2">
        <Package className="size-6" />
        <span className="text-lg font-semibold">Productlytics</span>
      </Link>

      {/* placeholder nav — final items decided later */}
      <nav className="flex items-center gap-8 rounded-xl border px-8 py-2 text-sm">
        <span>
          <a href="/products">Products</a>
        </span>
      </nav>

      <AuthSection />
    </header>
  );
}
