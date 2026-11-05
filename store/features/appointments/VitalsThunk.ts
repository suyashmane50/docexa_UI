import { RootState } from "@/store";
import { DOCEXA_PATIENT_HOST, DOCEXA_PATIENT_HOST_V3_WEB } from "@/utils/api";
import { createAsyncThunk } from "@reduxjs/toolkit";


export const fetchVitals = createAsyncThunk(
    "vitals/fetchGeneralVitals",
    async (user_map_id: any, thunkApi: any) => {
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
                error?.response?.data || "Something went wrong"
            );
        }
    }
);
