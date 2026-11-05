import { API_V1 } from "@/utils/api";
import { getAuthId } from "@/store/auth/authReducer";
import { RootState } from "@/store";
import { today } from "@/utils/common";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
export interface state {
  datePickerOpen: boolean;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  message: string | null;
  calories: any;
  data: any;

  putIsLoading: boolean;
  putIsSuccess: boolean;
  putIsError: boolean;
  putmessage: string | null;
  putdata: any;
}

const initialState: state = {
  datePickerOpen: false,
  isLoading: false,
  isSuccess: false,
  isError: false,
  message: null,
  data: null,
  calories: [],

  putIsLoading: false,
  putIsSuccess: false,
  putIsError: false,
  putmessage: null,
  putdata: null,
};

export const fetchCalories = createAsyncThunk(
  "fetchCalories",
  async (params: null = null, thunkApi: any) => {
    try {
      const state = thunkApi.getState() as RootState;

      const id = getAuthId(state);
      const date = today();
      const res: any = await API_V1.get(
        `nutrition/vitals/calories?date=${date}&id=${id}`,
      );
      return res.data;
    } catch (error: any) {
      console.log("res=>", error);
      return thunkApi.rejectWithValue(error.response.data);
    }
  }
);

export const putCalories = createAsyncThunk(
  "putCalories",
  async (
    params: {
      calories: number | string;
      product_id: number;
    },
    thunkApi: any
  ) => {
    try {
      const state = thunkApi.getState() as RootState;
      const id = getAuthId(state);
      const res: any = await API_V1.put(`nutrition/vitals/calories?calories=${params.calories}&product_id=${params.product_id}&id=${id}`,
        {},
      );
      console.log("----putCalories==>", res.data);
      return res.data;
    } catch (error: any) {
      console.log("res=>", error);
      return thunkApi.rejectWithValue(error.response.data);
    }
  }
);

const CalorieSlice = createSlice({
  name: "CalorieSlice",
  initialState,
  reducers: {
    setCalories: (state, action: PayloadAction<any>) => {
      state.calories = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCalories.pending, (state) => {
        state.isLoading = true;
        state.isSuccess = false;
        state.isError = false;
      })
      .addCase(fetchCalories.fulfilled, (state, action) => {
        console.log(action.payload);
        state.isSuccess = true;
        state.isLoading = false;
        state.isError = false;
        state.data = action.payload;
        state.message = action.payload.message;
        state.calories = action.payload.data?.calories;
      })
      .addCase(fetchCalories.rejected, (state, action: any) => {
        console.log(action.payload);
        state.isError = true;
        state.isLoading = false;
        state.isSuccess = false;
        state.data = action.payload;
        state.message = action.payload.message;
      })
      .addCase(putCalories.pending, (state) => {
        state.putIsLoading = true;
        state.putIsSuccess = false;
        state.putIsError = false;
      })
      .addCase(putCalories.fulfilled, (state, action) => {
        console.log(action.payload);
        state.putIsSuccess = true;
        state.putIsLoading = false;
        state.putIsError = false;
        state.putdata = action.payload;
        state.putmessage = action.payload.message;
        state.calories = action.payload.data?.calories;
      })
      .addCase(putCalories.rejected, (state, action: any) => {
        console.log(action.payload);
        state.putIsError = true;
        state.putIsLoading = false;
        state.putIsSuccess = false;
        state.putdata = action.payload;
        state.putmessage = action.payload.message;
      });
  },
});

export const { } = CalorieSlice.actions;

export default CalorieSlice.reducer;
