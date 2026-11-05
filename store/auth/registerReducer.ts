import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { API_V1 } from "../../utils/api";

interface state {
  showCalender: boolean;
  isSuccess: boolean;
  isLoading: boolean;
  isError: boolean;
  data: any;
  message: string | null;
  name: string;
  nameError: boolean;
  date: {
    value: Date | null;
  };
  dateError: boolean;
  dob: string | null;
}

const initialState: state = {
  showCalender: false,
  isSuccess: false,
  isLoading: false,
  isError: false,
  message: null,
  data: null,
  name: "",
  nameError: false,
  date: {
    value: null,
  },
  dateError: false,
  dob: null,
};

export const PostRegister = createAsyncThunk(
  "PostRegister",
  async (
    body: {
      mobile: number | string;
      name: string;
      dob: string;
    },
    thunkApi: any
  ) => {
    try {
      console.log("body", body);
      const res: any = await API_V1.post(`register`, body);
      console.log("res=>", res.data);
      return res.data;
    } catch (error: any) {
      console.log("res=>", error);
      return thunkApi.rejectWithValue(error.response.data);
    }
  }
);

export const registerSlice = createSlice({
  name: "registerslice",
  initialState,
  reducers: {
    setShowCalender: (state, action: PayloadAction<boolean>) => {
      state.showCalender = action.payload;
    },
    setDate: (state, action: PayloadAction<string>) => {
      console.log("action.payload", action.payload);
      state.dob = action.payload;
      state.dateError = false;
    },
    setName: (state, action: PayloadAction<string>) => {
      const filteredText: string = action.payload?.replace(/[^a-zA-Z\s]/g, "");
      state.name = filteredText;
      if (state.name?.length > 4) {
        state.nameError = false;
      }
    },
    setDateError: (state, action: PayloadAction<boolean>) => {
      console.log("action", action.payload);
      state.dateError = action.payload;
    },
    setNameError: (state, action: PayloadAction<boolean>) => {
      state.nameError = action.payload;
    },
    resetRegister: (state) => {
      state.isSuccess = false;
      state.isLoading = false;
      state.isError = false;
      state.message = null;
      state.data = null;
      state.name = "";
      state.nameError = false;
      (state.date = {
        value: null,
      }),
        (state.dateError = false);
      state.dob = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(PostRegister.pending, (state) => {
        state.isLoading = true;
        state.isSuccess = false;
        state.isError = false;
      })
      .addCase(PostRegister.fulfilled, (state, action) => {
        console.log(action.payload);
        state.isSuccess = true;
        state.isLoading = false;
        state.isError = false;
        state.data = action.payload;
        state.message = action.payload.message;
      })
      .addCase(PostRegister.rejected, (state, action: any) => {
        console.log(action);
        state.isError = true;
        state.isLoading = false;
        state.isSuccess = false;
        state.data = action.payload;
        state.message = action.payload.message;
      });
  },
});

export const { setShowCalender, setDate, setName, setDateError, setNameError, resetRegister } =
  registerSlice.actions;

export default registerSlice.reducer;
