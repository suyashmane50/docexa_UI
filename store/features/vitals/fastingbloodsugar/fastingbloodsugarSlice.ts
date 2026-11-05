import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { API_V1 } from "../../../../utils/api";
import { RootState } from "@/store";
import { getAuthId } from "@/store/auth/authReducer";

export interface BloodSugarItem {
  id: number;
  fasting_blood_sugar: string;
  updated_at: string;
}

export interface FastingBloodSugarState {
  userData: any | null;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  timeline: BloodSugarItem[];
  message: string | null;
  refreshing: boolean;
  graph: {
    label: string[];
    fasting_blood_sugar: number[];
  };
  isNotFound: boolean;
}

const initialState: FastingBloodSugarState = {
  userData: null,
  isLoading: false,
  isSuccess: false,
  isError: false,
  timeline: [],
  message: null,
  refreshing: false,
  graph: {
    fasting_blood_sugar: [],
    label: [],
  },
  isNotFound: false,
};

export const fetchFastingBloodSugar = createAsyncThunk(
  "fetchFastingBloodSugar",
  async (params: null = null, thunkApi: any) => {
    try {
      const state = thunkApi.getState() as RootState;
      const id = getAuthId(state);
      const res: any = await API_V1.get(`nutrition/vitals/fasting_blood_sugar?id=${id}`);
      console.log("fetchFastingBloodSugar", res.data);
      return res.data;
    } catch (error: any) {
      console.log("res=>", error);
      return thunkApi.rejectWithValue(error.response.data);
    }
  }
);

const convertedData = (data: BloodSugarItem[]): any[] => {
  return data.map((item: BloodSugarItem) => {
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
      fasting_blood_sugar: `${item.fasting_blood_sugar} mg/dL`,
      date: date.replace(/\./g, ""),
      time: time,
    };
  });
};

export const setGraph = (data: BloodSugarItem[]) => {
  // console.log('data', data);
  const fasting_blood_sugar: number[] = data.map((item) =>
    parseFloat(item.fasting_blood_sugar)
  );
  const label: string[] = data.map((item) => {
    const date = new Date(item.updated_at);
    return date.toLocaleDateString("en-US", { day: "numeric", month: "long" });
  });
  // console.log('label', label);
  // console.log('fasting_blood_sugar', fasting_blood_sugar);
  return {
    fasting_blood_sugar: fasting_blood_sugar.reverse(),
    label: label.reverse(),
  };
};

const fastingbloodsugarSlice = createSlice({
  name: "fastingbloodsugar",
  initialState,
  reducers: {
    reset: (state) => {
      (state.isError = false),
        (state.userData = null),
        (state.isLoading = false),
        (state.isSuccess = false),
        (state.timeline = []),
        (state.message = null),
        (state.graph = {
          label: [],
          fasting_blood_sugar: [],
        });
    },
    setRefreshing: (state, action) => {
      state.refreshing = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFastingBloodSugar.pending, (state) => {
        state.isLoading = true;
        state.isSuccess = false;
        state.isError = false;
        state.isNotFound = false;
      })
      .addCase(fetchFastingBloodSugar.fulfilled, (state, action) => {
        try {
          state.isSuccess = true;
          state.isLoading = false;
          // state.isSuccess = false;
          // state.isLoading = true;
          state.isError = false;
          state.userData = action.payload;
          state.timeline = convertedData(action.payload.data);
          state.message = action.payload.message;

          const res = setGraph(action.payload.data);
          state.graph.label = res.label;
          state.graph.fasting_blood_sugar = res.fasting_blood_sugar;
          state.isNotFound = false;
        } catch (error) {
          console.log("error in fullfilled", error);
        }
      })
      .addCase(fetchFastingBloodSugar.rejected, (state, action: any) => {
        console.log(action.payload);
        state.isError = true;
        state.isLoading = false;
        state.isSuccess = false;
        if (action.payload) {
          state.userData = action.payload;
          state.message = action.payload?.message;
          state.isNotFound = action.payload?.code == 404 ? true : false;
        }
      });
  },
});

export const { reset, setRefreshing } = fastingbloodsugarSlice.actions;

export default fastingbloodsugarSlice.reducer;
