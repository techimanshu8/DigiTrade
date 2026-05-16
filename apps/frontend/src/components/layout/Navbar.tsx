'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Activity, Users, FileText, Globe, Menu, X, ArrowRightLeft } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/', icon: Activity },
    { name: 'Beneficiaries', href: '/beneficiaries', icon: Users },
    { name: 'Quotes', href: '#', icon: ArrowRightLeft },
    { name: 'Documents', href: '#', icon: FileText },
  ];

  return (
    <nav className="bg-indigo-600 shadow-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between">
          <div className="flex">
            <div className="flex flex-shrink-0 items-center">
              <Link href="/" className="flex items-center gap-2">
                <div className="bg-white p-1 rounded-md">
                  <Globe className="h-6 w-6 text-indigo-600" />
                </div>
                <span className="text-xl font-bold text-white tracking-tight">DigiTrade</span>
              </Link>
            </div>
            <div className="hidden sm:-my-px sm:ml-8 sm:flex sm:space-x-8">
              {navigation.map((item) => {
                const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      isActive
                        ? 'border-white text-white'
                        : 'border-transparent text-indigo-100 hover:border-indigo-300 hover:text-white',
                      'inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium transition-colors'
                    )}
                  >
                    <item.icon className="mr-2 h-4 w-4" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>
          
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {/* User profile dropdown placeholder */}
            <div className="relative ml-3">
              <button
                type="button"
                className="flex rounded-full bg-indigo-700 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-600"
              >
                <span className="sr-only">Open user menu</span>
                <div className="h-8 w-8 rounded-full bg-indigo-200 flex items-center justify-center text-indigo-700 font-bold">
                  JD
                </div>
              </button>
            </div>
          </div>

          <div className="-mr-2 flex items-center sm:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center rounded-md bg-indigo-600 p-2 text-indigo-200 hover:bg-indigo-500 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-600"
            >
              <span className="sr-only">Open main menu</span>
              {mobileMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={cn("sm:hidden", mobileMenuOpen ? "block" : "hidden")}>
        <div className="space-y-1 pb-3 pt-2">
          {navigation.map((item) => {
            const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  isActive
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                    : 'border-transparent text-indigo-100 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700',
                  'block border-l-4 py-2 pl-3 pr-4 text-base font-medium transition-colors flex items-center'
                )}
                onClick={() => setMobileMenuOpen(false)}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
