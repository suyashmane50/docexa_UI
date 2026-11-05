import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { API_V1 } from "../../../utils/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface states {
  data: any | null;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  message: string | null;
  ingredients: string | null;
  steps: string | null;
}

const initialState: states = {
  data: null,
  message: null,
  isLoading: false,
  isSuccess: false,
  isError: false,
  ingredients: null,
  steps: null,
};

export const fetchRecipie = createAsyncThunk(
  "fetchRecipie",
  async (recipie_id: number, thunkApi: any) => {
    try {
      const res: any = await API_V1.get(`nutrition/recipe/${recipie_id}`);
      console.log("recipie data=>", res.data);
      return res.data;
    } catch (error: any) {
      console.log("res=>", error);
      return thunkApi.rejectWithValue(error.response.data);
    } finally {
    }
  }
);

const RecipeSlice = createSlice({
  name: "RecipeSlice",
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
      .addCase(fetchRecipie.pending, (state) => {
        state.isLoading = true;
        state.isSuccess = false;
        state.isError = false;
      })
      .addCase(fetchRecipie.fulfilled, (state, action) => {
        try {
          state.data = action.payload;
          state.message = action.payload.message;
          state.isLoading = false;
          state.isSuccess = true;
          state.isError = false;
          state.ingredients = action.payload?.data?.recipes?.ingredients;
          state.steps = action.payload?.data?.recipes?.steps;
        } catch (error) {
          console.log(error);
        }
      })
      .addCase(fetchRecipie.rejected, (state, action: any) => {
        state.isError = true;
        state.isLoading = false;
        state.isSuccess = false;
        state.data = action.payload;
        state.message = action.payload.message;
      });
  },
});

export const { reset } = RecipeSlice.actions;

export default RecipeSlice.reducer;
