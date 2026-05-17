'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { 
  ArrowRightLeft, 
  Send, 
  Users, 
  Zap, 
  Lock, 
  Clock,
  Globe,
  TrendingUp,
  CheckCircle,
  ArrowRight
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50">
      {/* Hero Section */}
      <section className="relative px-6 sm:px-8 lg:px-12 py-20 sm:py-32">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-700 px-4 py-2 rounded-full text-sm font-semibold">
                  <Zap className="w-4 h-4" />
                  Fast & Secure Remittance
                </div>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900">
                  Send Money<br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-600">
                    Instantly
                  </span>
                </h1>
                <p className="text-xl text-gray-600 max-w-xl">
                  DigiTrade makes international money transfers simple, fast, and affordable. Send remittances to your loved ones in minutes.
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/send-money" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">
                    Start Sending
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
                <Link href="/beneficiaries" className="w-full sm:w-auto">
                  <Button size="lg" variant="outline" className="w-full border-gray-300">
                    Manage Beneficiaries
                  </Button>
                </Link>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 pt-8 border-t border-gray-200">
                <div>
                  <div className="text-2xl sm:text-3xl font-bold text-indigo-600">50K+</div>
                  <p className="text-sm text-gray-600">Active Users</p>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-bold text-indigo-600">$100M+</div>
                  <p className="text-sm text-gray-600">Transferred</p>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-bold text-indigo-600">180+</div>
                  <p className="text-sm text-gray-600">Countries</p>
                </div>
              </div>
            </div>

            {/* Right Image/Illustration */}
            <div className="relative h-96 lg:h-full hidden lg:block">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-400 to-blue-600 rounded-3xl opacity-10" />
              <div className="absolute inset-8 bg-gradient-to-tr from-indigo-500 to-blue-400 rounded-2xl opacity-20" />
              <div className="relative h-full bg-white rounded-2xl shadow-2xl p-8 flex flex-col justify-center">
                <div className="text-center space-y-4">
                  <div className="inline-flex h-16 w-16 mx-auto bg-gradient-to-br from-indigo-500 to-blue-600 rounded-full items-center justify-center">
                    <Globe className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Global Transfers</h3>
                  <p className="text-gray-600">Real-time exchange rates, no hidden fees</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-6 sm:px-8 lg:px-12 py-20 sm:py-32 bg-white">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Why Choose DigiTrade?
            </h2>
            <p className="text-xl text-gray-600">Everything you need for seamless international transfers</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Zap,
                title: 'Instant Transfers',
                description: 'Money arrives in minutes, not days. Get real-time status updates.',
              },
              {
                icon: Lock,
                title: 'Bank-Level Security',
                description: 'End-to-end encryption protects your sensitive financial data.',
              },
              {
                icon: ArrowRightLeft,
                title: 'Competitive Rates',
                description: 'Live exchange rates with transparent pricing. No hidden fees.',
              },
              {
                icon: Clock,
                title: '24/7 Availability',
                description: 'Send money anytime, anywhere. Our platform never sleeps.',
              },
              {
                icon: Users,
                title: 'Easy Management',
                description: 'Save beneficiaries, track payments, manage receipts in one place.',
              },
              {
                icon: TrendingUp,
                title: 'Growth Tools',
                description: 'Analytics dashboard to track spending and trends over time.',
              },
            ].map((feature, idx) => (
              <div key={idx} className="p-8 rounded-xl border border-gray-200 hover:border-indigo-300 hover:shadow-lg transition-all group">
                <feature.icon className="w-10 h-10 text-indigo-600 mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="px-6 sm:px-8 lg:px-12 py-20 sm:py-32 bg-gradient-to-r from-indigo-50 to-blue-50">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600">Send money in 4 simple steps</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { step: '1', title: 'Create Account', desc: 'Sign up and verify your identity' },
              { step: '2', title: 'Add Recipient', desc: 'Enter beneficiary bank details' },
              { step: '3', title: 'Enter Amount', desc: 'Check live exchange rates' },
              { step: '4', title: 'Send Money', desc: 'Funds arrive instantly' },
            ].map((item, idx) => (
              <div key={idx} className="relative">
                <div className="bg-white rounded-xl p-8 text-center shadow-md border border-gray-100">
                  <div className="inline-flex h-12 w-12 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-full items-center justify-center mb-4">
                    <span className="text-xl font-bold text-white">{item.step}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-600 text-sm">{item.desc}</p>
                </div>
                {idx < 3 && (
                  <div className="hidden md:flex absolute top-12 -right-4 z-10">
                    <ArrowRight className="w-8 h-8 text-indigo-400" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="px-6 sm:px-8 lg:px-12 py-20 sm:py-32 bg-white">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
                Trusted by Thousands
              </h2>
              <p className="text-xl text-gray-600">
                DigiTrade is regulated and compliant with international financial standards.
              </p>
              
              <div className="space-y-4">
                {[
                  'AML & KYC Compliance',
                  'ISO 27001 Certified',
                  'PCI-DSS Compliant',
                  'SOC 2 Type II Audited',
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700 font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl p-8 sm:p-12 text-white">
              <blockquote className="text-lg font-medium mb-4">
                "DigiTrade made sending money to my family back home incredibly easy. The rates are fair and the process is secure."
              </blockquote>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-indigo-300" />
                <div>
                  <p className="font-semibold">Priya Sharma</p>
                  <p className="text-indigo-200 text-sm">Mumbai, India</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 sm:px-8 lg:px-12 py-20 sm:py-32 bg-gradient-to-r from-indigo-600 to-blue-600">
        <div className="mx-auto max-w-3xl text-center space-y-8">
          <h2 className="text-4xl sm:text-5xl font-bold text-white">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-indigo-100">
            Join thousands of users who are already sending money with DigiTrade.
          </p>
          <Link href="/send-money">
            <Button size="lg" className="bg-white text-indigo-600 hover:bg-gray-100">
              Send Money Now
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 px-6 sm:px-8 lg:px-12 py-12">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-semibold text-white mb-4">Product</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/send-money" className="hover:text-white">Send Money</Link></li>
                <li><Link href="/payments" className="hover:text-white">Payments</Link></li>
                <li><Link href="/beneficiaries" className="hover:text-white">Beneficiaries</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-4">Company</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">About</a></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
                <li><a href="#" className="hover:text-white">Careers</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-4">Support</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">Help Center</a></li>
                <li><a href="#" className="hover:text-white">Contact Us</a></li>
                <li><a href="#" className="hover:text-white">Status</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-4">Legal</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">Privacy</a></li>
                <li><a href="#" className="hover:text-white">Terms</a></li>
                <li><a href="#" className="hover:text-white">Security</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-sm text-center">
            <p>&copy; 2026 DigiTrade. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
