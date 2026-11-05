import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { API_V1, DOCEXA_PATIENT_HOST } from "../../../utils/api";
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
};

export interface appointmentPayload {
    "doctor_id": number,
    "sku_id": number | null,
    "patient_id": number,
    "clinic_id": number,
    "schedule_date": string,
    "schedule_time": string,
    "payment_amount": number,
    "gender": number | null,
    "age": any | null,
    "patient_mobile_no": string | null,
    "email": string | null,
    "patient_name": string | null,
    "slot_size": 15,
    "source": string | null,
    "schedule_remark": string | null,
}
// export interface appointmentPayload {
//     "user_id": number,
//     "doctor_id": number,
//     "date": string,
//     "slot_id": string | number,
//     "slot_name": string,
//     "phone": string | null,
//     "user_description": string | null,
//     "payment_type": string,
//     "consultation_fees": number,
//     "sku_id": string | null,
// }
export const PostAppointment = createAsyncThunk(
    "postappointment",
    async (param: appointmentPayload, thunkApi: any) => {
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
            const res: any = await DOCEXA_PATIENT_HOST.post(`patient/dashboard/bookappointment`, param, config);
            // const res: any = await API_V1.post(`dashboard/bookappointment`, param, config);
            console.log("recipie data=>", res.data);
            return res.data;
        } catch (error: any) {
            console.log("res=>", error);
            return thunkApi.rejectWithValue(error.response.data);
        } finally {
        }
    }
);

const PostAppointmentSlice = createSlice({
    name: "PostappointmentSlice",
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
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(PostAppointment.pending, (state) => {
                state.ispostloading = true;
                state.ispostssuccess = false;
                state.isposterror = false;
            })
            .addCase(PostAppointment.fulfilled, (state, action) => {
                state.data = action.payload;
                state.message = action.payload.message;
                state.ispostloading = false;
                state.ispostssuccess = true;
                state.isposterror = false;

            })
            .addCase(PostAppointment.rejected, (state, action: any) => {
                state.isposterror = true;
                state.ispostloading = false;
                state.ispostssuccess = false;
                state.data = action.payload;
                state.message = action.payload.message;
            });
    },
});

export const { resetPostAppointment, selectClinic, setDoctor, setPatient, setPatientError } = PostAppointmentSlice.actions;

export default PostAppointmentSlice.reducer;
