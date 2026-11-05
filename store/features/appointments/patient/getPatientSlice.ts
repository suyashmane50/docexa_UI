import { API_V1, DOCEXA_PATIENT_HOST, localHost } from "@/utils/api";
import { RootState } from "@/store";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import AsyncStorage from "@react-native-async-storage/async-storage";

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

export const getPatinet = createAsyncThunk(
    "getPatinet",
    async (param: null = null, thunkApi: any) => {
        try {
            const state = thunkApi.getState() as RootState;
            const user_map_id = await AsyncStorage.getItem('user_map_id');
            console.warn("UserMapId:::: ", user_map_id);

            const config = {
                headers: {
                    "App-id": state.auth.app_id,
                    "User-id": state.auth.userId,
                    "Content-Type": "application/json",
                    "mobile-no": state.auth.mobileNumber,
                    "created-by-doctor": user_map_id
                },
            };

            console.warn("header: ", config);
            console.warn("state: ", state);

            const res: any = await DOCEXA_PATIENT_HOST.get(`patient/dashboard/patients`, config);
            // const res: any = await localHost.get(`patient/dashboard/patients`, config);
            console.warn("Patients Data: ", res.data);

            return res.data;
        } catch (error: any) {
            console.log("res=>", error);
            return thunkApi.rejectWithValue(error.response.data);
        } finally {
        }
    }
);

const getPatientSlice = createSlice({
    name: "getPatinet",
    initialState,
    reducers: {
        reset: (state) => {
            state.data = null;
            state.message = null;
            state.isLoading = false;
            state.isSuccess = false;
            state.isError = false;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(getPatinet.pending, (state) => {
                state.isLoading = true;
                state.isSuccess = false;
                state.isError = false;
            })
            .addCase(getPatinet.fulfilled, (state, action) => {
                state.data = action.payload?.patients;
                state.message = action.payload?.message;
                state.isLoading = false;
                state.isSuccess = true;
                state.isError = false;

            })
            .addCase(getPatinet.rejected, (state, action: any) => {
                state.isError = true;
                state.isLoading = false;
                state.isSuccess = false;
                state.data = action.payload;
                state.message = action.payload?.message;
            });
    },
});

export const { reset } = getPatientSlice.actions;

export default getPatientSlice.reducer;
