import { RootState } from "@/store";
import { DOCEXA_PATIENT_HOST_V3_WEB } from "@/utils/api";
import { createAsyncThunk } from "@reduxjs/toolkit";

export const fetchPrescriptions = createAsyncThunk(
    "prescription/fetchPrescriptions",
    async (
        payload: {
            user_map_id: number;
            patient_id: number;
            page: number;
            limit: number;
        },
        thunkApi
    ) => {
        try {
            const state = thunkApi.getState() as RootState;

            const config = {
                headers: {
                    "app-id": state.auth.app_id,
                    "user-id": state.auth.userId ?? "1",
                    "Content-Type": "application/json",
                },
            };

            const { user_map_id, patient_id, page, limit } = payload;

            const res = await DOCEXA_PATIENT_HOST_V3_WEB.get(
                `establishments/users/${user_map_id}/prescriptionbypatientId/${patient_id}/${page}/${limit}`,
                config
            );
            console.log("response: ", res.data);


            return res.data;
        } catch (error: any) {
            return thunkApi.rejectWithValue(
                error?.response?.data || "Failed to fetch prescriptions"
            );
        }
    }
);
