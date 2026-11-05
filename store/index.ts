import { configureStore } from "@reduxjs/toolkit";
import Recipies from "./features/recipie/Recipies";
import RecipeSlice from "./features/recipie/RecipeSlice";
import weightSlice from "./features/vitals/weight/weightSlice";
import heightSlice from "./features/vitals/height/heightSlice";
import bmiSlice from "./features/vitals/bmi/bmiSlice";
import bloodSugarSlice from "./features/vitals/bloodsugar/bloodSugarSlice";
import fastingbloodsugarSlice from "./features/vitals/fastingbloodsugar/fastingbloodsugarSlice";
import postWeightSlice from "./features/vitals/weight/postWeightSlice";
import postHeightSlice from "./features/vitals/height/postHeightSlice";
import postBloodSugarSlice from "./features/vitals/bloodsugar/postBloodSugarSlice";
import postFastingBloodSugar from "./features/vitals/fastingbloodsugar/postFastingBloodSugarSlice";
import CalorieSlice from "./features/vitals/calorie/CalorieSlice";
import authSlice from "./auth/authReducer";
import otpSlice from "./auth/otpReducer";
import registerSlice from "./auth/registerReducer";
import AppointmentSlice from "./features/appointments/AppointmentSlice";
import ClinicSelectSlice from "./features/appointments/ClinicSelectSlice";
import PostAppointmentSlice from "./features/appointments/PostAppointmentSlice";
import getPatientSlice from "./features/appointments/patient/getPatientSlice";
import ClinicSlotSlice from "./features/appointments/ClinicSlotSlice";
import VitalSlice from "./features/vitals/VitalSlice";
import FetchAppointmentSlice from './features/appointments/FetchAppointmentSlice';
import AddPatientSlice from './features/appointments/patient/AddPatientSlice';
import FetchOnCallSlotSlice from './features/appointments/oncall/FetchOnCallSlotSlice';
import PostOnCallAppointmentSlice from './features/appointments/oncall/PostOnCallSlotSlice';
import UserSlice from "./auth/UserSlice";
import FetchReportsSlice from "./features/reports/FetchReportsSlice";
import CallsSlice from "./features/appointments/oncall/CallsSlice";
import getPatientByIdSlice from './features/appointments/patient/getPatientByIdSlice';
import vitalsSlice from './features/appointments/VitalsSlice';
import symptomSlice from './features/appointments/SymptomSlice';

export const makeStore = () => {
  return configureStore({
    reducer: {
      user: UserSlice,
      register: registerSlice,
      auth: authSlice,
      otp: otpSlice,
      recipes: Recipies,
      recipeSlice: RecipeSlice,
      vital: VitalSlice,
      weight: weightSlice,
      postweight: postWeightSlice,
      height: heightSlice,
      postheight: postHeightSlice,
      bmi: bmiSlice,
      bloodsugar: bloodSugarSlice,
      postbloodsugar: postBloodSugarSlice,
      fastingbloodsugar: fastingbloodsugarSlice,
      postfastingbloodsugar: postFastingBloodSugar,
      calorie: CalorieSlice,
      appointment: AppointmentSlice,
      getAppointment: FetchAppointmentSlice,
      postappointment: PostAppointmentSlice,
      clinics: ClinicSelectSlice,
      clinicSlot: ClinicSlotSlice,
      patients: getPatientSlice,
      addPatient: AddPatientSlice,
      getoncallslot: FetchOnCallSlotSlice,
      postoncallslot: PostOnCallAppointmentSlice,
      getReports: FetchReportsSlice,
      FetchCallsForBoth: CallsSlice,
      getpatient: getPatientByIdSlice,
      vitalsMaster: vitalsSlice,
      symptomsMaster: symptomSlice,

    },
  });
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
