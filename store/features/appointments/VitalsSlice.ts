import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { RootState } from "@/store";
import { DOCEXA_PATIENT_HOST, DOCEXA_PATIENT_HOST_V3_WEB } from "@/utils/api";

/* ---------------- STATE TYPE ---------------- */

interface VitalsState {
    vitalsData: any[] | null;
    isLoading: boolean;
    isSuccess: boolean;
    isError: boolean;
    message: string | null;
}

/* ---------------- INITIAL STATE ---------------- */

const initialState: VitalsState = {
    vitalsData: null,
    isLoading: false,
    isSuccess: false,
    isError: false,
    message: null,
};
interface SymptomeState {
    SymptomData: any[] | null;
    isLoading: boolean;
    isSuccess: boolean;
    isError: boolean;
    message: string | null;
};
const initialStateSymptoms: SymptomeState = {
    SymptomData: null,
    isLoading: false,
    isSuccess: false,
    isError: false,
    message: null,
}

/* ---------------- THUNK ---------------- */

/**
 * Fetch Vitals Master (General Vitals)
 * API returns:
 * {
 *   status: "success",
 *   data: [ ... ]
 * }
 */
export const fetchVitals = createAsyncThunk(
    "vitals/fetchGeneralVitals",
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
                `establishments/users/${user_map_id}/vital`,
                config
            );

            return res.data;
        } catch (error: any) {
            return thunkApi.rejectWithValue(
                error?.response?.data || "Failed to fetch vitals"
            );
        }
    }
);

export const fetchPatientSelectedVitals = createAsyncThunk(
    "vitals/fetchPatientSelectedVitals",
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

            const res = await DOCEXA_PATIENT_HOST_V3_WEB.get(
                `establishments/users/${data.user_map_id}/assistant/vital/${data.booking_id}`,
                config
            );

            return res.data;
        } catch (error: any) {
            return thunkApi.rejectWithValue(
                error?.response?.data || "Failed to fetch vitals"
            );
        }
    }
);

export const postVitals = createAsyncThunk(
    "vitals/fetchGeneralVitals",
    async (payload: any, thunkApi: any) => {
        try {

            const state = thunkApi.getState() as RootState;
            console.log("payload: ", payload);

            const config = {
                headers: {
                    "app-id": state.auth.app_id,
                    "user-id": state.auth.userId ?? "1",
                    "Content-Type": "application/json",
                },
            };

            const payload_new = payload.vitals.map((v: any) => ({
                appointment_id: payload.booking_id,    // required
                name: v.vital_name,
                patient_id: payload.patientId,           // required
                user_map_id: payload.user_map_id,          // required

                unit: v.unit ?? null,                      // if you have unit mapping

                data: {
                    note: v.unit ?? null,
                    title: v.vital_name,
                    type: "vitals",
                    vitals: v.value,
                },
            }));

            console.log(payload_new);




            const res = await DOCEXA_PATIENT_HOST_V3_WEB.post(
                `establishments/users/${payload.user_map_id}/assistant/vital/add`,
                payload_new,
                config,
            );
            console.log("selected Values: ", payload_new);
            console.log("User map id: ", payload.user_map_id);


            // return;
            return res.data;
        } catch (error: any) {
            return thunkApi.rejectWithValue(
                error?.response?.data || "Failed to fetch vitals"
            );
        }
    }
);

export const fetchSymptoms = createAsyncThunk(
    "vitals/fetchGeneralSymptoms",
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

            const res = await DOCEXA_PATIENT_HOST.get(
                `symptoms/get/${user_map_id}`,
                config
            );

            return res.data;
        } catch (error: any) {
            return thunkApi.rejectWithValue(
                error?.response?.data || "Failed to fetch vitals"
            );
        }
    }
);
/* ---------------- SYMPTOMS SLICE ---------------- */

const symptomSlice = createSlice({
    name: "symptomsMaster",
    initialState: initialStateSymptoms,
    reducers: {
        resetSymptomState: state => {
            state.SymptomData = null;
            state.isLoading = false;
            state.isSuccess = false;
            state.isError = false;
            state.message = null;
        },
    },
    extraReducers: builder => {
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
            /* -------- FETCH SYMPTOMS -------- */

            .addCase(fetchSymptoms.pending, state => {
                setLoadingState(state, true, false, false);
            })

            .addCase(fetchSymptoms.fulfilled, (state, action) => {
                setLoadingState(state, false, true, false);

                /**
                 * Store ONLY actual symptoms array
                 */
                state.SymptomData = action.payload?.data ?? [];
                state.message = action.payload?.message ?? null;
            })

            .addCase(fetchSymptoms.rejected, (state, action: any) => {
                setLoadingState(state, false, false, true);
                state.message =
                    action.payload?.message ?? "Failed to fetch symptoms";
            });
    },
});

/* ---------------- SLICE ---------------- */


const vitalsSlice = createSlice({
    name: "vitalsMaster",
    initialState,
    reducers: {
        resetVitalsState: state => {
            state.vitalsData = null;
            state.isLoading = false;
            state.isSuccess = false;
            state.isError = false;
            state.message = null;
        },
    },
    extraReducers: builder => {
        const setLoadingState = (
            state: VitalsState,
            isLoading: boolean,
            isSuccess: boolean,
            isError: boolean
        ) => {
            state.isLoading = isLoading;
            state.isSuccess = isSuccess;
            state.isError = isError;
        };

        builder
            /* -------- FETCH VITALS -------- */

            .addCase(fetchVitals.pending, state => {
                setLoadingState(state, true, false, false);
            })

            .addCase(fetchVitals.fulfilled, (state, action) => {
                setLoadingState(state, false, true, false);

                /**
                 * Store ONLY actual vitals array
                 */
                state.vitalsData = action.payload?.data ?? [];
                state.message = action.payload?.message ?? null;
            })

            .addCase(fetchVitals.rejected, (state, action: any) => {
                setLoadingState(state, false, false, true);
                state.message =
                    action.payload?.message ?? "Failed to fetch vitals";
            });
    },
});

/* ---------------- EXPORTS ---------------- */

export const { resetVitalsState } = vitalsSlice.actions;

/* ---------------- SELECTORS ---------------- */

export const selectVitalsData = (state: RootState) =>
    state.vitalsMaster.vitalsData;

export const selectVitalsLoading = (state: RootState) =>
    state.vitalsMaster.isLoading;

export const selectVitalsSuccess = (state: RootState) =>
    state.vitalsMaster.isSuccess;

export const selectVitalsError = (state: RootState) =>
    state.vitalsMaster.isError;

export default vitalsSlice.reducer;

