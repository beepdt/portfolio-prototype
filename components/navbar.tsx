"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  const routes = [
    {
      name: "Home",
      href: "/",
      active: pathname === "/",
    },
    {
      name: "About",
      href: "/about",
      active: pathname === "/about",
    },
    {
      name: "Works",
      href: "/projects",
      active: pathname === "/projects",
    },
  ];

  return (
    <div className="navbar flex items-center justify-between gap-4  bg-black  rounded-md">
      <div className="bg-gray-500 rounded-sm avatar">
        <div className="w-10 h-10 bg-amber-500 rounded-md" />
      </div>
      
      <nav className="flex  items-center gap-4 ">
        {routes.map((route) => (
          <Link
            key={route.href}
            href={route.href}
            className={`rounded-sm nav-item h-10 flex items-center ${
              route.active ? "bg-white text-black" : "text-gray-400"
            }`}
          >
            <h2>
              {route.name}
            </h2>
          </Link>
        ))}
      </nav>
    </div>
  );
}
