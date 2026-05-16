'use client';

import { BeneficiaryForm } from '@/components/beneficiaries/BeneficiaryForm';
import { useBeneficiary, useUpdateBeneficiary, BeneficiaryPayload } from '@/hooks/useBeneficiaries';
import { useRouter, useParams } from 'next/navigation';
import { useState } from 'react';

export default function EditBeneficiaryPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const { data: beneficiary, isLoading: isFetching, error: fetchError } = useBeneficiary(id);
  const { mutateAsync: updateBeneficiary, isPending: isUpdating } = useUpdateBeneficiary(id);
  
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: BeneficiaryPayload) => {
    try {
      setError(null);
      // We pass partial payload; only update what's changed if preferred, 
      // but passing everything is fine since validation handles it
      await updateBeneficiary(data);
      router.push('/beneficiaries');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update beneficiary.');
    }
  };

  if (isFetching) return <div className="p-8 text-center">Loading...</div>;
  if (fetchError || !beneficiary) return <div className="p-8 text-center text-red-500">Beneficiary not found.</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Edit Beneficiary: {beneficiary.name}</h1>
        <p className="mt-2 text-sm text-gray-700">
          Update the recipient's details or banking information. 
          Note: For security, you must re-enter the account number.
        </p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 p-4 rounded-md border border-red-200">
          <p className="text-sm text-red-600 font-medium">{error}</p>
        </div>
      )}

      {/* 
        We don't pass account number initially because it's stored encrypted and masked on the backend.
        We force the user to provide it again to update.
      */}
      <BeneficiaryForm 
        initialData={{ ...beneficiary, accountNumber: '' }} 
        onSubmit={handleSubmit} 
        isLoading={isUpdating} 
      />
    </div>
  );
}
