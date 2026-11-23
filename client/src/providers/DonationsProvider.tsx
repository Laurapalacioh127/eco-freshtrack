'use client';

import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import { useAxios } from './AxiosProvider';
import { useAuth } from './AuthProvider';
import type { Donation, DonationStatus, DonationSummary } from '@/types';
import { REALTIME, subscribeToBroadcast } from '@/utils/realtime';
import { hasId, upsertById } from '@/utils/upsertById';

export interface CreateDonationInput {
  zone: string;
  items: string;
  expiresLabel?: string;
  // Only for admins registering a walk-in donation.
  donorName?: string;
}

interface DonationsContextType {
  donations: Donation[];
  summary: DonationSummary | null;
  loading: boolean;
  error: string | null;
  createDonation: (input: CreateDonationInput) => Promise<Donation>;
  updateDonationStatus: (id: string, status: DonationStatus) => Promise<Donation>;
}

const DonationsContext = createContext<DonationsContextType | null>(null);

export const DonationsProvider = ({ children }: { children: ReactNode }) => {
  const axios = useAxios();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [donations, setDonations] = useState<Donation[]>([]);
  const [summary, setSummary] = useState<DonationSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // The pending count in the summary changes with every donation write.
  const refreshSummary = useCallback(async () => {
    try {
      const res = await axios.get<DonationSummary>('/api/donations/summary');
      setSummary(res.data);
    } catch {
      // Keep the last summary: a failed background refresh is not worth an error state.
    }
  }, [axios]);

  useEffect(() => {
    // Broadcast is public, so households receive every donation. Admins may see them
    // all and use the payload as is; households re-read it through the scoped API,
    // which returns 404 for donations that are not theirs.
    const applyDonation = async (payload: unknown) => {
      if (!hasId(payload)) return;

      if (isAdmin) {
        setDonations((prev) => upsertById(prev, payload as Donation));
      } else {
        try {
          const res = await axios.get<Donation>(`/api/donations/${payload.id}`);
          setDonations((prev) => upsertById(prev, res.data));
        } catch {
          return; // Not this household's donation (404) or a network error.
        }
      }

      void refreshSummary();
    };

    const unsubscribe = subscribeToBroadcast(REALTIME.donations.channel, {
      [REALTIME.donations.created]: applyDonation,
      [REALTIME.donations.statusChanged]: applyDonation,
    });

    const onInit = async () => {
      try {
        const [donationsRes, summaryRes] = await Promise.all([
          axios.get<Donation[]>('/api/donations'),
          axios.get<DonationSummary>('/api/donations/summary'),
        ]);
        // Merge instead of replace: an event may have arrived before the response.
        setDonations((prev) => donationsRes.data.reduce(upsertById, prev));
        setSummary(summaryRes.data);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    onInit();

    return unsubscribe;
  }, [axios, isAdmin, refreshSummary]);

  const createDonation = useCallback(
    async (input: CreateDonationInput) => {
      const res = await axios.post<Donation>('/api/donations', input);
      setDonations((prev) => upsertById(prev, res.data));
      void refreshSummary();
      return res.data;
    },
    [axios, refreshSummary],
  );

  const updateDonationStatus = useCallback(
    async (id: string, status: DonationStatus) => {
      const res = await axios.patch<Donation>(`/api/donations/${id}/status`, { status });
      setDonations((prev) => upsertById(prev, res.data));
      void refreshSummary();
      return res.data;
    },
    [axios, refreshSummary],
  );

  return (
    <DonationsContext.Provider
      value={{ donations, summary, loading, error, createDonation, updateDonationStatus }}
    >
      {children}
    </DonationsContext.Provider>
  );
};

export const useDonations = () => {
  const ctx = useContext(DonationsContext);
  if (!ctx) throw new Error('useDonations must be used within DonationsProvider');
  return ctx;
};
