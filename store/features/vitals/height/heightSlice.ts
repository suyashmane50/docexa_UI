import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { API_V1 } from "../../../../utils/api";
import { RootState } from "@/store";
import { getAuthId } from "@/store/auth/authReducer";
import { MMMDD } from "@/utils/common";

export interface HeightItem {
  id: number;
  height: string;
  updated_at: string;
}

export interface HeightState {
  userData: any | null;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  HeightList: HeightItem[];
  message: string | null;
  refreshing: boolean;
  graph: {
    label: string[];
    height: number[];
  };
  isNotFound: boolean;
}

const initialState: HeightState = {
  userData: null,
  isLoading: false,
  isSuccess: false,
  isError: false,
  HeightList: [],
  message: null,
  refreshing: false,
  graph: {
    height: [],
    label: [],
  },
  isNotFound: false,
};

export const fetchHeight = createAsyncThunk(
  "fetchHeight",
  async (arg: null = null, thunkApi: any) => {
    try {
      const state = thunkApi.getState() as RootState;
      const id = getAuthId(state);
      const res: any = await API_V1.get(`nutrition/vitals/height?id=${id}`);
      console.log("fetchHeight", res.data);
      return res.data;
    } catch (error: any) {
      console.log("res=>", error);
      return thunkApi.rejectWithValue(error.response.data);
    }
  }
);

const convertedData = (data: HeightItem[]): any[] => {
  return data.map((item: HeightItem) => {
    const dateObj = new Date(item.updated_at);
    const date = dateObj.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
    // const ata
    let hours = dateObj.getHours();
    const minutes = dateObj.getMinutes().toString().padStart(2, "0");
    const period = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    12;
    const formattedHours = hours.toString().padStart(2, "0");
    const time = `${formattedHours}:${minutes} ${period}`;
    return {
      height: `${item.height} cm`,
      date: date.replace(/\./g, ""), // Remove dots from month
      time: time,
    };
  });
};

export const setGraph = (data: HeightItem[]) => {
  const height: number[] = data.map((item: HeightItem) =>
    parseFloat(item.height)
  );
  const label: string[] = data.map((item: HeightItem) => {
    const date = new Date(item.updated_at);
    // return date.toLocaleDateString("en-US", { day: "numeric", month: "long" });
    return MMMDD(date)
  });
  return { height: height.reverse(), label: label.reverse() };
};

const heightSlice = createSlice({
  name: "HeightSlice",
  initialState,
  reducers: {
    reset: (state) => {
      (state.isError = false),
        (state.userData = null),
        (state.isLoading = false),
        (state.isSuccess = false),
        (state.HeightList = []),
        (state.message = null),
        (state.graph = {
          label: [],
          height: [],
        });
    },
    setRefreshing: (state, action) => {
      state.refreshing = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchHeight.pending, (state) => {
        state.isLoading = true;
        state.isSuccess = false;
        state.isError = false;
        state.isNotFound = false;
      })
      .addCase(fetchHeight.fulfilled, (state, action) => {
        state.isSuccess = true;
        state.isLoading = false;
        state.isError = false;
        state.userData = action.payload;
        state.HeightList = convertedData(action.payload.data);
        state.message = action.payload.message;

        const res = setGraph(action.payload.data);
        console.log("graph data=>", res);
        state.graph.label = res.label;
        state.graph.height = res.height;
        state.isNotFound = false;
      })
      .addCase(fetchHeight.rejected, (state, action: any) => {
        state.isError = true;
        state.isLoading = false;
        state.isSuccess = false;
        if (action.payload) {
          state.userData = action.payload;
          state.message = action.payload.message;
          state.isNotFound = action.payload.code == 404 ? true : false;
          state.isError = action.payload?.code == 404 ? false : true;
        }
      });
  },
});

export const { reset, setRefreshing } = heightSlice.actions;

export default heightSlice.reducer;
