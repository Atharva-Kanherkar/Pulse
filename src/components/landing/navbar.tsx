"use client";

import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { LogOut, Shield, User } from "lucide-react";
import Image from "next/image";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";

// Modern headline font with character
const headlineFont = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

// Monospace for technical feel
const accentFont = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const Navbar = () => {
  const { signOut, useSession } = authClient;
  const { data: session } = useSession();

  const isAdmin = session?.user?.role === "admin";

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-green-500/20 bg-black/95 backdrop-blur-md supports-[backdrop-filter]:bg-black/80">
      {/* Subtle grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1a1a1a_1px,transparent_1px),linear-gradient(to_bottom,#1a1a1a_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-10"></div>
      
      <div className="container mx-auto flex h-16 items-center justify-between px-4 relative">
        {/* Logo/Brand */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg group-hover:shadow-green-500/25 transition-all duration-300 group-hover:scale-105">
              <Image
                src="/logo.png"
                alt="Pulse Logo"
                width={20}
                height={20}
                className="h-5 w-5 object-contain"
              />
            </div>
            <div className="flex flex-col">
              <span className={`font-bold text-xl text-white group-hover:text-green-400 transition-colors duration-300 ${headlineFont.className}`}>
                Pulse
              </span>
              <span className={`text-xs text-green-400/60 -mt-1 ${accentFont.className}`}>
                {/* AI Chief of Staff */}
                AI Chief of Staff
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          {session && (
            <div className="hidden md:flex items-center gap-2">
              <Link href="/dashboard">
                <Button 
                  variant="ghost" 
                  size="sm"
                  className={`text-white/80 hover:text-green-400 hover:bg-green-500/10 transition-all duration-300 ${accentFont.className}`}
                >
                  Dashboard
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-4">
          {!session ? (
            <div className="flex items-center gap-3">
              <Link href="/auth/register">
                <Button 
                  variant="ghost" 
                  size="sm"
                  className={`text-white/80 hover:text-green-400 hover:bg-green-500/10 transition-all duration-300 ${accentFont.className}`}
                >
                  Sign Up
                </Button>
              </Link>
              <Link href="/auth/login">
                <Button 
                  size="sm"
                  className={`bg-gradient-to-r from-green-500 to-emerald-600 text-black hover:from-green-400 hover:to-emerald-500 font-semibold transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-green-500/25 ${accentFont.className}`}
                >
                  Sign In
                </Button>
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              {/* Admin Badge */}
              {isAdmin && (
                <Badge
                  variant="secondary"
                  className={`hidden sm:flex items-center gap-1 bg-green-500/10 text-green-400 border border-green-500/30 hover:bg-green-500/20 transition-colors duration-300 ${accentFont.className}`}
                >
                  <Shield className="h-3 w-3" />
                  {/* Admin */}
                  Admin
                </Badge>
              )}

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-9 w-9 rounded-full hover:bg-green-500/10 transition-all duration-300"
                  >
                    <Avatar className="h-9 w-9 border-2 border-green-500/20 hover:border-green-500/50 transition-colors duration-300">
                      <AvatarImage
                        src={session.user.image || ""}
                        alt={session.user.name || ""}
                      />
                      <AvatarFallback className={`text-sm bg-green-500/10 text-green-400 ${accentFont.className}`}>
                        {session.user.name?.charAt(0)?.toUpperCase() ||
                          session.user.email?.charAt(0)?.toUpperCase() ||
                          "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  className="w-64 bg-black/95 backdrop-blur-md border border-green-500/20 shadow-xl" 
                  align="end" 
                  forceMount
                >
                  <DropdownMenuLabel className="font-normal p-4">
                    <div className="flex flex-col space-y-2">
                      <div className={`text-xs text-green-400/60 ${accentFont.className}`}>
                        {/* User Profile */}
                        User Profile
                      </div>
                      <p className={`text-sm font-semibold leading-none text-white ${headlineFont.className}`}>
                        {session.user.name || "User"}
                      </p>
                      <p className={`text-xs leading-none text-white/60 ${accentFont.className}`}>
                        {session.user.email
                          ? session.user.email.replace(/^[^@]+/, "***")
                          : ""}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-green-500/20" />

                  <DropdownMenuItem 
                    asChild
                    className="focus:bg-green-500/10 focus:text-green-400 cursor-pointer transition-colors duration-200"
                  >
                    <Link href="/dashboard" className={`flex items-center text-white/80 ${accentFont.className}`}>
                      <User className="mr-3 h-4 w-4" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>

                  {/* Admin Panel Link - Only show for admin users */}
                  {isAdmin && (
                    <DropdownMenuItem 
                      asChild
                      className="focus:bg-green-500/10 focus:text-green-400 cursor-pointer transition-colors duration-200"
                    >
                      <Link href="/admin" className={`flex items-center text-white/80 ${accentFont.className}`}>
                        <Shield className="mr-3 h-4 w-4" />
                        Admin Panel
                      </Link>
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuSeparator className="bg-green-500/20" />
                  <DropdownMenuItem
                    onClick={() => signOut()}
                    className={`cursor-pointer text-red-400 focus:text-red-300 focus:bg-red-500/10 transition-colors duration-200 ${accentFont.className}`}
                  >
                    <LogOut className="mr-3 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
