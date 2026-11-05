import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { API_V1, DOCEXA_PATIENT_HOST, DOCEXA_PATIENT_HOST_V3_WEB, localHost } from "../../../utils/api";
import { RootState } from "@/store";

interface states {
    data: any | null;
    isLoading: boolean;
    isSuccess: boolean;
    isError: boolean;
    message: string | null;
}

const initialState: states = {
    data: null,
    message: null,
    isLoading: false,
    isSuccess: false,
    isError: false,
};

interface fetchAppointmentPayload {
    patient_id: string;
}

interface cancelAppointmentPayload {
    bookingID: number;
    remark: "" | null;
    scheduletimestamp: string | null;
    slot_size: string | null;
    status: number | 3;
}

export const cancelAppointment = createAsyncThunk(
    "appointment/cancel",
    async (payload: cancelAppointmentPayload, thunkApi: any) => {
        try {
            console.log(payload);

            const state = thunkApi.getState() as RootState;

            const config = {
                headers: {
                    "App-id": state.auth.app_id,
                    "User-id": state.auth.userId,
                    "Content-Type": "application/json",
                },
            };

            const body = {
                bookingID: payload.bookingID,
                remark: payload.remark,
                scheduletimestamp: payload.scheduletimestamp,
                // scheduletimestamp: "18:15:00",
                // slot_size: "15",
                slot_size: payload.slot_size,
                status: "cancelled", // if backend expects status
            };

            const res = await DOCEXA_PATIENT_HOST_V3_WEB.post(
                "appointment/update",
                body,
                config
            );

            console.log("Cancel appointment response =>", res.data);
            return res.data;
        } catch (error: any) {
            console.log("Cancel appointment error =>", error);
            return thunkApi.rejectWithValue(
                error?.response?.data || "Failed to cancel appointment"
            );
        }
    }
);


export const fetchAppointment = createAsyncThunk(
    "fetchappointment",
    async (payload: fetchAppointmentPayload, thunkApi: any) => {
        try {
            const state = thunkApi.getState() as RootState;
            console.log("stAte: ", state);
            console.log(state.auth.app_id);


            const config = {
                headers: {
                    "app-id": state.auth.app_id,
                    "user-id": state.auth.userId ?? "1",
                    "Content-Type": "application/json",
                },
            };

            const body = {
                patient_id: state.auth.userId,
                app_id: state.auth.app_id,
                mobile_no: state.auth.mobileNumber,
            };


            const res = await DOCEXA_PATIENT_HOST.post(
                "patient/dashboard/appointments",
                body,
                config
            );

            console.log("Appointment response =>", res.data);
            return res.data;
        } catch (error: any) {
            console.log("Appointment error =>", error);
            return thunkApi.rejectWithValue(
                error?.response?.data || "Something went wrong"
            );
        } finally {
        }
    }
);

export const getAppointment = createAsyncThunk(
    "getappointment",
    async (param: null = null, thunkApi: any) => {
        try {
            const state = thunkApi.getState() as RootState;
            const config = {
                headers: {
                    "App-id": state.auth.app_id,
                    "User-id": state.auth.userId,
                    "Content-Type": "application/json",
                },
            };
            const res: any = await API_V1.get(`dashboard/appointments`, config);
            console.log("recipie data=>", res.data);
            console.log("hi");

            return res.data;
        } catch (error: any) {
            console.log("res=>", error);
            return thunkApi.rejectWithValue(error.response.data);
        }
    }
);

const FetchAppointmentSlice = createSlice({
    name: "Fetchappointmentslice",
    initialState,
    reducers: {
        reset: (state) => {
            state.data = null;
            state.message = null;
            state.isLoading = false;
            state.isSuccess = false;
            state.isError = false;
        },
    },
    extraReducers: (builder) => {
        const setLoadingState = (state: states, isLoading: boolean, isSuccess: boolean, isError: boolean) => {
            state.isLoading = isLoading;
            state.isSuccess = isSuccess;
            state.isError = isError;
        };

        builder
            .addCase(getAppointment.pending, (state) => {
                setLoadingState(state, true, false, false);
            })
            .addCase(getAppointment.fulfilled, (state, action) => {
                setLoadingState(state, false, true, false);
                state.data = action.payload.data;
            })
            .addCase(getAppointment.rejected, (state, action: any) => {
                setLoadingState(state, false, false, true);
                if (action?.payload) {
                    state.data = action.payload;
                    state.message = action.payload.message;
                }
            })
            // y -- Fetch Appointment cases for new api's --
            .addCase(fetchAppointment.pending, (state) => {
                setLoadingState(state, true, false, false);
            })
            .addCase(fetchAppointment.fulfilled, (state, action) => {
                setLoadingState(state, false, true, false);

                // ✅ STORE ONLY ACTUAL DATA ARRAY
                state.data = action.payload?.data ?? [];
                state.message = action.payload?.message ?? null;
            })
            .addCase(fetchAppointment.rejected, (state, action: any) => {
                setLoadingState(state, false, false, true);
                state.message =
                    action.payload?.message ?? "Failed to fetch appointments";
            });
    },
});

export const { reset } = FetchAppointmentSlice.actions;

export default FetchAppointmentSlice.reducer;
