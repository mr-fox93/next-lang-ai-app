"use client";
import { useUser, UserButton, SignOutButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Menu, Layers, Cpu, X } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import type React from "react";
import { useState } from "react";

export default function Navbar() {
  const { user, isSignedIn } = useUser();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const scrollToHowItWorks = (e: React.MouseEvent) => {
    e.preventDefault();
    const howItWorksSection = document.getElementById("how-it-works");
    if (howItWorksSection) {
      howItWorksSection.scrollIntoView({ behavior: "smooth" });
      if (mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    }
  };

  return (
    <div className="w-full px-4 pt-4">
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="max-w-7xl mx-auto grid grid-cols-3 items-center px-6 py-4 backdrop-blur-sm border border-white/10 rounded-full bg-black/50"
      >
        <div className="flex items-center">
          <Link href="/" className="flex items-center space-x-2">
            <div className="relative w-8 h-8">
              <Layers className="w-8 h-8 text-purple-500 absolute" />
              <Cpu className="w-4 h-4 text-pink-500 absolute bottom-0 right-0" />
            </div>
            <p className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent text-2xl font-bold">
              Languito
            </p>
          </Link>
        </div>

        <div className="hidden md:flex items-center justify-center space-x-8">
          <NavLink href="/flashcards">Flashcards</NavLink>
          <NavLink href="#how-it-works" onClick={scrollToHowItWorks}>
            How It Works
          </NavLink>
        </div>

        <div className="hidden md:flex items-center justify-end space-x-4">
          {isSignedIn ? (
            <>
              <div className="flex items-center space-x-2">
                <UserButton />
                <span className="text-white font-medium">{user?.fullName}</span>
              </div>

              <SignOutButton>
                <Button className="relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-100 group-hover:opacity-0 transition-opacity" />
                  <div className="absolute inset-0 bg-purple-700 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span className="relative">Log Out</span>
                </Button>
              </SignOutButton>
            </>
          ) : (
            <div className="flex items-center space-x-3">
              <Link href="/sign-in">
                <Button className="bg-gradient-to-r from-purple-600 to-pink-600 opacity-100 group-hover:opacity-0 transition-opacity relative overflow-hidden group">
                  <div className="absolute inset-0 bg-purple-700 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span className="relative">Sign In</span>
                </Button>
              </Link>
              <Link href="https://nearby-mackerel-82.accounts.dev/sign-up">
                <Button className="relative overflow-hidden group bg-purple-700 hover:bg-purple-600 transition-colors">
                  <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-purple-600 opacity-100 group-hover:opacity-0 transition-opacity" />
                  <span className="relative">Create Account</span>
                </Button>
              </Link>
            </div>
          )}
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="md:hidden text-white col-start-3 justify-self-end"
          onClick={toggleMobileMenu}
        >
          {mobileMenuOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </Button>
      </motion.nav>

      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-20 z-50 bg-black/95 backdrop-blur-md overflow-y-auto">
          <div className="flex flex-col items-center justify-start px-6 py-10">
            <div className="flex flex-col items-center w-full">
              <Link
                href="/flashcards"
                className="w-full border-b border-white/10 py-6 text-center text-xl font-medium text-gray-300 hover:text-white transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Flashcards
              </Link>
              <a
                href="#how-it-works"
                className="w-full border-b border-white/10 py-6 text-center text-xl font-medium text-gray-300 hover:text-white transition-colors"
                onClick={scrollToHowItWorks}
              >
                How It Works
              </a>
            </div>

            <div className="mt-12 w-full max-w-sm">
              <div className="bg-white/5 backdrop-blur-md rounded-xl border border-white/10 p-6">
                <div className="text-center mb-6">
                  <h3 className="text-white text-xl font-medium mb-1">
                    Your Account
                  </h3>
                  <p className="text-gray-400 text-sm">
                    Manage your account or sign in
                  </p>
                </div>

                {isSignedIn ? (
                  <>
                    <div className="flex items-center justify-center space-x-4 mb-6 p-4 rounded-lg bg-white/5">
                      <UserButton />
                      <span className="text-white font-medium">
                        {user?.fullName || "User"}
                      </span>
                    </div>
                    <SignOutButton>
                      <Button className="w-full h-12 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-100 group-hover:opacity-0 transition-opacity" />
                        <div className="absolute inset-0 bg-purple-700 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <span className="relative">Log Out</span>
                      </Button>
                    </SignOutButton>
                  </>
                ) : (
                  <div className="flex flex-col space-y-3 w-full">
                    <Link href="/sign-in" className="w-full">
                      <Button className="w-full h-12 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-100 group-hover:opacity-0 transition-opacity" />
                        <div className="absolute inset-0 bg-purple-700 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <span className="relative">Sign In</span>
                      </Button>
                    </Link>
                    <Link
                      href="https://nearby-mackerel-82.accounts.dev/sign-up"
                      className="w-full"
                    >
                      <Button className="w-full h-12 relative overflow-hidden group bg-purple-700 hover:bg-purple-600 transition-colors">
                        <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-purple-600 opacity-100 group-hover:opacity-0 transition-opacity" />
                        <span className="relative">Create Account</span>
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function NavLink({
  href,
  children,
  onClick,
}: {
  href: string;
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent) => void;
}) {
  return (
    <a
      href={href}
      onClick={onClick}
      className="text-gray-300 hover:text-white transition-colors relative group"
    >
      {children}
      <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-purple-500 transition-all group-hover:w-full" />
    </a>
  );
}
