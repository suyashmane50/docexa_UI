import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { API } from "@/utils/api";
import { RootState } from "@/store";

interface states {
    selectPatient: null | number;
    patinetError: boolean;
    selectClinic: null | number;
    selectDoctor: null | number;
    data: any | null;
    ispostloading: boolean;
    ispostssuccess: boolean;
    isposterror: boolean;
    message: string | null;
    telephonic_id: string | number | undefined;
}

const initialState: states = {
    patinetError: false,
    selectPatient: null,
    selectClinic: null,
    selectDoctor: null,
    data: null,
    message: null,
    ispostloading: false,
    ispostssuccess: false,
    isposterror: false,
    telephonic_id: undefined
};

export interface oncallAppoitment {
    "patient_id": number,
    "phone": number,
    "doctor_id": string,
    "call_type": string | number,
    "status": string,
    "request_date_time": string | null,
    "telephonic_id": string | number | undefined
}

export const PostOnCallAppointment = createAsyncThunk(
    "postoncallappointment",
    async (param: oncallAppoitment, thunkApi: any) => {
        try {
            const state = thunkApi.getState() as RootState;
            const authToken = state.auth.authToken;
            const config = {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                    "Content-Type": "application/json",
                    "App-id": state.auth.app_id,
                    "User-id": state.auth.userId,
                },
            };

            const res: any = await API.post(`doctor/api/add`, param, config);
            console.log("recipie data=>", res.data);
            return res.data;
        } catch (error: any) {
            console.log("res=>", error);
            return thunkApi.rejectWithValue(error.response.data);
        } finally {
        }
    }
);

const PostOnCallAppointmentSlice = createSlice({
    name: "postOnCallAppointment",
    initialState,
    reducers: {
        resetPostAppointment: (state) => {
            state.patinetError = false;
            state.selectPatient = null;
            state.selectClinic = null;
            state.selectDoctor = null;
            state.data = null;
            state.message = null;
            state.ispostloading = false;
            state.ispostssuccess = false;
            state.isposterror = false;
        },
        setPatient: (state, action: PayloadAction<number | null>) => {
            state.selectPatient = action.payload;
            state.patinetError = false;
        },
        setPatientError: (state, action: PayloadAction<boolean>) => {
            state.patinetError = action.payload
        },
        setDoctor: (state, action: PayloadAction<number>) => {
            state.selectDoctor = action.payload;
        },
        selectClinic: (state, action: PayloadAction<number>) => {
            state.selectDoctor = action.payload;
        },
        setSelectedTelephonicSlot: (state, action: PayloadAction<number | string>) => {
            state.telephonic_id = action.payload
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(PostOnCallAppointment.pending, (state) => {
                state.ispostloading = true;
                state.ispostssuccess = false;
                state.isposterror = false;
            })
            .addCase(PostOnCallAppointment.fulfilled, (state, action) => {
                state.data = action.payload;
                state.message = action.payload.message;
                state.ispostloading = false;
                state.ispostssuccess = true;
                state.isposterror = false;

            })
            .addCase(PostOnCallAppointment.rejected, (state, action: any) => {
                state.isposterror = true;
                state.ispostloading = false;
                state.ispostssuccess = false;
                state.data = action.payload;
                state.message = action.payload.message;
            });
    },
});

export const { resetPostAppointment, selectClinic, setDoctor, setPatient, setPatientError, setSelectedTelephonicSlot } = PostOnCallAppointmentSlice.actions;

export default PostOnCallAppointmentSlice.reducer;
