import { create } from 'zustand';

import {
  persist,
  createJSONStorage,
} from 'zustand/middleware';

import AsyncStorage from '@react-native-async-storage/async-storage';

type ReKYCStore = {
  transactionId: string | null;

  setTransactionId: (transactionId: string) => void;

  clearStore: () => void;
};

export const useReKYCStore = create<ReKYCStore>()(
  persist(
    (set) => ({
      transactionId: null,

      setTransactionId: (transactionId) =>
        set({ transactionId }),

      clearStore: () =>
        set({ transactionId: null }),
    }),
    {
      name: 'rekyc-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);