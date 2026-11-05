import { API_V1 } from "../../../../utils/api";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { RootState } from "@/store";
import { getAuthId, getAuthtoken } from "@/store/auth/authReducer";
import { MMMDD } from "@/utils/common";

export interface weightItem {
  id: number;
  weight: string;
  updated_at: string;
}

export interface state {
  data: any | null;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  WeightList: weightItem[];
  message: string | null;
  refreshing: boolean;
  graph: {
    label: string[];
    weight: number[];
  };
  isNotFound: boolean;
}

const initialState: state = {
  data: null,
  isLoading: false,
  isSuccess: false,
  isError: false,
  WeightList: [],
  message: null,
  refreshing: false,
  graph: {
    weight: [],
    label: [],
  },
  isNotFound: false,
};

export const fetchWeight = createAsyncThunk(
  "fetchWeight",
  async (arg: null = null, thunkApi: any) => {
    try {
      const state = thunkApi.getState() as RootState;
      const id = getAuthId(state);
      const res: any = await API_V1.get(`nutrition/vitals/weight?id=${id}`);
      console.log("fetchWeight", res.data);
      return res.data;
    } catch (error: any) {
      console.log("res=>", error);
      return thunkApi.rejectWithValue(error.response.data);
    } finally {
      // thunkApi.dispatch(setRefreshing(false));
    }
  }
);

const convertedData = (data: weightItem[]): any[] => {
  return data.map((item: weightItem) => {
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
      weight: `${item.weight} Kg`,
      date: date.replace(/\./g, ""), // Remove dots from month
      time: time,
    };
  });
};

export const setGraph = (data: weightItem[]) => {
  console.log("data", data);
  const weight: number[] = data.map((item) => parseFloat(item.weight));
  const label: string[] = data.map((item) => {
    const date = new Date(item.updated_at);
    // return date.toLocaleDateString("en-US", { day: "numeric", month: "long" });
    return MMMDD(date)
  });
  console.log("label", label);
  console.log("weight", weight);
  return { weight: weight.reverse(), label: label.reverse() };
};

const WeightFetchSlice = createSlice({
  name: "weightFetch",
  initialState,
  reducers: {
    reset: (state) => {
      state.isError = false;
      state.data = null;
      state.isLoading = false;
      state.isSuccess = false;
      state.WeightList = [];
      state.message = null;
      state.graph = {
        label: [],
        weight: [],
      };
    },
    setRefreshing: (state, action) => {
      state.refreshing = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWeight.pending, (state) => {
        state.isLoading = true;
        state.isSuccess = false;
        state.isError = false;
        state.isNotFound = false;
      })
      .addCase(fetchWeight.fulfilled, (state, action) => {
        state.isSuccess = true;
        state.isLoading = false;
        state.isError = false;
        state.data = action.payload;
        state.WeightList = convertedData(action.payload.data);
        state.message = action.payload.message;

        const res = setGraph(action.payload.data);
        (state.graph.label = res.label), (state.graph.weight = res.weight);
        state.isNotFound = false;
      })
      .addCase(fetchWeight.rejected, (state, action: any) => {
        state.isError = true;
        state.isLoading = false;
        state.isSuccess = false;
        console.log(action.payload);
        if (action.payload) {
          state.data = action.payload;
          state.message = action.payload?.message
            ? action.payload?.message
            : null;
          state.isNotFound = action.payload?.code == 404 ? true : false;
          state.isError = action.payload?.code == 404 ? false : true;
        }
      });
  },
});

export const { reset, setRefreshing } = WeightFetchSlice.actions;

export default WeightFetchSlice.reducer;
