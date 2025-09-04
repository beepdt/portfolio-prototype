"use client";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import CustomEase from "gsap/CustomEase";
gsap.registerPlugin(CustomEase, useGSAP);
import "./style.css";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef } from "react";

export default function Navbar() {
  const menyToggleBtnRef = useRef(null);
  const menuOverlayRef = useRef(null);
  const menuOverlayContentRef = useRef(null);
  const HamburgerIconRef = useRef(null);

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

  useGSAP(() => {
    let isMenuOpen = false;
    let isAnimation = false;
    CustomEase.create("hop", ".87, 0, .13, 1");

    //@ts-ignore
    menyToggleBtnRef.current.addEventListener("click", () => {
      if (isAnimation) return;

      if (!isMenuOpen) {
        isAnimation = true;

        const tl = gsap.timeline();

        // Opening animation: reveal from bottom
        tl.to(
          menuOverlayRef.current,
          {
            clipPath: "polygon(0% 0%,100% 0%, 100% 100%,0% 100%)",
            duration: 1,
            ease: "hop",
          },
          "<"
        ).to(
          menuOverlayContentRef.current,
          {
            // Change from yPercent: 0 to translateY: "0%"
            translateY: "0%",
            duration: 1,
            ease: "hop",
          },
          "<"
        );

        HamburgerIconRef.current.classList.add("active");

        tl.call(() => {
          isAnimation = false;
        });

        isMenuOpen = true;
      } else {
        isAnimation = true;

        HamburgerIconRef.current.classList.remove("active");
        const tl = gsap.timeline();

        // Closing animation: hide to bottom
        tl.to(
          menuOverlayRef.current,
          {
            clipPath: "polygon(0% 100%,100% 100%, 100% 100%,0% 100%)",
            duration: 1,
            ease: "hop",
          },
          "<"
        ).to(
          menuOverlayContentRef.current,
          {
            // Change from yPercent: -50 to translateY: "100%"
            translateY: "100%",
            duration: 1,
            ease: "hop",
          },
          "<"
        );

        tl.call(() => {
          isAnimation = false;
        });

        isMenuOpen = false;
      }
    });
  });

  return (
    <div className="navbar flex items-center justify-between gap-4  bg-black  rounded-md">
      <div className="bg-gray-500 rounded-sm avatar z-99">
        <div className="w-10 h-10 bg-amber-500 rounded-md" />
      </div>

      <nav className="flex menu-bar  items-center gap-4 ">
        <div ref={menyToggleBtnRef} className="menu-toggle-button z-99">
          <div ref={HamburgerIconRef} className="menu-hamburger-icon">
            <span></span>
            <span></span>
          </div>
        </div>
        <div ref={menuOverlayRef} className="nav-menu-overlay">
          <div ref={menuOverlayContentRef} className="menu-overlay-content">
            <div className="menu-content-wrapper">
              <div className="menu-col">
                {routes.map((route) => (
                  <Link
                    key={route.href}
                    href={route.href}
                    className={`rounded-sm nav-item h-10 flex items-center ${
                      route.active
                        ? "bg-white text-black"
                        : "bg-black text-white"
                    }`}
                  >
                    <h2>{route.name}</h2>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
}
