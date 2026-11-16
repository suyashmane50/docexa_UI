import { create } from 'zustand';
import {
  persist,
  createJSONStorage,
} from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

type AbhaStore = {
  token: string | null;
  txnId: string | null;
  aadhaar: string | null;
  data: any | null;
  profileData: any | null;

  setToken: (token: string) => void;
  setTxnId: (txnId: string) => void;
  setAadhaar: (aadhaar: string) => void;
  setData: (data: any) => void;
  setProfileData: (profileData: any) => void;
  clearStore: () => void;
};

export const useAbhaStore = create<AbhaStore>()(
  persist(
    (set) => ({
      token: null,
      txnId: null,
      aadhaar: null,
      data: null,
      profileData: null,

      setToken: (token) => set({ token }),

      setTxnId: (txnId) => set({ txnId }),

      setAadhaar: (aadhaar) => set({ aadhaar }),

      setData: (data) => set({ data }),

      setProfileData: (profileData) =>
        set({ profileData }),

      clearStore: () =>
        set({
          token: null,
          txnId: null,
          aadhaar: null,
          data: null,
          profileData: null,
        }),
    }),

    {
      name: 'abha-local-storage',

      storage: createJSONStorage(
        () => AsyncStorage
      ),

      partialize: (state) => ({
        token: state.token,
        data: state.data,
        profileData: state.profileData,
      }),
    }
  )
);
