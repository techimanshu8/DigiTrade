'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { BeneficiaryPayload } from '@/hooks/useBeneficiaries';
import { useRouter } from 'next/navigation';

const beneficiarySchema = z.object({
  beneficiaryType: z.enum(['INDIVIDUAL', 'BUSINESS']),
  name: z.string().min(2, 'Name is required'),
  relationship: z.string().optional(),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().min(2, 'Country is required'),
  bankName: z.string().min(2, 'Bank name is required'),
  bankAddress: z.string().optional(),
  accountNumber: z.string().min(5, 'Account number is required'),
  iban: z.string().optional(),
  swift: z.string().regex(/^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/, 'Invalid SWIFT code format').optional().or(z.literal('')),
  routingNumber: z.string().optional(),
  taxId: z.string().optional(),
  registrationNumber: z.string().optional(),
  invoiceReference: z.string().optional(),
});

type FormValues = z.infer<typeof beneficiarySchema>;

interface BeneficiaryFormProps {
  initialData?: Partial<BeneficiaryPayload>;
  onSubmit: (data: BeneficiaryPayload) => void;
  isLoading: boolean;
}

export function BeneficiaryForm({ initialData, onSubmit, isLoading }: BeneficiaryFormProps) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(beneficiarySchema),
    defaultValues: {
      beneficiaryType: initialData?.beneficiaryType || 'INDIVIDUAL',
      name: initialData?.name || '',
      relationship: initialData?.relationship || '',
      email: initialData?.email || '',
      phone: initialData?.phone || '',
      address: initialData?.address || '',
      city: initialData?.city || '',
      country: initialData?.country || '',
      bankName: initialData?.bankName || '',
      bankAddress: initialData?.bankAddress || '',
      accountNumber: initialData?.accountNumber || '',
      iban: initialData?.iban || '',
      swift: initialData?.swift || '',
      routingNumber: initialData?.routingNumber || '',
      taxId: initialData?.taxId || '',
      registrationNumber: initialData?.registrationNumber || '',
      invoiceReference: initialData?.invoiceReference || '',
    },
  });

  const type = watch('beneficiaryType');

  return (
    <form onSubmit={handleSubmit((data) => onSubmit(data as BeneficiaryPayload))} className="space-y-6">
      <div className="bg-white px-4 py-5 shadow sm:rounded-lg sm:p-6">
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <div className="md:col-span-1">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Basic Information</h3>
            <p className="mt-1 text-sm text-gray-500">
              Details about the beneficiary you are transferring to.
            </p>
          </div>
          <div className="mt-5 md:col-span-2 md:mt-0 space-y-6">
            <div className="grid grid-cols-6 gap-6">
              <div className="col-span-6 sm:col-span-3">
                <label className="block text-sm font-medium text-gray-700">Type *</label>
                <select
                  {...register('beneficiaryType')}
                  className="mt-1 block w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                >
                  <option value="INDIVIDUAL">Individual</option>
                  <option value="BUSINESS">Business</option>
                </select>
                {errors.beneficiaryType && <p className="mt-1 text-sm text-red-600">{errors.beneficiaryType?.message}</p>}
              </div>

              <div className="col-span-6 sm:col-span-3">
                <label className="block text-sm font-medium text-gray-700">Name *</label>
                <input
                  type="text"
                  {...register('name')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name?.message}</p>}
              </div>

              {type === 'INDIVIDUAL' && (
                <div className="col-span-6 sm:col-span-3">
                  <label className="block text-sm font-medium text-gray-700">Relationship</label>
                  <input
                    type="text"
                    {...register('relationship')}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
              )}

              {type === 'BUSINESS' && (
                <div className="col-span-6 sm:col-span-3">
                  <label className="block text-sm font-medium text-gray-700">Registration Number</label>
                  <input
                    type="text"
                    {...register('registrationNumber')}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
              )}

              <div className="col-span-6 sm:col-span-3">
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  {...register('email')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email?.message}</p>}
              </div>
              
              <div className="col-span-6 sm:col-span-3">
                <label className="block text-sm font-medium text-gray-700">Country *</label>
                <input
                  type="text"
                  {...register('country')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
                {errors.country && <p className="mt-1 text-sm text-red-600">{errors.country?.message}</p>}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white px-4 py-5 shadow sm:rounded-lg sm:p-6">
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <div className="md:col-span-1">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Banking Information</h3>
            <p className="mt-1 text-sm text-gray-500">
              Where the funds should be sent.
            </p>
          </div>
          <div className="mt-5 md:col-span-2 md:mt-0 space-y-6">
            <div className="grid grid-cols-6 gap-6">
              
              <div className="col-span-6 sm:col-span-3">
                <label className="block text-sm font-medium text-gray-700">Bank Name *</label>
                <input
                  type="text"
                  {...register('bankName')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
                {errors.bankName && <p className="mt-1 text-sm text-red-600">{errors.bankName?.message}</p>}
              </div>

              <div className="col-span-6 sm:col-span-3">
                <label className="block text-sm font-medium text-gray-700">Account Number *</label>
                <input
                  type="text"
                  {...register('accountNumber')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
                {errors.accountNumber && <p className="mt-1 text-sm text-red-600">{errors.accountNumber?.message}</p>}
              </div>

              <div className="col-span-6 sm:col-span-3">
                <label className="block text-sm font-medium text-gray-700">SWIFT / BIC</label>
                <input
                  type="text"
                  {...register('swift')}
                  placeholder="e.g. BOFAUS3N"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
                {errors.swift && <p className="mt-1 text-sm text-red-600">{errors.swift?.message}</p>}
              </div>

              <div className="col-span-6 sm:col-span-3">
                <label className="block text-sm font-medium text-gray-700">IBAN</label>
                <input
                  type="text"
                  {...register('iban')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-gray-400"
        >
          {isLoading ? 'Saving...' : 'Save Beneficiary'}
        </button>
      </div>
    </form>
  );
}
