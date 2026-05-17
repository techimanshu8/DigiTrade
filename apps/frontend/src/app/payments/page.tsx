'use client';

import { CheckCircle, Clock, AlertCircle, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PaymentsPage() {
  const payments = [
    {
      id: 'TXN-001',
      recipient: 'Priya Sharma',
      amount: '$500',
      received: '₹41,725',
      date: '2026-05-15',
      status: 'completed',
      fee: '$0.99',
    },
    {
      id: 'TXN-002',
      recipient: 'Rajesh Kumar',
      amount: '$750',
      received: '₹62,588',
      date: '2026-05-12',
      status: 'completed',
      fee: '$0.99',
    },
    {
      id: 'TXN-003',
      recipient: 'Neha Singh',
      amount: '$1,200',
      received: '₹100,140',
      date: '2026-05-10',
      status: 'pending',
      fee: '$0.99',
    },
    {
      id: 'TXN-004',
      recipient: 'Amit Patel',
      amount: '$300',
      received: '₹25,035',
      date: '2026-05-08',
      status: 'completed',
      fee: '$0.99',
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'failed':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusLabel = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Payment History</h1>
            <p className="text-gray-600 mt-2">View all your transactions and download receipts</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <p className="text-gray-600 text-sm font-medium">Total Transfers</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">4</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <p className="text-gray-600 text-sm font-medium">Total Amount</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">$2,750</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <p className="text-gray-600 text-sm font-medium">Total Fees</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">$3.96</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <p className="text-gray-600 text-sm font-medium">Completed</p>
            <p className="text-3xl font-bold text-green-600 mt-2">3</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              placeholder="Search by recipient or transaction ID..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option>All Status</option>
              <option>Completed</option>
              <option>Pending</option>
              <option>Failed</option>
            </select>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Transaction</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Recipient</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Amount Sent</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Received</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Date</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <code className="text-sm font-mono text-indigo-600">{payment.id}</code>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{payment.recipient}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{payment.amount}</p>
                      <p className="text-sm text-gray-600">Fee: {payment.fee}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{payment.received}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-600">{new Date(payment.date).toLocaleDateString()}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(payment.status)}
                        <span className="text-sm font-medium text-gray-900">
                          {getStatusLabel(payment.status)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex items-center gap-2"
                      >
                        <Download className="w-4 h-4" />
                        Receipt
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        <div className="mt-6 flex items-center justify-between">
          <p className="text-sm text-gray-600">Showing 1-4 of 4 transactions</p>
          <div className="flex gap-2">
            <Button variant="outline" disabled>
              Previous
            </Button>
            <Button variant="outline" disabled>
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
