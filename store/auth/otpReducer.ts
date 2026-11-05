import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { RootState } from "../../store";
import { API_V1, DOCEXA_PATIENT_HOST, localHost } from "../../utils/api";

// State interface
interface State {
  isSuccess: boolean;
  isLoading: boolean;
  isError: boolean;
  data: any;
  message: string | null;
  isRegisterd: boolean;
}

// Initial state
const initialState: State = {
  isSuccess: false,
  isLoading: false,
  isError: false,
  data: null,
  message: null,
  isRegisterd: false,
};

// Function to save token securely
// export async function save(key: string, value: string) {
//   await localStorage.setItem(key, value);
// }

// Async thunk to verify OTP
export const VerifyOtp = createAsyncThunk(
  "VerifyOtp",
  async (params: number | string, thunkAPI) => {
    try {
      const state = thunkAPI.getState() as RootState;
      const body = {
        mobile: Number(state.auth.mobileNumber),
        otp: Number(params),
        app_id: Number(state.auth.app_id)
      };
      console.log("Body: ", body);

      // const res: any = await localHost.post(`patient/verify-otp`, body);
      const res: any = await DOCEXA_PATIENT_HOST.post(`patient/verify-otp`, body);
      console.log("res.data: ", res.data);
      const testRes = {
        status: 200,
        message: "OTP verified successfully",
        is_register: 1,
      }
      return res.data;
      // return testRes;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response.data);
    }
  }
);

// OTP slice
export const otpSlice = createSlice({
  name: "otp",
  initialState,
  reducers: {
    resetOtp: (state) => {
      state.isSuccess = false;
      state.isLoading = false;
      state.isError = false;
      state.data = null;
      state.message = null;
      state.isRegisterd = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(VerifyOtp.pending, (state) => {
        state.isLoading = true;
        state.isSuccess = false;
        state.isError = false;
      })
      .addCase(VerifyOtp.fulfilled, (state, action) => {
        state.isSuccess = true;
        state.isLoading = false;
        state.isError = false;
        state.data = action.payload;
        state.message = action.payload?.message;
        state.isRegisterd = action.payload?.is_register == 0 ? false : true;
      })
      .addCase(VerifyOtp.rejected, (state, action: any) => {
        state.isError = true;
        state.isLoading = false;
        state.isSuccess = false;
        state.data = action.payload;
        state.message = action.payload?.message;
      });
  },
});

// Export actions and reducer
export const { resetOtp } = otpSlice.actions;
export const selectisLoggedIn = (state: RootState) => state.auth.isLoggedIn;
export default otpSlice.reducer;
