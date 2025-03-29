'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FiMenu, FiX } from 'react-icons/fi';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="bg-gray-100 text-black shadow-sm sticky top-0 z-50 border-b border-gray-300">
      <div className="max-w-full mx-0 px-8">
        <div className="flex items-center h-22">
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
                  Fashion<span className="text-green-500">AI</span>
                </span>
              </Link>
            </div>

            {/* Desktop menu - larger text */}
            <div className="hidden md:flex md:items-center md:space-x-8 ml-10">
              <Link
                href="/"
                className="px-3 py-2 text-xl rounded-full hover:bg-green-600 hover:bg-opacity-20 transition-all"
              >
                Home
              </Link>
              <Link
                href="/upload"
                className="px-3 py-2 text-xl rounded-full hover:bg-green-600 hover:bg-opacity-20 transition-all"
              >
                Upload Photo
              </Link>
              <Link
                href="/features"
                className="px-3 py-2 text-xl rounded-full hover:bg-green-600 hover:bg-opacity-20 transition-all"
              >
                Features
              </Link>
              <Link
                href="/outfits"
                className="px-3 py-2 text-xl rounded-full hover:bg-green-600 hover:bg-opacity-20 transition-all"
              >
                Outfits
              </Link>
              <Link
                href="/about"
                className="px-3 py-2 text-xl rounded-full hover:bg-green-600 hover:bg-opacity-20 transition-all"
              >
                About
              </Link>
            </div>
          </div>

          {/* Auth buttons - moved more to the right */}
          <div className="hidden md:flex md:items-center md:space-x-4 ml-auto">
            <Link
              href="/login"
              className="px-5 py-2 text-xl rounded-full hover:bg-green-600 hover:bg-opacity-20 transition-colors"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="px-5 py-2 text-xl rounded-full bg-green-600 hover:bg-green-500 transition-colors"
            >
              Sign up
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center ml-auto">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-black hover:text-green-400 focus:outline-none"
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

      {/* Mobile menu, show/hide based on menu state */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-gray-100">
            <Link
              href="/"
              className="block px-3 py-2 text-lg rounded-md hover:bg-gray-200 transition-colors"
              onClick={toggleMenu}
            >
              Home
            </Link>
            <Link
              href="/upload"
              className="block px-3 py-2 text-lg rounded-md hover:bg-gray-200 transition-colors"
              onClick={toggleMenu}
            >
              Upload Photo
            </Link>
            <Link
              href="/features"
              className="block px-3 py-2 text-lg rounded-md hover:bg-gray-200 transition-colors"
              onClick={toggleMenu}
            >
              Features
            </Link>
            <Link
              href="/outfits"
              className="block px-3 py-2 text-lg rounded-md hover:bg-gray-200 transition-colors"
              onClick={toggleMenu}
            >
              Outfits
            </Link>
            <Link
              href="/about"
              className="block px-3 py-2 text-lg rounded-md hover:bg-gray-200 transition-colors"
              onClick={toggleMenu}
            >
              About
            </Link>
            <div className="pt-4 flex flex-col space-y-2">
              <Link
                href="/login"
                className="block px-3 py-2 text-lg rounded-full hover:bg-green-600 hover:bg-opacity-20 transition-colors text-center"
                onClick={toggleMenu}
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="block px-3 py-2 text-lg rounded-full bg-green-600 hover:bg-green-500 transition-colors text-center"
                onClick={toggleMenu}
              >
                Sign up
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
