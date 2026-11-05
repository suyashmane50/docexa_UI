import { API_V1, DOCEXA_PATIENT_HOST } from "@/utils/api";
import { RootState } from "@/store";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

interface states {
    data: any | null;
    isLoading: boolean;
    isSuccess: boolean;
    isError: boolean;
    message: string | null;
    name: string | undefined;
    age: string | undefined;
    dob: string | undefined;
    height: string | undefined;
    weight: string | undefined;
    gender: string | undefined;
}

const initialState: states = {
    data: null,
    message: null,
    isLoading: false,
    isSuccess: false,
    isError: false,
    name: undefined,
    age: undefined,
    dob: undefined,
    height: undefined,
    weight: undefined,
    gender: undefined,
};

export const getPatinetByid = createAsyncThunk(
    "getpatinetbyid",
    async (id: any, thunkApi: any) => {
        try {
            const state = thunkApi.getState() as RootState;
            const config = {
                headers: {
                    "App-id": state.auth?.app_id,
                    "User-id": state.auth?.userId,
                    "Content-Type": "application/json",
                },
            };
            console.log("::id::", id);

            const res: any = await DOCEXA_PATIENT_HOST.get(`patient/dashboard/${id}`, config);

            console.log("1)response: ", res);

            return res.data;
        } catch (error: any) {
            console.log("res=>", error);
            return thunkApi.rejectWithValue(error.response.data);
        } finally {
        }
    }
);

const getPatientByIdSlice = createSlice({
    name: "getpatientbyidslice",
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
            .addCase(getPatinetByid.pending, (state) => {
                state.isLoading = true;
                state.isSuccess = false;
                state.isError = false;
            })
            .addCase(getPatinetByid.fulfilled, (state, action) => {
                console.log("getPatinetByid fulfilled payload =>", action?.payload);

                state.data = action.payload;
                state.message = action.payload?.message ?? null;
                state.isLoading = false;
                state.isSuccess = true;
                state.isError = false;

                // Support multiple possible payload shapes:
                // { data: {...patient} } OR { patient: {...} } OR { data: { patient: {...} } }
                let patient: any =
                    action.payload?.data && !Array.isArray(action.payload.data)
                        ? action.payload.data
                        : action.payload?.patient ||
                        action.payload?.data?.patient ||
                        null;

                // If data is an array for some reason, take the first item
                if (!patient && Array.isArray(action.payload?.data)) {
                    patient = action.payload.data[0];
                }

                state.name = patient?.patient_name ?? patient?.name ?? undefined;
                state.dob = patient?.dob ?? patient?.date_of_birth ?? undefined;
                state.height = patient?.height_last ?? patient?.height ?? undefined;
                state.weight = patient?.weight_last ?? patient?.weight ?? undefined;
                state.gender = patient?.gender ?? undefined;
            })
            .addCase(getPatinetByid.rejected, (state, action: any) => {
                state.isError = true;
                state.isLoading = false;
                state.isSuccess = false;
                state.data = action.payload;
                state.message = action.payload.message;
            });
    },
});

export const { reset } = getPatientByIdSlice.actions;

export default getPatientByIdSlice.reducer;
