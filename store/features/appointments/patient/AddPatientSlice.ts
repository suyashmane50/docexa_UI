import { API_V1, DOCEXA_PATIENT_HOST, localHost } from "@/utils/api";
import { RootState } from "@/store";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

interface states {
    data: any | null;
    isLoading: boolean;
    isSuccess: boolean;
    isError: boolean;
    message: string | null;
    firstname: string;
    firstNameError: boolean;
    lastname: string;
    lastNameError: boolean;
    gender: number | null;
    genderError: boolean;
    dob: string | null;
    dobError: boolean;
    formValid: boolean;
}

const initialState: states = {
    data: null,
    message: null,
    isLoading: false,
    isSuccess: false,
    isError: false,
    firstname: '',
    firstNameError: false,
    lastname: '',
    lastNameError: false,
    gender: null,
    genderError: false,
    dob: null,
    dobError: false,
    formValid: false
};

export const AddPatient = createAsyncThunk(
    "addpatient",
    async (body: any, thunkApi: any) => {
        try {
            console.log("body in function : ", body);

            const state = thunkApi.getState() as RootState;
            const config = {
                headers: {
                    "App-id": state.auth.app_id,
                    "User-id": state.auth.userId,
                    "Content-Type": "application/json",
                },
            };
            console.log("call local");

            // const res: any = await localHost.post(`patient/dashboard/add_family`, body, config);
            const res: any = await DOCEXA_PATIENT_HOST.post(`patient/dashboard/add_family`, body, config);
            console.log("response: ", res.data);

            return res.data;

        } catch (error: any) {
            console.log("res=>", error);
            return thunkApi.rejectWithValue(error.response.data);
        } finally {
        }
    }
);

const AddPatientSlice = createSlice({
    name: "addPatient",
    initialState,
    reducers: {
        resetPatient: (state) => {
            state.data = null;
            state.message = null;
            state.isLoading = false;
            state.isSuccess = false;
            state.isError = false;
            state.firstname = '';
            state.firstNameError = false;
            state.lastname = '';
            state.lastNameError = false;
            state.gender = null;
            state.genderError = false;
            state.dob = null;
            state.dobError = false;
            state.formValid = false
        },
        setGender: (state, action: PayloadAction<number>) => {
            console.log("action", action.payload);
            state.gender = action.payload;
            state.genderError = false;
        },
        setFirstName: (state, action: PayloadAction<string>) => {
            const filteredText: string = action.payload?.replace(/[^a-zA-Z\s]/g, "");
            state.firstname = filteredText;
            if (state.firstname?.length <= 1) {
                state.firstNameError = true;
            } else {
                state.firstNameError = false;
            }
            state.firstname = action.payload;
        },
        setLastName: (state, action: PayloadAction<string>) => {
            const filteredText: string = action.payload?.replace(/[^a-zA-Z\s]/g, "");
            state.lastname = filteredText;
            if (state.lastname?.length <= 1) {
                state.lastNameError = true;
            } else {
                state.lastNameError = false;
            }
            state.lastname = action.payload;
        },
        setDob: (state, action: PayloadAction<string>) => {
            console.log("dob:", action.payload, typeof action.payload);
            state.dob = action.payload;
            state.dobError = false;
        },
        setFormValid: (state) => {
            if (state.gender == null) state.genderError = true;
            else state.genderError = false;

            if (state.firstname?.length <= 1) state.firstNameError = true;
            else state.firstNameError = false;

            if (state.lastname?.length <= 1) state.lastNameError = true;
            else state.lastNameError = false;

            if (state.dob == null) state.dobError = true;
            else state.dobError = false;

            if (state.genderError ||
                state.firstNameError ||
                state.lastNameError ||
                state.dobError) {
                state.formValid = false;
            } else {
                state.formValid = true;
            }

            console.log({
                firstname: state.firstname,
                lastname: state.lastname,
                gender: state.gender,
                dob: state.dob,
            })
        },
        resetFormValid: (state) => {
            state.formValid = false;
        },

    },
    extraReducers: (builder) => {
        builder
            .addCase(AddPatient.pending, (state) => {
                state.isLoading = true;
                state.isSuccess = false;
                state.isError = false;
            })
            .addCase(AddPatient.fulfilled, (state, action) => {
                state.data = action.payload.patients;
                state.message = action.payload.message;
                state.isLoading = false;
                state.isSuccess = true;
                state.isError = false;

            })
            .addCase(AddPatient.rejected, (state, action: any) => {
                state.isError = true;
                state.isLoading = false;
                state.isSuccess = false;
                state.data = action.payload;
                state.message = action.payload.message;
            });
    },
});

export const { resetPatient, setFirstName, setLastName, setGender, setDob, setFormValid, resetFormValid } = AddPatientSlice.actions;

export default AddPatientSlice.reducer;
