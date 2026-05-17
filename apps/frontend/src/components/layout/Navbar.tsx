'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Activity, Users, FileText, Send, Menu, X, ArrowRightLeft, LogOut } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Activity },
    { name: 'Send Money', href: '/send-money', icon: Send },
    { name: 'Beneficiaries', href: '/beneficiaries', icon: Users },
    { name: 'Payments', href: '/payments', icon: ArrowRightLeft },
    { name: 'Documents', href: '#', icon: FileText },
  ];

  const isAuthPage = pathname === '/';

  return (
    <nav className="sticky top-0 z-50 bg-gradient-to-r from-indigo-600 to-blue-600 shadow-lg">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between">
          <div className="flex">
            <div className="flex flex-shrink-0 items-center">
              <Link href="/" className="flex items-center gap-2 group">
                <div className="bg-white p-1 rounded-lg group-hover:scale-110 transition-transform">
                  <Send className="h-6 w-6 text-indigo-600" />
                </div>
                <span className="text-xl font-bold text-white tracking-tight hidden sm:inline">DigiTrade</span>
              </Link>
            </div>
            
            {!isAuthPage && (
              <div className="hidden sm:-my-px sm:ml-8 sm:flex sm:space-x-1">
                {navigation.map((item) => {
                  const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={cn(
                        isActive
                          ? 'bg-white/20 text-white border-b-2 border-white'
                          : 'text-indigo-100 hover:bg-white/10 hover:text-white border-b-2 border-transparent',
                        'inline-flex items-center px-3 pt-1 text-sm font-medium transition-all'
                      )}
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
          
          <div className="hidden sm:ml-6 sm:flex sm:items-center gap-4">
            {!isAuthPage && (
              <>
                <Link href="/profile">
                  <button
                    type="button"
                    className="flex rounded-full bg-white/20 text-sm hover:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-600 transition-colors"
                  >
                    <div className="h-8 w-8 rounded-full bg-indigo-200 flex items-center justify-center text-indigo-700 font-bold">
                      JD
                    </div>
                  </button>
                </Link>
                <button className="p-2 text-indigo-100 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                  <LogOut className="h-5 w-5" />
                </button>
              </>
            )}
          </div>

          <div className="-mr-2 flex items-center sm:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center rounded-md bg-white/20 p-2 text-white hover:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-600 transition-colors"
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
      {!isAuthPage && (
        <div className={cn("sm:hidden", mobileMenuOpen ? "block" : "hidden")}>
          <div className="space-y-1 pb-3 pt-2 px-2">
            {navigation.map((item) => {
              const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'text-indigo-100 hover:bg-white/10 hover:text-white',
                    'block rounded-md py-2 pl-3 pr-4 text-base font-medium transition-colors flex items-center'
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
            <div className="border-t border-white/20 my-2 pt-2">
              <Link href="/profile" className="block rounded-md py-2 pl-3 pr-4 text-base font-medium text-indigo-100 hover:bg-white/10 hover:text-white transition-colors">
                Profile
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

