import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { API_V1, DOCEXA_PATIENT_HOST } from "../../../utils/api";
import { RootState } from "@/store";

interface states {
    doctor_selection: number | null,
    selection: number | null;
    clinics: any | null;
    isLoading: boolean;
    isSuccess: boolean;
    isError: boolean;
    data: any;
    message: string;
}

const initialState: states = {
    doctor_selection: null,
    selection: null,
    clinics: null,
    isLoading: false,
    isSuccess: false,
    isError: false,
    data: null,
    message: ''
};

export const fetchClinics = createAsyncThunk(
    "fetchclinics",
    async (param: number, thunkApi: any) => {
        try {
            const state = thunkApi.getState() as RootState;
            const config = {
                headers: {
                    "App-id": state.auth.app_id,
                    "User-id": state.auth.userId,
                    "Content-Type": "application/json",
                },
            };

            // const res: any = await API_V1.get(`/dashboard/clinics?doctor_id=1`, config);
            const res: any = await DOCEXA_PATIENT_HOST.get(`/patient/dashboard/clinics?doctor_id=${param}`, config);
            console.log("clinics data=>", res.data);
            return res.data;
        } catch (error: any) {
            console.log("res=>", error);
            return thunkApi.rejectWithValue(error.response.data);
        }
    }
);

const AppointmentSlice = createSlice({
    name: "AppointmentSlice",
    initialState,
    reducers: {
        resetClinic: (state) => {
            state.doctor_selection = null;
            state.selection = null;
            state.clinics = null;
            state.isLoading = false;
            state.isSuccess = false;
            state.isError = false;
            state.data = null;
            state.message = '';
        },
        setClinic: (state, action: PayloadAction<any>) => {
            console.log('payload', action.payload)
            state.clinics = action.payload;
        },
        selectClinic: (state, action: PayloadAction<number | null>) => {
            state.selection = action.payload;
        },
        DoctorSelection: (state, action: PayloadAction<number | null>) => {
            state.doctor_selection = action.payload
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchClinics.pending, (state) => {
                state.isLoading = true;
                state.isSuccess = false;
                state.isError = false;
            })
            .addCase(fetchClinics.fulfilled, (state, action) => {
                state.data = action.payload;
                console.log('action.payload', action.payload)
                state.clinics = action.payload.clinics;
                state.message = action.payload.message;
                state.isLoading = false;
                state.isSuccess = true;
                state.isError = false;
            })
            .addCase(fetchClinics.rejected, (state, action: any) => {
                state.isError = true;
                state.isLoading = false;
                state.isSuccess = false;
                if (action?.payload) {
                    state.data = action?.payload;
                    state.message = action.payload.message;
                }
            });
    },
});

export const { resetClinic, setClinic, selectClinic, DoctorSelection } = AppointmentSlice.actions;

export default AppointmentSlice.reducer;
