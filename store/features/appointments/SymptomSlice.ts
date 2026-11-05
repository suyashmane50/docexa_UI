import { RootState } from "@/store";
import { DOCEXA_PATIENT_HOST, DOCEXA_PATIENT_HOST_V3_WEB, localHost } from "@/utils/api";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */

export interface Symptom {
    name: string;
}

export interface SymptomMasterData {
    advices: any[];
    diagnosis: any[];
    lifestyle: any[];
    medical_history: any[];
    medicaltests: any[];
    medicine_type: any[];
    symptoms: Symptom[];
}

interface SymptomeState {
    SymptomData: SymptomMasterData | null;
    isLoading: boolean;
    isSuccess: boolean;
    isError: boolean;
    message: string | null;
}

/* -------------------------------------------------------------------------- */
/*                               INITIAL STATE                                */
/* -------------------------------------------------------------------------- */

const initialStateSymptoms: SymptomeState = {
    SymptomData: null,
    isLoading: false,
    isSuccess: false,
    isError: false,
    message: null,
};

/* -------------------------------------------------------------------------- */
/*                                ASYNC THUNKS                                 */
/* -------------------------------------------------------------------------- */

export const fetchSymptoms = createAsyncThunk(
    "symptoms/fetchGeneralSymptoms",
    async (user_map_id: number, thunkApi: any) => {
        try {
            const state = thunkApi.getState() as RootState;

            const config = {
                headers: {
                    "app-id": state.auth.app_id,
                    "user-id": state.auth.userId ?? "1",
                    "Content-Type": "application/json",
                },
            };

            const res = await DOCEXA_PATIENT_HOST_V3_WEB.get(
                `getsymptoms/${user_map_id}`,
                config
            );

            return res.data; // contains data: { symptoms, diagnosis, ... }
        } catch (error: any) {
            return thunkApi.rejectWithValue(
                error?.response?.data || "Failed to fetch symptoms"
            );
        }
    }
);

export const fetchPatientSelectedSymptoms = createAsyncThunk(
    "vitals/fetchPatientSelectedSymptoms",
    async (data: any, thunkApi: any) => {
        try {
            const state = thunkApi.getState() as RootState;
            console.log("data :", data);

            const config = {
                headers: {
                    "app-id": state.auth.app_id,
                    "user-id": state.auth.userId ?? "1",
                    "Content-Type": "application/json",
                },
            };

            const res = await DOCEXA_PATIENT_HOST.get(
                `patient/dashboard/booking-symptoms/${data.doctor_id}/${data.booking_id}`,
                config
            );

            return res.data;
        } catch (error: any) {
            return thunkApi.rejectWithValue(
                error?.response?.data || "Failed to fetch Symptoms"
            );
        }
    }
);

export const postSymptoms = createAsyncThunk(
    "symptoms/postSymptoms",
    async (payload: any, thunkApi: any) => {
        try {
            const state = thunkApi.getState() as RootState;

            const config = {
                headers: {
                    "app-id": state.auth.app_id,
                    "user-id": state.auth.userId ?? "1",
                    "Content-Type": "application/json",
                },
            };
            console.log("payload: ", payload);


            const payload_new = payload.symptoms
                .filter((v: any) => v.selected === true)
                .map((v: any) => ({
                    booking_id: payload.booking_id,
                    patient_id: payload.patientId,
                    doctor_id: payload.doctor_id,
                    user_map_id: payload.user_map_id,

                    name: v.name,

                    data: {
                        title: v.name,
                        note: v.description || null,

                        severity: v.severity ?? null,   // ✅ ADD THIS

                        since: {
                            preset: v?.since?.preset ?? null,
                            unit: v?.since?.unit ?? null,
                            value: v?.since?.value ?? null,
                        },

                        type: "symptom",
                    },
                }));


            console.log("Final Symptoms Payload:", payload_new);

            // API call when ready
            // return await localHost.post(
            //     `patient/dashboard/booking-symptoms-bulk`,
            //     payload_new,
            //     config
            // );
            return await DOCEXA_PATIENT_HOST.post(
                `patient/dashboard/booking-symptoms-bulk`,
                payload_new,
                config
            );

            console.log("state: ", state);


            return payload_new;
        } catch (error: any) {
            return thunkApi.rejectWithValue(
                error?.response?.data || "Failed to post symptoms"
            );
        }
    }
);


/* -------------------------------------------------------------------------- */
/*                                   SLICE                                    */
/* -------------------------------------------------------------------------- */

const symptomSlice = createSlice({
    name: "symptomsMaster",
    initialState: initialStateSymptoms,
    reducers: {
        resetSymptomState: (state) => {
            state.SymptomData = null;
            state.isLoading = false;
            state.isSuccess = false;
            state.isError = false;
            state.message = null;
        },
    },
    extraReducers: (builder) => {
        const setLoadingState = (
            state: SymptomeState,
            isLoading: boolean,
            isSuccess: boolean,
            isError: boolean
        ) => {
            state.isLoading = isLoading;
            state.isSuccess = isSuccess;
            state.isError = isError;
        };

        builder
            /* ---------------- FETCH SYMPTOMS ---------------- */

            .addCase(fetchSymptoms.pending, (state) => {
                setLoadingState(state, true, false, false);
            })

            .addCase(fetchSymptoms.fulfilled, (state, action) => {
                setLoadingState(state, false, true, false);

                /**
                 * Store FULL master object
                 * (symptoms, diagnosis, lifestyle, etc.)
                 */
                state.SymptomData = action.payload?.data ?? null;
                state.message = action.payload?.message ?? null;
            })

            .addCase(fetchSymptoms.rejected, (state, action: any) => {
                setLoadingState(state, false, false, true);
                state.message =
                    action.payload?.message ?? "Failed to fetch symptoms";
            });
    },
});

/* -------------------------------------------------------------------------- */
/*                                   EXPORTS                                  */
/* -------------------------------------------------------------------------- */

export default symptomSlice.reducer;
export const { resetSymptomState } = symptomSlice.actions;

/* -------------------------------------------------------------------------- */
/*                                  SELECTORS                                 */
/* -------------------------------------------------------------------------- */

/** FULL MASTER DATA */
export const selectSymptomMasterData = (state: RootState) =>
    state.symptomsMaster.SymptomData;

/** ONLY SYMPTOMS (USED IN AddVitals SCREEN) */
export const selectSymptomsOnly = (state: RootState) =>
    state.symptomsMaster.SymptomData?.symptoms ?? [];

/** STATUS SELECTORS */
export const selectSymptomsLoading = (state: RootState) =>
    state.symptomsMaster.isLoading;

export const selectSymptomsSuccess = (state: RootState) =>
    state.symptomsMaster.isSuccess;

export const selectSymptomsError = (state: RootState) =>
    state.symptomsMaster.isError;
