'use client';

import { TrendingUp, ArrowDownRight, ArrowUpRight, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome back! Here's your transfer overview.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Sent</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">$12,450</p>
              </div>
              <div className="bg-blue-100 rounded-lg p-3">
                <ArrowUpRight className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Pending</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">$2,100</p>
              </div>
              <div className="bg-yellow-100 rounded-lg p-3">
                <Wallet className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Saved</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">$456</p>
              </div>
              <div className="bg-green-100 rounded-lg p-3">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Beneficiaries</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">8</p>
              </div>
              <div className="bg-purple-100 rounded-lg p-3">
                <Wallet className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Action */}
        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-xl p-8 text-white mb-8">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-bold mb-2">Send Money in Minutes</h2>
            <p className="text-indigo-100 mb-6">Start a new transfer to your beneficiaries with competitive exchange rates.</p>
            <Link href="/send-money">
              <Button className="bg-white text-indigo-600 hover:bg-gray-100">
                Send Money Now
              </Button>
            </Link>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Transfers</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {[
              { date: '2 days ago', recipient: 'Priya Sharma', amount: '$500', status: 'Completed' },
              { date: '5 days ago', recipient: 'Rajesh Kumar', amount: '$750', status: 'Completed' },
              { date: '1 week ago', recipient: 'Neha Singh', amount: '$1,200', status: 'Completed' },
            ].map((tx, idx) => (
              <div key={idx} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
                <div>
                  <p className="font-medium text-gray-900">{tx.recipient}</p>
                  <p className="text-sm text-gray-600">{tx.date}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">{tx.amount}</p>
                  <p className="text-sm text-green-600">{tx.status}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
