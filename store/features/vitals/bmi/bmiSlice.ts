import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { API_V1 } from "../../../../utils/api";
import { RootState } from "@/store";
import { getAuthId } from "@/store/auth/authReducer";
import { MMMDD } from "@/utils/common";

interface timeLine {
  id: number;
  bmi: string;
  updated_at: string;
}

interface BmiState {
  userData: any | null;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  message: string | null;
  timeline: timeLine[];
  graph: {
    label: string[];
    bmi: number[];
  };
  isNotFound: boolean;
}

const initialState: BmiState = {
  userData: null,
  message: null,
  isLoading: false,
  isSuccess: false,
  isError: false,
  timeline: [],
  graph: {
    label: [],
    bmi: [],
  },
  isNotFound: false,
};

export const fetchBMI = createAsyncThunk(
  "fetchBmi",
  async (params: null = null, thunkApi: any) => {
    try {
      const state = thunkApi.getState() as RootState;
      const id = getAuthId(state);
      const res: any = await API_V1.get(`nutrition/vitals/bmi?id=${id}`);
      console.log("res=>", res.data);
      return res.data;
    } catch (error: any) {
      console.log("res=>", error);
      return thunkApi.rejectWithValue(error.response.data);
    }
  }
);

const convertedData = (data: timeLine[]): any[] => {
  return data.map((item: timeLine) => {
    const dateObj = new Date(item.updated_at);
    const date = dateObj.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
    let hours = dateObj.getHours();
    const minutes = dateObj.getMinutes().toString().padStart(2, "0");
    const period = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    12;
    const formattedHours = hours.toString().padStart(2, "0");
    const time = `${formattedHours}:${minutes} ${period}`;
    return {
      bmi: `${item.bmi} kg/m2`,
      date: date.replace(/\./g, ""), // Remove dots from month
      time: time,
    };
  });
};

export const setGraph = (data: timeLine[]) => {
  // console.log(data);
  const bmi: number[] = data.map((item: timeLine) => item.bmi ? parseFloat(item.bmi) : 0);
  const label: string[] = data.map((item: timeLine) => {
    const date = new Date(item.updated_at);
    // return date.toLocaleDateString("en-US", { day: "numeric", month: "long" });
    return MMMDD(date)
  });
  return { bmi: bmi.reverse(), label: label.reverse() };
};

const bmiSlice = createSlice({
  name: "bmi",
  initialState,
  reducers: {
    reset: (state) => {
      state.userData = null;
      state.message = null;
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.timeline = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBMI.pending, (state) => {
        state.isLoading = true;
        state.isSuccess = false;
        state.isError = false;
        state.isNotFound = false;
      })
      .addCase(fetchBMI.fulfilled, (state, action) => {
        state.userData = action.payload;
        state.message = action.payload.message;
        state.isLoading = false;
        state.isSuccess = true;
        state.isError = false;
        state.isNotFound = false;
        state.timeline = convertedData(action.payload.data);

        const res = setGraph(action.payload.data);
        console.log("graph data=>", res);
        state.graph.label = res.label;
        state.graph.bmi = res.bmi;
      })
      .addCase(fetchBMI.rejected, (state, action: any) => {
        state.isError = true;
        state.isLoading = false;
        state.isSuccess = false;
        if (action?.payload) {
          state.userData = action.payload;
          state.message = action.payload.message;
          state.isNotFound = action.payload.code == 404 ? true : false;
          state.isError = action.payload?.code == 404 ? false : true;
        }
      });
  },
});

export const { reset } = bmiSlice.actions;

export default bmiSlice.reducer;
