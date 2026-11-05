import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { API_V1 } from "@/utils/api";
import { RootState } from "@/store";

interface CallsState {
  data: any | null;
  isNotFound: boolean
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  message: string | null;
  doctorInfo: any;
  clinicInfo: any;
  callsData: any[];
}

const initialState: CallsState = {
  data: null,
  message: null,
  isNotFound: false,
  isLoading: false,
  isSuccess: false,
  isError: false,
  doctorInfo: null,
  clinicInfo: null,
  callsData: [],
};

export const fetchCallsForBoth = createAsyncThunk(
  "fetchCallsForBoth",
  async (_, thunkApi) => {
    try {
      const state = thunkApi.getState() as RootState;

      const config = {
        headers: {
          "App-id": state.auth.app_id,
          "User-id": state.auth.userId,
          "Content-Type": "application/json",
        },
      };
      const res: any = await API_V1.get(
        `patient/appointment/telephonic?call_type=request`,
        config
      );
      console.log("calls data=>", res.data);
      return res.data;
    } catch (error: any) {
      console.log("error=>", error);
      return thunkApi.rejectWithValue(error.response?.data);
    }
  }
);

const CallsSlice = createSlice({
  name: "callsSlice",
  initialState,
  reducers: {
    reset: (state) => {
      state.data = null;
      state.message = null;
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.doctorInfo = null;
      state.clinicInfo = null;
      state.callsData = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCallsForBoth.pending, (state) => {
        state.isLoading = true;
        state.isSuccess = false;
        state.isError = false;
      })
      .addCase(fetchCallsForBoth.fulfilled, (state, action) => {
        console.log("action", action.payload);
        state.data = action.payload;
        state.callsData = action.payload?.data || [];
        state.doctorInfo = action.payload?.doctors;
        state.clinicInfo = action.payload?.clinic;
        state.isLoading = false;
        state.isError = false;
        if (state.data?.code === 404) {
          state.isNotFound = true;
          state.isSuccess = false;
        } else {
          state.isNotFound = false;
          state.isSuccess = true;
        }
      })
      .addCase(fetchCallsForBoth.rejected, (state, action: any) => {
        state.isError = true;
        state.isLoading = false;
        state.isSuccess = false;
        if (action?.payload) {
          state.data = action?.payload;
          state.message = action.payload.message;
          if (action.payload?.code === 400) {
            state.doctorInfo = action.payload?.doctors;
            state.isError = false;
            state.isLoading = false;
            state.isSuccess = true;
          }
        }
      });
  },
});

export const { reset } = CallsSlice.actions;
export default CallsSlice.reducer;
