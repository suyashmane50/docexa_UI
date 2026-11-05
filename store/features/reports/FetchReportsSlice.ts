import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { API_V1 } from "../../../utils/api";
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

export const getReports = createAsyncThunk(
    "getReports",
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
            console.log("Report data =>", res.data);
            return res.data;
        } catch (error: any) {
            console.log("res=>", error);
            return thunkApi.rejectWithValue(error.response.data);
        }
    }
);

const FetchReportsSlice = createSlice({
    name: "FetchReportsSlice",
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
        builder
            .addCase(getReports.pending, (state) => {
                state.isLoading = true;
                state.isSuccess = false;
                state.isError = false;
            })
            .addCase(getReports.fulfilled, (state, action) => {
                state.data = action.payload.data;
                // state.message = action.payload;
                state.isLoading = false;
                state.isSuccess = true;
                state.isError = false;
            })
            .addCase(getReports.rejected, (state, action: any) => {
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

export const { reset } = FetchReportsSlice.actions;

export default FetchReportsSlice.reducer;
