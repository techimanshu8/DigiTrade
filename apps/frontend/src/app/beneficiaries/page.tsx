'use client';

import { useBeneficiaries, useDeleteBeneficiary } from '@/hooks/useBeneficiaries';
import { useBeneficiaryStore } from '@/store/beneficiaryStore';
import Link from 'next/link';
import { PlusCircle, Search, Trash2, Edit, Building2, User } from 'lucide-react';
import { useState } from 'react';

export default function BeneficiariesPage() {
  const { data: beneficiaries, isLoading, error } = useBeneficiaries();
  const { mutate: deleteBeneficiary } = useDeleteBeneficiary();
  
  const { searchQuery, setSearchQuery, selectedType, setSelectedType } = useBeneficiaryStore();
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  if (isLoading) return <div className="p-8 text-center">Loading beneficiaries...</div>;
  if (error) return <div className="p-8 text-center text-red-500">Failed to load beneficiaries. Please try again.</div>;

  const filtered = beneficiaries?.filter(b => {
    const matchesSearch = b.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          b.bankName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType ? b.beneficiaryType === selectedType : true;
    return matchesSearch && matchesType;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Beneficiaries</h1>
          <p className="mt-2 text-sm text-gray-700">
            A list of all the individuals and businesses you can send money to.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <Link
            href="/beneficiaries/new"
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Beneficiary
          </Link>
        </div>
      </div>

      <div className="mt-6 flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative rounded-md shadow-sm flex-1 max-w-md">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full rounded-md border-gray-300 pl-10 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3 border"
            placeholder="Search by name or bank..."
            value={searchQuery}
            onChange={(e: any) => setSearchQuery(e.target.value)}
          />
        </div>
        <select
          className="rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm border"
          value={selectedType || ''}
          onChange={(e: any) => setSelectedType(e.target.value || null)}
        >
          <option value="">All Types</option>
          <option value="INDIVIDUAL">Individual</option>
          <option value="BUSINESS">Business</option>
        </select>
      </div>

      <div className="mt-8 flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Name</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Type</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Bank</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Country</th>
                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {filtered?.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-sm text-gray-500">No beneficiaries found</td>
                    </tr>
                  ) : null}
                  {filtered?.map((beneficiary) => (
                    <tr key={beneficiary.id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                        <Link href={`/beneficiaries/${beneficiary.id}`} className="hover:text-indigo-600">
                          {beneficiary.name}
                        </Link>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 flex items-center">
                        {beneficiary.beneficiaryType === 'BUSINESS' ? <Building2 className="h-4 w-4 mr-2" /> : <User className="h-4 w-4 mr-2" />}
                        {beneficiary.beneficiaryType}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {beneficiary.bankName}<br/>
                        <span className="text-xs text-gray-400">{beneficiary.accountNumberMasked}</span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{beneficiary.country}</td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <div className="flex justify-end gap-3">
                          <Link href={`/beneficiaries/${beneficiary.id}`} className="text-indigo-600 hover:text-indigo-900">
                            <Edit className="h-4 w-4" />
                          </Link>
                          {deleteConfirm === beneficiary.id ? (
                            <button onClick={() => deleteBeneficiary(beneficiary.id)} className="text-red-600 hover:text-red-900 text-xs font-bold">
                              Confirm
                            </button>
                          ) : (
                            <button onClick={() => setDeleteConfirm(beneficiary.id)} className="text-gray-400 hover:text-red-600">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
