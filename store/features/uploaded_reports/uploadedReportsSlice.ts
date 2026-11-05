import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { DOCEXA_PATIENT_HOST, localHost, localMobile } from "../../../utils/api";
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



export const fetchReports = createAsyncThunk(
    "reports/fetchReports",
    async (patient_id: number, thunkApi) => {
        try {
            const response = await DOCEXA_PATIENT_HOST.get("patient/get_reports", {
                params: { patient_id },
            });

            return response.data;
        } catch (error: any) {
            console.log("Fetch reports error:", error);

            return thunkApi.rejectWithValue(
                error?.response?.data?.message ||
                error?.message ||
                "Failed to fetch reports"
            );
        }
    }
);


export const uploadReports = createAsyncThunk(
  "reports/uploadReports",
  async (payload: FormData, thunkApi) => {
    try {

      const response = await fetch(
        "https://api-staging.docexa.com/api/v4/patient/upload_report",
        {
          method: "POST",
          headers: {
            Accept: "application/json",
          },

          body: payload,
        }
      );

      const data = await response.json();

      console.log("UPLOAD RESPONSE :", data);

      if (!response.ok) {
        throw data;
      }

      return data;

    } catch (error: any) {

      console.log(
        "UPLOAD ERROR :",
        JSON.stringify(error, null, 2)
      );

      return thunkApi.rejectWithValue(
        error || "Something went wrong"
      );
    }
  }
);








const ReportsSlice = createSlice({
    name: "ReportsSlice",
    initialState,
    reducers: {
        resetReports: (state) => {
            state.data = null;
            state.message = null;
            state.isLoading = false;
            state.isSuccess = false;
            state.isError = false;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchReports.pending, (state) => {
                state.isLoading = true;
                state.isSuccess = false;
                state.isError = false;
                state.message = null;
            })
            .addCase(fetchReports.fulfilled, (state, action) => {
                state.data = action.payload;
                state.isLoading = false;
                state.isSuccess = true;
                state.isError = false;
            })
            .addCase(fetchReports.rejected, (state, action: any) => {
                state.isLoading = false;
                state.isSuccess = false;
                state.isError = true;
                state.message = action.payload || "Failed to fetch reports";
            });
    }

});

export const { resetReports } = ReportsSlice.actions;
export default ReportsSlice.reducer;
