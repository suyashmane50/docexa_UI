import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { API_V1 } from "../../../utils/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface states {
  data: any | null;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  message: string | null;
  top_recipes: any[];
  recipes: any[];
}

const initialState: states = {
  data: {},
  message: null,
  isLoading: false,
  isSuccess: false,
  isError: false,
  top_recipes: [],
  recipes: [],
};

export const fetchAllrecipes = createAsyncThunk(
  "fetchAllrecipes",
  async (params: null = null, thunkApi: any) => {
    try {
      const res: any = await API_V1.get(`nutrition/recipe`);
      console.log("recipes=>", res.data);
      return res.data;
    } catch (error: any) {
      console.log("res=>", error);
      return thunkApi.rejectWithValue(error.response.data);
    } finally {
    }
  }
);

const recipes = createSlice({
  name: "recipes",
  initialState,
  reducers: {
    reset: (state) => {
      state.data = null;
      state.message = null;
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllrecipes.pending, (state) => {
        state.isLoading = true;
        state.isSuccess = false;
        state.isError = false;
      })
      .addCase(fetchAllrecipes.fulfilled, (state, action) => {
        state.data = action.payload;
        state.message = action.payload.message;
        state.isLoading = false;
        state.isSuccess = true;
        state.isError = false;
        // console.log("payload", action.payload.data.top_recipes);
        state.top_recipes = action.payload.data.top_recipes;
        state.recipes = action.payload.data.recipes;
      })
      .addCase(fetchAllrecipes.rejected, (state, action: any) => {
        console.log("rejeceted", action.payload);
        state.isError = true;
        state.isLoading = false;
        state.isSuccess = false;
        state.data = action?.payload;
        state.message = action?.payload?.message;
      });
  },
});

export const { reset } = recipes.actions;

export default recipes.reducer;
