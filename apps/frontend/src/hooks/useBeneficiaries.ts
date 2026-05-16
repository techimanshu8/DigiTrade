import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/api-client';

export interface Beneficiary {
  id: string;
  beneficiaryType: 'INDIVIDUAL' | 'BUSINESS';
  name: string;
  relationship?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country: string;
  bankName: string;
  bankAddress?: string;
  accountNumberMasked?: string;
  iban?: string;
  swift?: string;
  routingNumber?: string;
  taxId?: string;
  registrationNumber?: string;
  invoiceReference?: string;
  isActive: boolean;
}

export interface BeneficiaryPayload extends Omit<Beneficiary, 'id' | 'isActive' | 'accountNumberMasked'> {
  accountNumber: string;
}

export const useBeneficiaries = () => {
  return useQuery({
    queryKey: ['beneficiaries'],
    queryFn: async () => {
      const { data } = await apiClient.get<Beneficiary[]>('/beneficiaries');
      return data;
    },
  });
};

export const useBeneficiary = (id: string) => {
  return useQuery({
    queryKey: ['beneficiaries', id],
    queryFn: async () => {
      const { data } = await apiClient.get<Beneficiary>(`/beneficiaries/${id}`);
      return data;
    },
    enabled: !!id && id !== 'new',
  });
};

export const useCreateBeneficiary = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (payload: BeneficiaryPayload) => {
      const { data } = await apiClient.post<Beneficiary>('/beneficiaries', payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['beneficiaries'] });
    },
  });
};

export const useUpdateBeneficiary = (id: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (payload: Partial<BeneficiaryPayload>) => {
      const { data } = await apiClient.put<Beneficiary>(`/beneficiaries/${id}`, payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['beneficiaries'] });
      queryClient.invalidateQueries({ queryKey: ['beneficiaries', id] });
    },
  });
};

export const useDeleteBeneficiary = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/beneficiaries/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['beneficiaries'] });
    },
  });
};
