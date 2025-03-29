'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FiMenu, FiX } from 'react-icons/fi';
import { 
  SignedIn,
  SignedOut,
  UserButton,
  SignInButton,
  SignUpButton 
} from '@clerk/nextjs';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="bg-gray-100 text-black shadow-sm sticky top-0 z-50 border-b border-gray-300">
      <div className="max-w-full mx-0 px-4 sm:px-8">
        <div className="flex items-center h-24">
          {/* Left side with Logo and navigation */}
          <div className="flex items-center">
            {/* Logo and app name */}
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="flex items-center">
                <Image
                  src="/images/logo.png"
                  alt="FashionAI Logo"
                  width={80}
                  height={80}
                  className="mr-2"
                />
                <span className="text-3xl font-bold tracking-tight">
                  <span className="text-[#8c66ff]">Lux</span>
                </span>
              </Link>
            </div>

            {/* Desktop menu */}
            <div className="hidden md:flex md:items-center md:space-x-8 ml-8">
              <Link
                href="/"
                className="px-3 py-2 text-xl rounded-full hover:bg-[#8c66ff] hover:bg-opacity-20 transition-colors"
              >
                Home
              </Link>
              <Link
                href="/upload"
                className="px-3 py-2 text-xl rounded-full hover:bg-[#8c66ff] hover:bg-opacity-20 transition-colors"
              >
                Upload Photo
              </Link>
              <Link
                href="/features"
                className="px-3 py-2 text-xl rounded-full hover:bg-[#8c66ff] hover:bg-opacity-20 transition-colors"
              >
                Features
              </Link>
              <Link
                href="/outfits"
                className="px-3 py-2 text-xl rounded-full hover:bg-[#8c66ff] hover:bg-opacity-20 transition-colors"
              >
                Outfits
              </Link>
              <Link
                href="/about"
                className="px-3 py-2 text-xl rounded-full hover:bg-[#8c66ff] hover:bg-opacity-20 transition-colors"
              >
                About
              </Link>
            </div>
          </div>

          {/* Auth buttons */}
          <div className="hidden md:flex md:items-center md:space-x-4 ml-auto">
            <SignedOut>
              <SignInButton>
                <button className="px-5 py-2 text-xl rounded-full hover:bg-[#8c66ff] hover:bg-opacity-20 transition-colors">
                  Log in
                </button>
              </SignInButton>
              <SignUpButton>
                <button className="px-5 py-2 text-xl rounded-full bg-[#8c66ff] text-white hover:bg-[#7b5cf0] transition-colors">
                  Sign up
                </button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center ml-auto">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-black hover:text-[#8c66ff] focus:outline-none"
              aria-expanded={isOpen}
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? (
                <FiX className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <FiMenu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-gray-100">
            <Link
              href="/"
              className="block px-3 py-2 text-lg rounded-md hover:bg-[#8c66ff] hover:bg-opacity-20 transition-colors"
              onClick={toggleMenu}
            >
              Home
            </Link>
            <Link
              href="/upload"
              className="block px-3 py-2 text-lg rounded-md hover:bg-[#8c66ff] hover:bg-opacity-20 transition-colors"
              onClick={toggleMenu}
            >
              Upload Photo
            </Link>
            <Link
              href="/features"
              className="block px-3 py-2 text-lg rounded-md hover:bg-[#8c66ff] hover:bg-opacity-20 transition-colors"
              onClick={toggleMenu}
            >
              Features
            </Link>
            <Link
              href="/outfits"
              className="block px-3 py-2 text-lg rounded-md hover:bg-[#8c66ff] hover:bg-opacity-20 transition-colors"
              onClick={toggleMenu}
            >
              Outfits
            </Link>
            <Link
              href="/about"
              className="block px-3 py-2 text-lg rounded-md hover:bg-[#8c66ff] hover:bg-opacity-20 transition-colors"
              onClick={toggleMenu}
            >
              About
            </Link>
            <div className="pt-4 flex flex-col space-y-2">
              <SignedOut>
                <SignInButton>
                  <button 
                    className="block px-3 py-2 text-lg rounded-full hover:bg-[#8c66ff] hover:bg-opacity-20 transition-colors text-center"
                    onClick={toggleMenu}
                  >
                    Log in
                  </button>
                </SignInButton>
                <SignUpButton>
                  <button 
                    className="block px-3 py-2 text-lg rounded-full bg-[#8c66ff] text-white hover:bg-[#7b5cf0] transition-colors text-center"
                    onClick={toggleMenu}
                  >
                    Sign up
                  </button>
                </SignUpButton>
              </SignedOut>
              <SignedIn>
                <div className="flex justify-center">
                  <UserButton afterSignOutUrl="/" />
                </div>
              </SignedIn>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;