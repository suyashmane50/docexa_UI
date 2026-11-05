import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { API_V1, DOCEXA_PATIENT_HOST } from "../../utils/api";
import { RootState } from "../../store";

interface state {
  isSuccess: boolean;
  isLoading: boolean;
  isError: boolean;
  data: any;
  message: string | null;
  mobileNumber: string | null;
  mobileNumberError: boolean;
  userId: number | string | undefined;
  app_id: number | string | undefined;
  authToken: string | null;
  isLoggedIn: boolean;
}

const initialState: state = {
  isSuccess: false,
  isLoading: false,
  isError: false,
  message: null,
  data: null,
  mobileNumber: "",
  mobileNumberError: false,
  userId: undefined,
  app_id: undefined,
  authToken: null,
  isLoggedIn: false,
};

export const VerifyMobileNumber = createAsyncThunk(
  "VerifyMobileNumber",
  async (_params: null = null, thunkApi: any) => {
    try {
      const state = thunkApi.getState() as RootState;

      const mobileNumber = state.auth.mobileNumber;

      if (!mobileNumber || mobileNumber.length !== 10) {
        return thunkApi.rejectWithValue({
          message: "Please enter a valid 10-digit mobile number.",
        });
      }

      const body = {
        mobile: mobileNumber,
      };

      const res = await DOCEXA_PATIENT_HOST.post(
        "patient/send-otp",
        body
      );

      console.log("OTP API response:", res.data);

      return res.data;
    } catch (error: any) {
      console.error("VerifyMobileNumber API error:", error);

      return thunkApi.rejectWithValue({
        message:
          error.response?.data?.message ??
          error.response?.data?.error ??
          error.message ??
          "Unable to send OTP. Please try again.",
        status: error.response?.status ?? null,
      });
    }
  }
);

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setMobileNumber: (state, action: PayloadAction<string>) => {
      const text = action.payload;
      const filteredText = text?.replace(/[^\d]/g, "");
      if (filteredText?.length < 10) {
        state.mobileNumber = filteredText;
        state.mobileNumberError = true;
      } else {
        state.mobileNumber = filteredText;
        state.mobileNumberError = false;
      }
    },
    setAuth: (
      state,
      action: PayloadAction<number | string | undefined>
    ) => {
      state.userId = action.payload
      state.isLoggedIn = true;
    },
    setAuthMobileNumber: (
      state,
      action: PayloadAction<string>
    ) => {
      state.mobileNumber = action.payload
    },
    setDoctorId: (state, action: PayloadAction<number | string | undefined>) => {
      state.app_id = action.payload;
      console.log("data payload: ", action);

    },
    setLoggedOut: (state) => {
      state.userId = undefined;
      state.isLoggedIn = false;
      state.isSuccess = false;
      state.isLoading = false;
      state.isError = false;
      state.message = null;
      state.data = null;
      state.mobileNumber = "";
      state.mobileNumberError = false;
      state.authToken = null;
    },
    reset: (state) => {
      state.isSuccess = false;
      state.isLoading = false;
      state.isError = false;
      state.message = null;
      state.data = null;
      state.mobileNumber = "";
      state.mobileNumberError = false;
      state.authToken = null;
      state.userId = undefined;
      state.isLoggedIn = false;
    },
  },
 extraReducers: (builder) => {
  builder
    // API request started
    .addCase(VerifyMobileNumber.pending, (state) => {
      state.isLoading = true;
      state.isSuccess = false;
      state.isError = false;
      state.message = null;
    })

    // API request successful
    .addCase(VerifyMobileNumber.fulfilled, (state, action) => {
      console.log("OTP success payload:", action.payload);

      state.isLoading = false;
      state.isSuccess = true;
      state.isError = false;
      state.data = action.payload;

      state.message =
        action.payload?.message ??
        "OTP request completed successfully.";
    })

    // API request failed
    .addCase(VerifyMobileNumber.rejected, (state, action) => {
      console.error("OTP request rejected:", action);

      state.isLoading = false;
      state.isSuccess = false;
      state.isError = true;

      state.data = action.payload ?? null;

      state.message =
        (action.payload as { message?: string } | undefined)?.message ??
        action.error?.message ??
        "Unable to send OTP. Please try again.";
    });
},
});

export const { setMobileNumber, setAuth, setDoctorId, setLoggedOut, reset, setAuthMobileNumber } =
  authSlice.actions;

export const selectisLoggedIn = (state: RootState) => state.auth.isLoggedIn;
export const getAuthtoken = (state: RootState) => state.auth.authToken;
export const getAuthId = (state: RootState) => state.auth.userId;

export default authSlice.reducer;
