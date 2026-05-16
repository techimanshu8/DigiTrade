'use client';

import { BeneficiaryForm } from '@/components/beneficiaries/BeneficiaryForm';
import { useCreateBeneficiary, BeneficiaryPayload } from '@/hooks/useBeneficiaries';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function NewBeneficiaryPage() {
  const router = useRouter();
  const { mutateAsync: createBeneficiary, isPending } = useCreateBeneficiary();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: BeneficiaryPayload) => {
    try {
      setError(null);
      await createBeneficiary(data);
      router.push('/beneficiaries');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create beneficiary. Please check your inputs.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Add New Beneficiary</h1>
        <p className="mt-2 text-sm text-gray-700">
          Enter the recipient's details and banking information to add them to your account.
        </p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 p-4 rounded-md border border-red-200">
          <p className="text-sm text-red-600 font-medium">{error}</p>
        </div>
      )}

      <BeneficiaryForm onSubmit={handleSubmit} isLoading={isPending} />
    </div>
  );
}
