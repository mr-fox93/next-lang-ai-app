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

  return (
    <div className="w-full px-4 pt-4">
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4 backdrop-blur-sm border border-white/10 rounded-full bg-black/50"
      >
        <Link href="/" className="flex items-center space-x-2">
          <div className="relative w-8 h-8">
            <Layers className="w-8 h-8 text-purple-500 absolute" />
            <Cpu className="w-4 h-4 text-pink-500 absolute bottom-0 right-0" />
          </div>
          <p className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent text-2xl font-bold">
            LearningByCards AI
          </p>
        </Link>

        <div className="hidden md:flex items-center space-x-8">
          <NavLink href="/flashcards">Flashcards</NavLink>
          <NavLink href="#">How It Works</NavLink>
        </div>

        <div className="hidden md:flex items-center space-x-4">
          {isSignedIn ? (
            <>
              <div className="flex items-center space-x-2">
                <UserButton />
                <span className="text-white font-medium">{user?.fullName}</span>
              </div>

              <SignOutButton>
                <Button className="bg-gradient-to-r from-purple-600 to-pink-600 opacity-100 group-hover:opacity-0 transition-opacity">
                  Log Out
                </Button>
              </SignOutButton>
            </>
          ) : (
            <Link href="/sign-in">
              <Button className="bg-gradient-to-r from-purple-600 to-pink-600 opacity-100 group-hover:opacity-0 transition-opacity">
                Sign In
              </Button>
            </Link>
          )}
        </div>

        <Button 
          variant="ghost" 
          size="icon" 
          className="md:hidden text-white"
          onClick={toggleMobileMenu}
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </Button>
      </motion.nav>

      {/* Menu mobilne */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-20 z-50 bg-black/95 backdrop-blur-md overflow-y-auto">
          <div className="flex flex-col items-center justify-start px-6 py-10">
            <div className="flex flex-col items-center w-full">
              {/* Linki nawigacyjne w menu mobilnym */}
              <Link 
                href="/flashcards"
                className="w-full border-b border-white/10 py-6 text-center text-xl font-medium text-gray-300 hover:text-white transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Flashcards
              </Link>
              <Link 
                href="#"
                className="w-full border-b border-white/10 py-6 text-center text-xl font-medium text-gray-300 hover:text-white transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                How It Works
              </Link>
            </div>
            
            {/* Sekcja konta użytkownika */}
            <div className="mt-12 w-full max-w-sm">
              <div className="bg-white/5 backdrop-blur-md rounded-xl border border-white/10 p-6">
                <div className="text-center mb-6">
                  <h3 className="text-white text-xl font-medium mb-1">Twoje konto</h3>
                  <p className="text-gray-400 text-sm">Zarządzaj swoim kontem lub zaloguj się</p>
                </div>
                
                {isSignedIn ? (
                  <>
                    <div className="flex items-center justify-center space-x-4 mb-6 p-4 rounded-lg bg-white/5">
                      <UserButton />
                      <span className="text-white font-medium">{user?.fullName || 'Użytkownik'}</span>
                    </div>
                    <SignOutButton>
                      <Button className="w-full h-12 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 transition-all duration-300">
                        Wyloguj się
                      </Button>
                    </SignOutButton>
                  </>
                ) : (
                  <Link href="/sign-in" className="w-full">
                    <Button className="w-full h-12 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 transition-all duration-300">
                      Zaloguj się
                    </Button>
                  </Link>
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
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="text-gray-300 hover:text-white transition-colors relative group"
    >
      {children}
      <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-purple-500 transition-all group-hover:w-full" />
    </Link>
  );
}
