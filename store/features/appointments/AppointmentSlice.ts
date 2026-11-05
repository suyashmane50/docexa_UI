import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { API_V1, DOCEXA_PATIENT_HOST, localHost } from "../../../utils/api";
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


export const fetchDashboard = createAsyncThunk(
  "fetchdashboard",
  async (param: null = null, thunkApi: any) => {
    try {

      const state = thunkApi.getState() as RootState;
      console.log("full state for mobile: :  ", state);
      const config = {
        headers: {
          "app-id": state.auth.app_id,
          "user-id": state.auth.userId,
          // "user-id": "1",
          "mobile-no": state.auth.mobileNumber,
          "Content-Type": "application/json",
        },
      };
      console.warn("state: ", state);
      console.warn("header config: ", config);


      // const res: any = await API_V1.get(`dashboard`, config);
      console.log("hit");

      const res: any = await DOCEXA_PATIENT_HOST.get(`patient/dashboard/index`, config);
      console.log("res.data=>", res.data);
      return res.data;
    } catch (error: any) {
      console.log("res=>", error);
      return thunkApi.rejectWithValue(error.response.data);
    } finally {
    }
  }
);



const AppointmentSlice = createSlice({
  name: "AppointmentSlice",
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
      .addCase(fetchDashboard.pending, (state) => {
        state.isLoading = true;
        state.isSuccess = false;
        state.isError = false;
      })
      .addCase(fetchDashboard.fulfilled, (state, action) => {
        try {
          state.data = action.payload;
          state.message = action.payload.message;
          state.isLoading = false;
          state.isSuccess = true;
          state.isError = false;
        } catch (error) {
          console.log(error);
        }
      })
      .addCase(fetchDashboard.rejected, (state, action: any) => {
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

export const { reset } = AppointmentSlice.actions;

export default AppointmentSlice.reducer;
