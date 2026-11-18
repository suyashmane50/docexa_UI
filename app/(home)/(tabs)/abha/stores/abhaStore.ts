import { create } from 'zustand';
import {
  persist,
  createJSONStorage,
} from 'zustand/middleware';

import AsyncStorage from '@react-native-async-storage/async-storage';
export type Patient = {
  patientId: string;
  name: string;

  token: string | null;
  txnId: string | null;
  aadhaar: string | null;

  data: any | null;
  profileData: any | null;

  createdAt: string;
  lastLoginAt: string;
};
type AbhaStore = {
  patients: Record<string, Patient>;
  activePatientId: string | null;

  token: string | null;
  txnId: string | null;
  aadhaar: string | null;
  data: any | null;
  profileData: any | null;

  addPatient: (patient: Patient) => void;
  selectPatient: (patientId: string) => void;
  getPatient: (patientId: string) => Patient | undefined;
  getPatientList: () => Patient[];

  updatePatient: (
    patientId: string,
    updates: Partial<Patient>
  ) => void;

  removePatient: (patientId: string) => void;

  setToken: (token: string) => void;
  setTxnId: (txnId: string) => void;
  setAadhaar: (aadhaar: string) => void;
  setData: (data: any) => void;
  setProfileData: (profileData: any) => void;

  clearActivePatientSession: () => void;
  clearStore: () => void;
};
const emptySession = {
  activePatientId: null as string | null,
  token: null as string | null,
  txnId: null as string | null,
  aadhaar: null as string | null,
  data: null as any,
  profileData: null as any,
};
export const useAbhaStore = create<AbhaStore>()(
  persist(
    (set, get) => ({
      patients: {},
      ...emptySession,
      addPatient: (patient) => {
        set((state) => {
          const existingPatient =
            state.patients[patient.patientId];

          const now = new Date().toISOString();

          const savedPatient: Patient = {
            ...existingPatient,
            ...patient,

            // Preserve original creation date
            createdAt:
              existingPatient?.createdAt ||
              patient.createdAt ||
              now,

            // Update login date
            lastLoginAt: now,
          };

          return {
            patients: {
              ...state.patients,
              [patient.patientId]: savedPatient,
            },

            // Activate the patient
            activePatientId: patient.patientId,

            // Load patient's active session
            token: savedPatient.token,
            txnId: savedPatient.txnId,
            aadhaar: savedPatient.aadhaar,
            data: savedPatient.data,
            profileData: savedPatient.profileData,
          };
        });
      },
      selectPatient: (patientId) => {
        const patient = get().patients[patientId];

        if (!patient) {
          console.warn('Patient not found:', patientId);
          return;
        }

        set({
          activePatientId: patientId,

          token: patient.token,
          txnId: patient.txnId,
          aadhaar: patient.aadhaar,
          data: patient.data,
          profileData: patient.profileData,
        });
      },
      getPatient: (patientId) => {
        return get().patients[patientId];
      },
      getPatientList: () => {
        return Object.values(get().patients);
      },
      updatePatient: (patientId, updates) => {
        set((state) => {
          const existingPatient =
            state.patients[patientId];

          if (!existingPatient) {
            console.warn(
              'Cannot update patient. Patient not found:',
              patientId
            );

            return state;
          }

          const updatedPatient: Patient = {
            ...existingPatient,
            ...updates,
            lastLoginAt: new Date().toISOString(),
          };

          const updatedPatients = {
            ...state.patients,
            [patientId]: updatedPatient,
          };

          // If this patient is active,
          // synchronize active session
          if (state.activePatientId === patientId) {
            return {
              patients: updatedPatients,

              token: updatedPatient.token,
              txnId: updatedPatient.txnId,
              aadhaar: updatedPatient.aadhaar,
              data: updatedPatient.data,
              profileData: updatedPatient.profileData,
            };
          }

          return {
            patients: updatedPatients,
          };
        });
      },
      removePatient: (patientId) => {
        set((state) => {
          const updatedPatients = {
            ...state.patients,
          };

          delete updatedPatients[patientId];

          // If the deleted patient was active,
          // clear the active session
          if (state.activePatientId === patientId) {
            return {
              patients: updatedPatients,
              ...emptySession,
            };
          }

          return {
            patients: updatedPatients,
          };
        });
      },

      /* ===============================================
         SET TOKEN
      =============================================== */

      setToken: (token) => {
        set((state) => {
          const patientId = state.activePatientId;

          if (!patientId || !state.patients[patientId]) {
            return {
              token,
            };
          }

          const patient = state.patients[patientId];

          const updatedPatient = {
            ...patient,
            token,
          };

          return {
            token,

            patients: {
              ...state.patients,
              [patientId]: updatedPatient,
            },
          };
        });
      },
      setTxnId: (txnId) => {
        set((state) => {
          const patientId = state.activePatientId;

          if (!patientId || !state.patients[patientId]) {
            return {
              txnId,
            };
          }

          const patient = state.patients[patientId];

          return {
            txnId,

            patients: {
              ...state.patients,
              [patientId]: {
                ...patient,
                txnId,
              },
            },
          };
        });
      },
      setAadhaar: (aadhaar) => {
        set((state) => {
          const patientId = state.activePatientId;

          if (!patientId || !state.patients[patientId]) {
            return {
              aadhaar,
            };
          }

          const patient = state.patients[patientId];

          return {
            aadhaar,

            patients: {
              ...state.patients,
              [patientId]: {
                ...patient,
                aadhaar,
              },
            },
          };
        });
      },
      setData: (data) => {
        set((state) => {
          const patientId = state.activePatientId;

          if (!patientId || !state.patients[patientId]) {
            return {
              data,
            };
          }

          const patient = state.patients[patientId];

          return {
            data,

            patients: {
              ...state.patients,
              [patientId]: {
                ...patient,
                data,
              },
            },
          };
        });
      },
      setProfileData: (profileData) => {
        set((state) => {
          const patientId = state.activePatientId;

          if (!patientId || !state.patients[patientId]) {
            return {
              profileData,
            };
          }

          const patient = state.patients[patientId];

          return {
            profileData,

            patients: {
              ...state.patients,
              [patientId]: {
                ...patient,
                profileData,
              },
            },
          };
        });
      },
      clearActivePatientSession: () => {
        set({
          ...emptySession,
        });
      },
      clearStore: () => {
        set({
          patients: {},
          ...emptySession,
        });
      },
    }),
    {
      name: 'abha-local-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);