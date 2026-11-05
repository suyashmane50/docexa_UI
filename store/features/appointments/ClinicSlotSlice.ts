import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { DOCEXA_PATIENT_HOST } from "../../../utils/api";
import { RootState } from "@/store";

/* =======================
   TYPES
======================= */

interface DaySlot {
    id: number | null;
    day_id: number | null;
    start_time: string | null;
    end_time: string | null;
    morningSlots: string[];
    afternoonSlots: string[];
    eveningSlots: string[];
}

interface ClinicSlotState {
    datats: DaySlot[] | null;
    doctorInfo: any;
    clinicInfo: any;
    isLoading: boolean;
    isSuccess: boolean;
    isError: boolean;
    message: string | null;
}

/* =======================
   INITIAL STATE
======================= */

const initialState: ClinicSlotState = {
    datats: null,
    doctorInfo: null,
    clinicInfo: null,
    isLoading: false,
    isSuccess: false,
    isError: false,
    message: null,
};

/* =======================
   THUNK
======================= */

const getHourFromSlot = (slot: string): number => {
    const timePart = slot.split(" ")[0]; // 02:30
    let [hour, minute] = timePart.split(":").map(Number);

    if (slot.includes("PM") && hour !== 12) hour += 12;
    if (slot.includes("AM") && hour === 12) hour = 0;

    return hour;
};
export const getSlot = createAsyncThunk(
    "clinicSlot/getSlot",
    async (
        param: { doctor_id: number; clinic_id: number },
        thunkApi
    ) => {
        try {
            const state = thunkApi.getState() as RootState;

            const config = {
                headers: {
                    "App-id": state.auth.app_id,
                    "User-id": state.auth.userId,
                    "Content-Type": "application/json",
                },
            };

            const res: any = await DOCEXA_PATIENT_HOST.get(
                `patient/dashboard/slots/${param.doctor_id}/${param.clinic_id}`,
                config
            );

            console.log("Slot Data =>", res.data);
            return res.data;
        } catch (error: any) {
            return thunkApi.rejectWithValue(
                error?.response?.data ?? { message: "API Error" }
            );
        }
    }
);



/* =======================
   SLICE
======================= */
const getTodayDayId = () => {
    const jsDay = new Date().getDay(); // 0 = Sunday
    return jsDay === 0 ? 7 : jsDay;    // 1–7 (Mon–Sun)
};


const ClinicSlotSlice = createSlice({
    name: "clinicSlot",
    initialState,
    reducers: {
        resetClinicSlot: (state) => {
            state.datats = null;
            state.doctorInfo = null;
            state.clinicInfo = null;
            state.isLoading = false;
            state.isSuccess = false;
            state.isError = false;
            state.message = null;
        },
    },
    extraReducers: (builder) => {
        builder

            /* -------- pending -------- */
            .addCase(getSlot.pending, (state) => {
                state.isLoading = true;
                state.isSuccess = false;
                state.isError = false;
            })

            /* -------- fulfilled -------- */
            .addCase(getSlot.fulfilled, (state, action) => {
                const rawDatats = action.payload?.datats ?? [];

                // Today's day_id (Mon=1 ... Sun=7)
                const jsDay = new Date().getDay();
                const todayDayId = jsDay === 0 ? 7 : jsDay;

                // Find today's slot entry
                const slotItem =
                    rawDatats.find(
                        (item: any) =>
                            item.day_id === todayDayId &&
                            Array.isArray(item.slot) &&
                            item.slot.length > 0
                    ) ?? null;

                if (slotItem) {
                    const allSlots: string[] = slotItem.slot;

                    // Split slots into morning / afternoon / evening
                    const morningSlots = allSlots.filter((s) => {
                        const hour = getHourFromSlot(s);
                        return hour < 12;
                    });

                    const afternoonSlots = allSlots.filter((s) => {
                        const hour = getHourFromSlot(s);
                        return hour >= 12 && hour < 17;
                    });

                    const eveningSlots = allSlots.filter((s) => {
                        const hour = getHourFromSlot(s);
                        return hour >= 17;
                    });

                    state.datats = [
                        {
                            id: slotItem.id,
                            day_id: slotItem.day_id,
                            start_time: slotItem.start_time,
                            end_time: slotItem.end_time,
                            morningSlots,
                            afternoonSlots,
                            eveningSlots,
                        },
                    ];
                } else {
                    // 👇 IMPORTANT: explicit "no slots today"
                    state.datats = [];
                }

                state.doctorInfo = action.payload?.doctor ?? null;
                state.clinicInfo = action.payload?.clinic ?? null;

                state.isLoading = false;
                state.isSuccess = true;
                state.isError = false;
            })






            /* -------- rejected -------- */
            .addCase(getSlot.rejected, (state, action: any) => {
                state.isLoading = false;
                state.isSuccess = false;
                state.isError = true;

                state.datats = null;
                state.doctorInfo = null;
                state.clinicInfo = null;
                state.message =
                    action.payload?.message ?? "Something went wrong";
            });
    },
});

/* =======================
   EXPORTS
======================= */

export const { resetClinicSlot } = ClinicSlotSlice.actions;
export default ClinicSlotSlice.reducer;
