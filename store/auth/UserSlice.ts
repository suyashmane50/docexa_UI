import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { API, API_V1, API_V1_public } from "../../utils/api";
import axios from "axios";

interface state {
    isLoading: boolean;
    isSuccess: boolean;
    isError: boolean;
    message: string | undefined;
    data: any;
    user: any;
    states: {
        "state_id": number,
        "state_name": string,
        "state_name_hindi": string,
        "state_name_marathi": string,
        "deleted_at": string
    }[]
}

const initialState: state = {
    isLoading: false,
    isSuccess: false,
    isError: false,
    message: undefined,
    data: undefined,
    user: undefined,
    states: []
};

export interface editType {
    gender: number | undefined,
    name: string,
    email: string | null,
    dob: string | undefined,
    address: string | null
}

export const getUserInfo = createAsyncThunk(
    "userinfo",
    async (data: any, thunkApi: any) => {
        try {
            console.warn('------------------calling me-----------------')
            console.log("data: ", data);

            // const res: any = await axios.get(`https://sugarsteady.docexa.com/public/api/v1/dashboard/patient/${id}`);
            const res: any = await axios.get(`https://api-staging.docexa.com/api/v4/superpatients/master_user/${data.user_map_id}/${data.id}`);
            // const res: any = await axios.get(`http://localhost:8000/api/v4/superpatients/master_user/${data.user_map_id}/${data.id}`);
            console.log("user-data: ", res);
            console.log("new user Data: ", res.data[0]);


            return res.data[0];
        } catch (error: any) {
            return thunkApi.rejectWithValue(error.response.data);
        }
    }
);

export const UserSlice = createSlice({
    name: "user_slice",
    initialState,
    reducers: {
    },
    extraReducers: (builder) => {
        builder
            .addCase(getUserInfo.pending, (state) => {
                state.isLoading = true;
                state.isSuccess = false;
                state.isError = false;
            })
            .addCase(getUserInfo.fulfilled, (state, action) => {
                try {
                    console.warn('action.payload', action.payload)
                    state.isSuccess = true;
                    state.isLoading = false;
                    state.isError = false;
                    state.data = action.payload;
                    state.user = action.payload?.data;
                    // state.states = action.payload?.data.states;
                } catch (error) {
                    console.log("error", error);
                }
            })
            .addCase(getUserInfo.rejected, (state, action: any) => {
                console.log("action in rejected in userslice", action);
                state.isError = true;
                state.isLoading = false;
                state.isSuccess = false;
                if (action?.payload) {
                    state.data = action.payload;
                    state.message = action.payload.message;
                } else {
                    state.data = null;
                    state.message = "Try again later";
                }
            })


    },
});

export const { } = UserSlice.actions;

export default UserSlice.reducer;
