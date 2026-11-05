import { RootState } from "@/store";
import { DOCEXA_PATIENT_HOST, localHost } from "@/utils/api";
import { createAsyncThunk } from "@reduxjs/toolkit";

export const EditPatient = createAsyncThunk(
    "editPatient",
    async (payload: any, thunkApi: any) => {
        try {
            const state = thunkApi.getState() as RootState;
            const config = {
                headers: {
                    "App-id": state.auth.app_id,
                    "User-id": state.auth.userId,
                    "Content-Type": "application/json",
                },
            };
            console.log("Payload: ", payload);

            const res: any = await DOCEXA_PATIENT_HOST.post(`patient/editpatientapi`, payload, config);
            return res.data;
        } catch (error: any) {
            console.log("res=>", error);
            return thunkApi.rejectWithValue(error.response.data);
        } finally {
        }
    }
);