import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { API_V1 } from "../../../../utils/api";
import { RootState } from "@/store";

interface BloodSugarState {
  counter: string;
  data: any | null;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  message: string | null;
}

const initialState: BloodSugarState = {
  counter: "70.00",
  data: null,
  message: null,
  isLoading: false,
  isSuccess: false,
  isError: false,
};

export const postBloodSugar = createAsyncThunk(
  "postBloodSugar",
  async (params: null = null, thunkApi: any) => {
    try {
      const state = thunkApi.getState() as RootState;
      const authToken = state.auth.authToken;
      const config = {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      };

      let body = {
        blood_sugar: state.postbloodsugar.counter,
      };

      const res: any = await API_V1.post(
        `nutrition/vitals/blood_sugar`,
        body,
        config
      );
      return res.data;
    } catch (error: any) {
      console.log("res=>", error);
      return thunkApi.rejectWithValue(error.response.data);
    } finally {
    }
  }
);

const postBloodSugarSlice = createSlice({
  name: "postBloodSugarSlice",
  initialState,
  reducers: {
    reset: (state) => {
      state.counter = "70.00";
      state.isError = false;
      state.isLoading = false;
      state.isSuccess = false;
      state.data = null;
      state.message = null;
    },
    increment: (state) => {
      const value = parseFloat(state.counter);
      if (value < 999) {
        let count: any = value + 0.1;
        count = count.toFixed(2);
        state.counter = count;
      }
    },
    decrement: (state) => {
      const value = parseFloat(state.counter);

      if (value > 0) {
        let count: any = value - 0.1;
        count = count.toFixed(2);
        state.counter = count;
      }
    },
    handleInputChange: (state, action) => {
      const text = action.payload;
      if (text === "") {
        state.counter = "0";
      } else {
        let filteredText = text.replace(/[^0-9\.]/g, "");
        console.log("filteredText", filteredText);
        state.counter = filteredText;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(postBloodSugar.pending, (state) => {
        state.isLoading = true;
        state.isSuccess = false;
        state.isError = false;
      })
      .addCase(postBloodSugar.fulfilled, (state, action) => {
        state.isSuccess = true;
        state.isLoading = false;
        state.isError = false;
        state.data = action.payload;
        state.message = action.payload.message;
      })
      .addCase(postBloodSugar.rejected, (state, action: any) => {
        state.isError = true;
        state.isLoading = false;
        state.isSuccess = false;
        state.data = action.payload;
        state.message = action.payload.message;
      });
  },
});

export const { reset, handleInputChange, increment, decrement } =
  postBloodSugarSlice.actions;

export default postBloodSugarSlice.reducer;
