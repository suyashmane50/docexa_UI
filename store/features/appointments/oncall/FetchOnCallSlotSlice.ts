import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { API, API_V1 } from "@/utils/api";
import { RootState } from "@/store";

interface states {
    data: any | null;
    isLoading: boolean;
    isSuccess: boolean;
    isError: boolean;
    message: string | null;
    doctorInfo: any;
    clinicInfo: any;
    datats: any
}

const initialState: states = {
    data: null,
    message: null,
    isLoading: false,
    isSuccess: false,
    isError: false,
    doctorInfo: null,
    clinicInfo: null,
    datats: []
};

export const fetchOnCallSlot = createAsyncThunk(
    "fetchoncallslot",
    async (doctor_id: number,thunkApi: any) => {
        try {
            const state = thunkApi.getState() as RootState;
            const config = {
                headers: {
                    "App-id": state.auth.app_id,
                    "User-id": state.auth.userId,
                    "Content-Type": "application/json",
                },
            };
            const res: any = await API.get(`doctor/api/retrive/telephonic/${doctor_id}`, config);
            console.log("telephonic data=>", res.data);
            return res.data;
        } catch (error: any) {
            console.log("res=>", error);
            return thunkApi.rejectWithValue(error.response.data);
        }
    }
);

const FetchOnCallSlotSlice = createSlice({
    name: "fetchoncallslotslice",
    initialState,
    reducers: {
        reset: (state) => {
            state.data = null;
            state.message = null;
            state.isLoading = false;
            state.isSuccess = false;
            state.isError = false;
            state.doctorInfo = null;
            state.clinicInfo = null;
            state.datats = [];
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchOnCallSlot.pending, (state) => {
                state.isLoading = true;
                state.isSuccess = false;
                state.isError = false;
            })
            .addCase(fetchOnCallSlot.fulfilled, (state, action) => {
                console.log('action', action.payload)
                state.data = action.payload;
                state.datats = action.payload?.data
                state.doctorInfo = action.payload?.doctors;
                state.isLoading = false;
                state.isSuccess = true;
                state.isError = false;
            })
            .addCase(fetchOnCallSlot.rejected, (state, action: any) => {
                state.isError = true;
                state.isLoading = false;
                state.isSuccess = false;
                if (action?.payload) {
                    state.data = action?.payload;
                    state.message = action.payload.message;
                    if (action.payload?.code == 400) {
                        state.doctorInfo = action.payload?.doctors;
                        state.isError = false;
                        state.isLoading = false;
                        state.isSuccess = true;
                    }
                }
            });
    },
});

export const { reset } = FetchOnCallSlotSlice.actions;

export default FetchOnCallSlotSlice.reducer;
