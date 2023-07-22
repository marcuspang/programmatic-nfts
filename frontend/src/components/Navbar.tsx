"use client";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { Wallet } from "./Wallet";
import { ColourChangeIcon } from "./ColourChangeIcon";

const links = [
  {
    name: "Sponsor",
    href: "/sponsor",
  },
];

export function Navbar() {
  const { setTheme, theme } = useTheme();

  return (
    <nav className="border-b border-gray-200">
      <div className="container flex flex-wrap items-center justify-between mx-auto p-4">
        <div className="flex items-center space-x-6">
          <Link href="/" className="flex items-center">
            <span className="self-center text-2xl font-semibold whitespace-nowrap dark:text-white">
              pNFT
            </span>
          </Link>
          <div className="hidden w-full md:block md:w-auto">
            <ul className="font-medium flex flex-col p-4 md:p-0 mt-4 border border-gray-100 rounded-lg bg-gray-50 md:flex-row md:space-x-8 md:mt-0 md:border-0 md:bg-white dark:bg-gray-800 md:dark:bg-gray-900 dark:border-gray-700">
              {links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="block hover:underline py-2 pl-3 pr-4 rounded md:bg-transparent md:p-0"
                    aria-current="page"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="md:flex items-center space-x-4 hidden">
          <ColourChangeIcon />
          <ConnectButton />
          {/* <Wallet /> */}
        </div>
        <div className="flex items-center space-x-4 md:hidden">
          <ColourChangeIcon />
          <Sheet>
            <SheetTrigger className="block md:hidden" asChild>
              <Button className="px-[10px]">
                <span className="sr-only">Open main menu</span>
                <svg
                  className="w-4 h-4"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 17 14"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M1 1h15M1 7h15M1 13h15"
                  />
                </svg>
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle className="text-left">Programmatic NFTs</SheetTitle>
                <SheetDescription>
                  <div>
                    <ConnectButton />
                  </div>
                </SheetDescription>
              </SheetHeader>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
