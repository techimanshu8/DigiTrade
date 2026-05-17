'use client';

import { useState } from 'react';
import { ArrowRight, DollarSign, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function SendMoneyPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    amount: '',
    currency: 'USD',
    recipientCurrency: 'INR',
    beneficiary: '',
  });

  const exchangeRate = 83.45;
  const receivedAmount = formData.amount ? (parseFloat(formData.amount) * exchangeRate).toFixed(2) : '0';

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Send Money</h1>
          <p className="text-gray-600 mt-2">Step {step} of 3</p>
        </div>

        {/* Step Indicator */}
        <div className="flex justify-between mb-8">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`flex items-center ${s < 3 ? 'flex-1' : ''}`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                  s <= step
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {s}
              </div>
              {s < 3 && (
                <div
                  className={`flex-1 h-1 mx-4 ${
                    s < step ? 'bg-indigo-600' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Select Recipient
                </label>
                <select
                  value={formData.beneficiary}
                  onChange={(e) => setFormData({ ...formData, beneficiary: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Choose a beneficiary</option>
                  <option value="priya">Priya Sharma (INR)</option>
                  <option value="rajesh">Rajesh Kumar (INR)</option>
                  <option value="neha">Neha Singh (INR)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Amount to Send
                </label>
                <div className="flex gap-4">
                  <div className="flex-1 relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="number"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      placeholder="0.00"
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <select
                    value={formData.currency}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option>USD</option>
                    <option>EUR</option>
                    <option>GBP</option>
                  </select>
                </div>
              </div>

              {formData.amount && (
                <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg p-4 border border-indigo-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-600">Exchange Rate</span>
                    <span className="font-semibold text-gray-900">1 USD = {exchangeRate} INR</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Recipient Gets</span>
                    <span className="text-xl font-bold text-indigo-600">₹ {receivedAmount}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-4">Review Details</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Recipient</span>
                    <span className="font-medium text-gray-900">Priya Sharma</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount</span>
                    <span className="font-medium text-gray-900">${formData.amount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Recipient Gets</span>
                    <span className="font-medium text-green-600">₹ {receivedAmount}</span>
                  </div>
                  <div className="border-t border-blue-200 pt-3 flex justify-between">
                    <span className="text-gray-600">Fee</span>
                    <span className="font-medium text-gray-900">$0.99</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="flex items-center gap-3 p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input type="radio" name="payment" defaultChecked className="w-4 h-4" />
                  <div>
                    <p className="font-medium text-gray-900">Bank Account</p>
                    <p className="text-sm text-gray-600">Debit from your linked account</p>
                  </div>
                </label>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 text-center">
              <div className="bg-green-50 border border-green-200 rounded-lg p-8">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Transfer Complete!</h3>
                <p className="text-gray-600">Your transfer has been initiated. Funds will arrive within 24 hours.</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-2">Transfer Reference</p>
                <p className="text-lg font-mono font-semibold text-gray-900">TXN-2026051714-4829</p>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={() => setStep(Math.max(1, step - 1))}
              disabled={step === 1}
            >
              Previous
            </Button>
            <Button
              onClick={() => {
                if (step < 3) {
                  setStep(step + 1);
                }
              }}
              disabled={step === 3 || !formData.amount || !formData.beneficiary}
            >
              {step === 3 ? 'Done' : 'Next'}
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
