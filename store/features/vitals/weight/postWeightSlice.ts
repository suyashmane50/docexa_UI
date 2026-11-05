import { API_V1 } from "../../../../utils/api";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "@/store";
import { getAuthId } from "@/store/auth/authReducer";

interface WeightState {
  counter: string;
  data: any | null;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  message: string | null;
}

const initialState: WeightState = {
  counter: "55.00",
  data: null,
  message: null,
  isLoading: false,
  isSuccess: false,
  isError: false,
};

export const postWeight = createAsyncThunk(
  "postWeight",
  async (arg: null = null, thunkApi: any) => {
    try {
      const state = thunkApi.getState() as RootState;
      const id = getAuthId(state);
      let body = { weight: state.postweight.counter };

      const res: any = await API_V1.post(
        `nutrition/vitals/weight?id=${id}`,
        body,
      );
      console.log("res=>", res.data);
      return res.data;
    } catch (error: any) {
      console.log("res=>", error);
      return thunkApi.rejectWithValue(error.response.data);
    } finally {
    }
  }
);

const postWeightSlice = createSlice({
  name: "weight",
  initialState,
  reducers: {
    reset: (state) => {
      state.counter = "55.00";
      state.isError = false;
      state.data = null;
      state.isLoading = false;
      state.isSuccess = false;
      state.message = null;
    },
    increment: (state) => {
      let value = parseFloat(state.counter);
      if (value < 300) {
        let count: any = value + 0.05;
        count = count.toFixed(2);
        state.counter = count?.toString();
      }
      console.log("state", state.counter);
    },
    decrement: (state) => {
      let value = parseFloat(state.counter);
      if (value > 0) {
        let count: any = value - 0.05;
        count = count.toFixed(2);
        state.counter = count?.toString();
      }
      console.log("state", state.counter);
    },
    handleInputChange: (state, action) => {
      const text = action.payload;
      console.log("handleInputChange", text);
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
      .addCase(postWeight.pending, (state) => {
        state.isLoading = true;
        state.isSuccess = false;
        state.isError = false;
      })
      .addCase(postWeight.fulfilled, (state, action) => {
        state.isSuccess = true;
        state.isLoading = false;
        state.isError = false;
        state.data = action.payload;
        state.message = action.payload.message;
      })
      .addCase(postWeight.rejected, (state, action: any) => {
        console.log(action.payload);
        state.isError = true;
        state.isLoading = false;
        state.isSuccess = false;
        state.data = action.payload;
        state.message = action.payload.message;
      });
  },
});

export const { reset, increment, decrement, handleInputChange } =
  postWeightSlice.actions;

export default postWeightSlice.reducer;
