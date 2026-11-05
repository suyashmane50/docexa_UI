# Docexa Patient App - Complete Project Structure Guide

## 📱 Project Overview

This is a **React Native** mobile application built with:
- **Expo** (~54.0.0) - Development platform
- **Expo Router** (~6.0.19) - File-based routing system
- **React Native** (0.81.5) - Mobile framework
- **React** (19.1.0) - UI library
- **Redux Toolkit** - State management
- **TypeScript** - Type safety
- **NativeWind** (TailwindCSS for React Native) - Styling
- **React Native Paper** - UI component library

**App Name:** Docexa Patient App

---

## 🚀 Entry Point & Application Flow

### 1. Application Entry (`package.json`)
```
Main Entry: "expo-router/entry"
```
- Expo Router handles the initial bootstrap
- All routes are automatically discovered from the `app/` directory

### 2. Root Layout (`app/_layout.tsx`)
**Purpose:** Top-level application wrapper that initializes global providers and fonts.

**What happens here:**
1. **Font Loading**: Loads Nunito font family (200-900 weights, regular & italic)
2. **Redux Store Provider**: Wraps app with Redux store (`<StoreProvider>`)
3. **Paper Theme Provider**: Provides React Native Paper theme
4. **Toast Notifications**: Sets up toast notification system
5. **Safe Area Context**: Handles device safe areas (notch, status bar)
6. **Slot Component**: `<Slot />` from expo-router renders child routes

**Key Code:**
```tsx
<StoreProvider>
  <PaperProvider theme={theme}>
    <SafeAreaProvider>
      <Slot />  {/* This renders the matched route */}
    </SafeAreaProvider>
  </PaperProvider>
</StoreProvider>
```

**Additional Setup:**
- **React Native Reanimated**: Imported for animations
- **Expo Updates**: Configured for OTA updates
- **React Native Paper Dates**: Translation registration for date pickers

---

## 🗺️ Routing Architecture

This app uses **Expo Router's file-based routing**. The routing structure follows this hierarchy:

### Routing Hierarchy

```
app/
├── _layout.tsx (Root Layout - Level 1)
├── index.tsx (Landing/Splash Screen)
├── auth.tsx (Authentication Screen)
├── register.tsx (Registration Screen)
├── otp.tsx (OTP Verification Screen)
├── +not-found.tsx (404 Error Page)
├── +html.tsx (HTML wrapper for web)
└── (home)/ (Route Group - Level 2)
    ├── _layout.tsx (Drawer Navigation Layout)
    ├── (tabs)/ (Route Group - Level 3)
    │   ├── _layout.tsx (Tab Navigation Layout)
    │   ├── home/ (Tab 1: Home)
    │   ├── vitals/ (Tab 2: Vitals)
    │   ├── appointments/ (Tab 3: Appointments)
    │   ├── recipe/ (Tab 4: Recipe)
    │   └── more/ (Tab 5: About)
    └── settings/ (Drawer Item: Settings)
```

### Route Groups Explained

1. **`(home)`** - Parentheses indicate a **route group**
   - Groups routes without affecting URL structure
   - Wraps authenticated routes with drawer navigation
   
2. **`(tabs)`** - Another route group
   - Groups tab navigation screens
   - Provides bottom tab bar navigation

---

## 📂 Detailed Route Breakdown

### Level 1: Root Routes

#### `/` - `app/index.tsx`
**Landing/Splash Screen**
- Shows app branding ("Bharat's MCC Diabetes Diet Kit")
- Checks for stored user ID in AsyncStorage
- If authenticated: redirects to `/(home)/(tabs)/appointments`
- If not: shows "Log in or Sign up" button → navigates to `/auth`

**Authentication Flow:**
```tsx
useEffect(() => {
  const value = await AsyncStorage.getItem("id");
  if (value) {
    dispatch(setAuth(value));
    router.push("/(home)/(tabs)/appointments");
  }
}, []);
```

#### `/auth` - `app/auth.tsx`
**Authentication Screen**
- Mobile number input (10 digits)
- Validates mobile number
- Calls `VerifyMobileNumber()` Redux action
- On success → navigates to `/otp`

#### `/otp` - `app/otp.tsx`
**OTP Verification**
- 6-digit OTP input
- Verifies OTP with backend
- On success → navigates to home

#### `/register` - `app/register.tsx`
**User Registration**
- Complete user registration form

---

### Level 2: Home Route Group `(home)`

#### `app/(home)/_layout.tsx`
**Drawer Navigation Layout**

**Purpose:** Provides side drawer navigation for authenticated users

**Features:**
- **Custom Drawer**: Uses `CustomDrawerContent` component
- **Gesture Handler**: Enables swipe-to-open drawer
- **Authentication Check**: Verifies user is logged in
- **Drawer Screens:**
  - `(tabs)` - Main tabs (labeled as "Home" in drawer)
  - `settings` - Settings screen

**Navigation Structure:**
```tsx
<Drawer>
  <Drawer.Screen name="(tabs)" />      // Main app tabs
  <Drawer.Screen name="settings" />    // Settings
</Drawer>
```

**Authentication Guard:**
```tsx
useEffect(() => {
  const value = await AsyncStorage.getItem("id");
  if (!value) {
    router.push("/auth");  // Redirect if not authenticated
  }
}, []);
```

---

### Level 3: Tabs Route Group `(tabs)`

#### `app/(home)/(tabs)/_layout.tsx`
**Bottom Tab Navigation**

**Purpose:** Creates bottom tab bar with 5 main tabs

**Tabs Configuration:**

| Tab | Route | Icon | Label |
|-----|-------|------|-------|
| 1 | `home` | Ionicons "home" | Home |
| 2 | `vitals` | Custom thermometer icon | Vital |
| 3 | `appointments` | Custom plus icon (circular button) | Appointment |
| 4 | `recipe` | Custom calories icon | Recipe |
| 5 | `more` | Dots-horizontal-circle | About |

**Smart Tab Bar Visibility:**
- Tab bar shows/hides based on current route
- Visible on: `/home`, `/vitals`, `/recipe`, `/appointments`, `/more`
- Hidden on: nested routes (e.g., `/recipe/[id]`, `/home/patient/[id]`)

**Code Logic:**
```tsx
const recipePathRegex = /^\/recipe\/.+/;
if (pathname == "/home" || pathname == "/vitals" || ...) {
  setflag(true);  // Show tab bar
} else {
  setflag(false); // Hide tab bar
}
```

---

## 📱 Detailed Screen Routes

### Tab 1: Home (`/(home)/(tabs)/home`)

```
home/
├── _layout.tsx
├── index.tsx (Home Dashboard)
├── appointments/
│   ├── _layout.tsx
│   └── index.tsx (My Appointments List)
├── patient/
│   ├── _layout.tsx
│   ├── [id].tsx (Patient Details - Dynamic Route)
│   └── create.tsx (Create New Patient)
├── report/
│   ├── _layout.tsx
│   └── index.tsx (Medical Reports)
└── rx/
    ├── _layout.tsx
    └── index.tsx (Prescriptions)
```

**Key Routes:**
- `/home` - Main dashboard
- `/home/appointments` - User's appointment list
- `/home/patient/[id]` - View patient details (dynamic ID)
- `/home/patient/create` - Add new patient
- `/home/report` - Medical reports
- `/home/rx` - Prescriptions list

---

### Tab 2: Vitals (`/(home)/(tabs)/vitals`)

```
vitals/
├── _layout.tsx
├── index.tsx (Vitals Dashboard)
├── weight/
│   ├── _layout.tsx
│   ├── index.tsx (Weight Entry)
│   └── wtracker.tsx (Weight Tracker)
├── height/
│   ├── _layout.tsx
│   ├── index.tsx (Height Entry)
│   └── htracker.tsx (Height Tracker)
├── bmi/
│   ├── _layout.tsx
│   └── index.tsx (BMI Calculator)
├── bloodsugar/
│   ├── _layout.tsx
│   ├── index.tsx (Blood Sugar Entry)
│   └── btracker.tsx (Blood Sugar Tracker)
├── fastingbloodsugar/
│   ├── _layout.tsx
│   ├── index.tsx (Fasting Blood Sugar Entry)
│   └── fstracker.tsx (Fasting Blood Sugar Tracker)
└── calorie/
    ├── _layout.tsx
    └── index.tsx (Calorie Tracker)
```

**Purpose:** Track various health vitals for diabetes management

**Features:**
- Weight tracking with history
- Height tracking
- BMI calculation
- Blood sugar monitoring (regular & fasting)
- Calorie tracking

---

### Tab 3: Appointments (`/(home)/(tabs)/appointments`)

```
appointments/
├── _layout.tsx
├── index.tsx (Appointments Main)
└── choose/
    ├── _layout.tsx
    ├── index.tsx (Choose Appointment Type)
    ├── clinic/
    │   ├── _layout.tsx
    │   ├── index.tsx (Select Clinic)
    │   └── create/
    │       ├── _layout.tsx
    │       ├── index.tsx (Create Clinic Appointment)
    │       └── confirm/
    │           ├── _layout.tsx
    │           └── index.tsx (Confirm Appointment)
    └── call/
        ├── _layout.tsx
        └── index.tsx (On-Call Appointment)
```

**Purpose:** Book and manage medical appointments

**Flow:**
1. `/appointments` - Main appointments screen
2. `/appointments/choose` - Choose appointment type (clinic or on-call)
3. `/appointments/choose/clinic` - Select clinic location
4. `/appointments/choose/clinic/create` - Pick date/time slot
5. `/appointments/choose/clinic/create/confirm` - Confirm booking
6. `/appointments/choose/call` - Book on-call appointment

---

### Tab 4: Recipe (`/(home)/(tabs)/recipe`)

```
recipe/
├── _layout.tsx
├── index.tsx (Recipe List)
└── [id].tsx (Recipe Details - Dynamic Route)
```

**Purpose:** Browse diabetes-friendly recipes

**Routes:**
- `/recipe` - List all recipes
- `/recipe/[id]` - View specific recipe details (dynamic ID parameter)

**Example:** `/recipe/123` would load recipe with ID 123

---

### Tab 5: More/About (`/(home)/(tabs)/more`)

```
more/
├── _layout.tsx
└── index.tsx (About/More Information)
```

**Purpose:** App information, about section, additional features

---

### Drawer Item: Settings (`/(home)/settings`)

```
settings/
├── _layout.tsx
└── index.tsx (Settings Screen)
```

**Purpose:** User settings, preferences, logout

**Access:** Via drawer menu (swipe from left)

---

## 🔄 Navigation Flow Diagram

```
App Launch
    │
    ├─→ index.tsx (Landing)
    │      │
    │      ├─→ Check AsyncStorage for "id"
    │      │
    │      ├─→ If authenticated → /(home)/(tabs)/appointments
    │      │
    │      └─→ If not → /auth
    │
    ├─→ /auth (Mobile Number Entry)
    │      │
    │      └─→ On success → /otp
    │
    ├─→ /otp (OTP Verification)
    │      │
    │      └─→ On success → /(home)/(tabs)/appointments
    │
    └─→ /(home) (Authenticated Area)
           │
           ├─→ Drawer Navigation
           │      ├─→ (tabs) - Main App
           │      │      ├─→ home (Tab 1)
           │      │      ├─→ vitals (Tab 2)
           │      │      ├─→ appointments (Tab 3)
           │      │      ├─→ recipe (Tab 4)
           │      │      └─→ more (Tab 5)
           │      │
           │      └─→ settings (Drawer Item)
           │
           └─→ Bottom Tab Bar (for (tabs) routes)
```

---

## 🗄️ State Management (Redux)

### Store Structure (`store/index.ts`)

**Redux Store Configuration:**
```typescript
Store Reducers:
├── user (UserSlice) - User profile information
├── auth (authSlice) - Authentication state
├── register (registerSlice) - Registration state
├── otp (otpSlice) - OTP verification state
├── recipes (Recipies) - Recipe list
├── recipeSlice - Individual recipe details
├── vital (VitalSlice) - General vitals state
├── weight (weightSlice) - Weight data
├── postweight (postWeightSlice) - Post weight action
├── height (heightSlice) - Height data
├── postheight (postHeightSlice) - Post height action
├── bmi (bmiSlice) - BMI calculations
├── bloodsugar (bloodSugarSlice) - Blood sugar data
├── postbloodsugar (postBloodSugarSlice) - Post blood sugar action
├── fastingbloodsugar (fastingbloodsugarSlice) - Fasting blood sugar data
├── postfastingbloodsugar (postFastingBloodSugarSlice) - Post fasting blood sugar action
├── calorie (CalorieSlice) - Calorie tracking
├── appointment (AppointmentSlice) - Appointment state
├── getAppointment (FetchAppointmentSlice) - Fetch appointments
├── postappointment (PostAppointmentSlice) - Create appointment
├── clinics (ClinicSelectSlice) - Clinic selection
├── clinicSlot (ClinicSlotSlice) - Available slots
├── patients (getPatientSlice) - Patient data
├── addPatient (AddPatientSlice) - Add patient action
├── getoncallslot (FetchOnCallSlotSlice) - On-call slots
├── postoncallslot (PostOnCallSlotSlice) - Create on-call appointment
├── getReports (FetchReportsSlice) - Fetch medical reports
├── FetchCallsForBoth (CallsSlice) - Fetch call appointments
└── getpatient (getPatientByIdSlice) - Get patient by ID
```

### Store Provider (`store/StoreProvider.tsx`)

Wraps the entire app and provides Redux store to all components:
```tsx
<Provider store={storeRef.current}>
  {children}
</Provider>
```

---

## 🔌 API Configuration

### API Endpoints (`utils/api.ts`)

**Three API instances:**

1. **`API`** - Main API
   - Base URL: `https://sugarsteady.docexa.com/api/`

2. **`API_V1_public`** - Public API v1
   - Base URL: `https://sugarsteady.docexa.com/public/api/v1/`

3. **`API_V1`** - Authenticated API v1
   - Base URL: `https://sugarsteady.docexa.com/api/v1/`

---

## 📁 Project Directory Structure

```
docexa-patient-app/
├── app/                          # Expo Router routes (file-based routing)
│   ├── _layout.tsx              # Root layout (fonts, providers)
│   ├── index.tsx                # Landing/splash screen
│   ├── auth.tsx                 # Authentication
│   ├── otp.tsx                  # OTP verification
│   ├── register.tsx             # Registration
│   ├── +not-found.tsx           # 404 page
│   ├── +html.tsx                # HTML wrapper (web)
│   └── (home)/                  # Authenticated routes group
│       ├── _layout.tsx          # Drawer navigation
│       ├── (tabs)/              # Tab navigation group
│       │   ├── _layout.tsx      # Tab bar layout
│       │   ├── home/            # Home tab
│       │   ├── vitals/          # Vitals tab
│       │   ├── appointments/    # Appointments tab
│       │   ├── recipe/          # Recipe tab
│       │   └── more/            # More/About tab
│       └── settings/            # Settings (drawer item)
│
├── assets/                      # Static assets
│   ├── fonts/                   # Custom fonts
│   ├── icons/                   # App icons
│   ├── images/                  # Images & graphics
│   │   ├── screens/             # Screen-specific images
│   │   └── animations/          # Animation files
│   └── lottie/                  # Lottie animations
│
├── components/                  # Reusable components
│   ├── navigation/              # Navigation components
│   │   ├── CustomDrawerContent.tsx
│   │   ├── TabBarButton.tsx
│   │   └── TabBarIcon.tsx
│   ├── Recipe/                  # Recipe-specific components
│   │   ├── Ingredients.tsx
│   │   ├── Steps.tsx
│   │   └── TopBar.tsx
│   ├── Divider.tsx
│   ├── DrawerSceneWrapper.tsx
│   ├── Loading.tsx
│   ├── NoDataFound.tsx
│   ├── Recipies.tsx
│   ├── RecipiesLoading.tsx
│   ├── RulerPick.tsx
│   ├── RulerPicker.tsx
│   ├── TabBar.tsx
│   └── TabBarButton.tsx
│
├── store/                       # Redux store
│   ├── index.ts                 # Store configuration
│   ├── StoreProvider.tsx        # Store provider component
│   ├── auth/                    # Authentication reducers
│   │   ├── authReducer.ts
│   │   ├── otpReducer.ts
│   │   ├── registerReducer.ts
│   │   └── UserSlice.ts
│   └── features/                # Feature-specific slices
│       ├── appointments/        # Appointment management
│       │   ├── AppointmentSlice.ts
│       │   ├── ClinicSelectSlice.ts
│       │   ├── ClinicSlotSlice.ts
│       │   ├── FetchAppointmentSlice.ts
│       │   ├── PostAppointmentSlice.ts
│       │   ├── oncall/          # On-call appointments
│       │   │   ├── CallsSlice.ts
│       │   │   ├── FetchOnCallSlotSlice.ts
│       │   │   └── PostOnCallSlotSlice.ts
│       │   └── patient/         # Patient management
│       │       ├── AddPatientSlice.ts
│       │       ├── getPatientByIdSlice.ts
│       │       └── getPatientSlice.ts
│       ├── recipie/             # Recipe management
│       │   ├── RecipeSlice.ts
│       │   └── Recipies.ts
│       ├── reports/             # Medical reports
│       │   └── FetchReportsSlice.ts
│       └── vitals/              # Vitals tracking
│           ├── VitalSlice.ts
│           ├── bloodsugar/
│           │   ├── bloodSugarSlice.ts
│           │   └── postBloodSugarSlice.ts
│           ├── bmi/
│           │   └── bmiSlice.ts
│           ├── calorie/
│           │   └── CalorieSlice.ts
│           ├── fastingbloodsugar/
│           │   ├── fastingbloodsugarSlice.ts
│           │   └── postFastingBloodSugarSlice.ts
│           ├── height/
│           │   ├── heightSlice.ts
│           │   └── postHeightSlice.ts
│           └── weight/
│               ├── postWeightSlice.ts
│               └── weightSlice.ts
│
├── utils/                       # Utility functions
│   ├── api.ts                   # API configuration
│   ├── common.ts                # Common utilities
│   └── theme.ts                 # Theme configuration
│
├── package.json                 # Dependencies & scripts
├── app.json                     # Expo configuration
├── tsconfig.json                # TypeScript configuration
├── tailwind.config.js           # TailwindCSS config
├── babel.config.js              # Babel configuration
├── metro.config.js              # Metro bundler config
└── global.css                   # Global styles
```

---

## 🎯 Key Routing Features

### 1. Dynamic Routes
- `[id].tsx` - Dynamic route parameters
  - Example: `/recipe/[id].tsx` → `/recipe/123`
  - Access via `useLocalSearchParams()` or `useGlobalSearchParams()`

### 2. Route Groups
- `(home)` - Groups authenticated routes (doesn't appear in URL)
- `(tabs)` - Groups tab navigation (doesn't appear in URL)

### 3. Layout Files
- Every directory can have `_layout.tsx`
- Provides nested navigation (Stack, Tabs, Drawer)
- Shares UI across child routes

### 4. Navigation Methods

**Expo Router Navigation:**
```tsx
import { router } from 'expo-router';

// Navigate
router.push('/home');

// Replace (no back button)
router.push('/auth');

// Go back
router.back();

// Get params
const { id } = useLocalSearchParams();
```

---

## 🔐 Authentication Flow

1. **App Launch** (`index.tsx`)
   - Checks `AsyncStorage.getItem("id")`
   - If exists → Auto-login to appointments
   - If not → Show landing page

2. **Landing Page** → User clicks "Log in or Sign up"
   - Navigates to `/auth`

3. **Authentication** (`auth.tsx`)
   - User enters mobile number (10 digits)
   - Calls `VerifyMobileNumber()` action
   - On success → Navigates to `/otp`

4. **OTP Verification** (`otp.tsx`)
   - User enters 6-digit OTP
   - Verifies with backend
   - On success → Stores user ID in AsyncStorage
   - Navigates to `/(home)/(tabs)/appointments`

5. **Protected Routes** (`(home)/_layout.tsx`)
   - Checks authentication on mount
   - If not authenticated → Redirects to `/auth`

---

## 🎨 Styling Approach

1. **NativeWind** (TailwindCSS for React Native)
   - Utility-first CSS classes
   - Configured in `tailwind.config.js`

2. **React Native Paper**
   - Material Design components
   - Theme configured in `utils/theme.ts`
   - Wrapped in `PaperProvider` in root layout

3. **StyleSheet API**
   - Traditional React Native styling
   - Used in some components

4. **Global Styles**
   - `global.css` imported in root layout

---

## 📦 Key Dependencies

### Navigation
- `expo-router` - File-based routing
- `@react-navigation/native` - Navigation primitives
- `@react-navigation/drawer` - Drawer navigation
- `@react-navigation/material-bottom-tabs` - Tab navigation

### State Management
- `@reduxjs/toolkit` - Redux toolkit
- `react-redux` - React bindings
- `redux-thunk` - Async actions

### UI/UX
- `react-native-paper` - Material components
- `nativewind` - TailwindCSS
- `lottie-react-native` - Animations
- `react-native-chart-kit` - Charts
- `@gorhom/bottom-sheet` (v5.2.8) - Bottom sheet modals
- `react-native-alert-notification` - Toast notifications
- `react-native-reanimated` (v4.1.1) - Animations

### Utilities
- `axios` - HTTP client
- `@react-native-async-storage/async-storage` - Local storage
- `expo-secure-store` - Secure storage
- `expo-clipboard` - Clipboard operations
- `date-fns` - Date manipulation
- `expo-speech` - Text-to-speech
- `expo-linking` - Deep linking

---

## 🚦 How Routing Works Step-by-Step

1. **App Starts** → Expo Router entry point (`expo-router/entry`)

2. **Route Matching** → Expo Router scans `app/` directory

3. **Layout Hierarchy** → Builds layout stack:
   - `app/_layout.tsx` (Root) → Wraps everything
   - `app/(home)/_layout.tsx` (Drawer) → Wraps authenticated routes
   - `app/(home)/(tabs)/_layout.tsx` (Tabs) → Wraps tab screens

4. **Screen Rendering** → Matches URL to file path:
   - `/home` → `app/(home)/(tabs)/home/index.tsx`
   - `/recipe/123` → `app/(home)/(tabs)/recipe/[id].tsx` (with id="123")

5. **Navigation** → Uses Expo Router's navigation:
   - `router.push()` - Adds to stack
   - `router.push()` - Replaces current
   - `router.back()` - Goes back

---

## 🔍 Route Examples

| URL Path | File Path | Description |
|----------|-----------|-------------|
| `/` | `app/index.tsx` | Landing page |
| `/auth` | `app/auth.tsx` | Authentication |
| `/otp` | `app/otp.tsx` | OTP verification |
| `/home` | `app/(home)/(tabs)/home/index.tsx` | Home tab |
| `/vitals` | `app/(home)/(tabs)/vitals/index.tsx` | Vitals tab |
| `/appointments` | `app/(home)/(tabs)/appointments/index.tsx` | Appointments tab |
| `/recipe` | `app/(home)/(tabs)/recipe/index.tsx` | Recipe list |
| `/recipe/123` | `app/(home)/(tabs)/recipe/[id].tsx` | Recipe details (id=123) |
| `/home/patient/create` | `app/(home)/(tabs)/home/patient/create.tsx` | Create patient |
| `/home/patient/456` | `app/(home)/(tabs)/home/patient/[id].tsx` | Patient details (id=456) |
| `/vitals/weight` | `app/(home)/(tabs)/vitals/weight/index.tsx` | Weight entry |
| `/settings` | `app/(home)/settings/index.tsx` | Settings (drawer) |

**Note:** Route groups `(home)` and `(tabs)` don't appear in URLs!

---

## ✅ Summary

This app uses **file-based routing** where:
- ✅ File structure = Route structure
- ✅ `_layout.tsx` = Navigation wrapper
- ✅ `index.tsx` = Default route for folder
- ✅ `[id].tsx` = Dynamic route parameter
- ✅ `(name)` = Route group (doesn't affect URL)
- ✅ Nested folders = Nested routes

The routing system provides:
- **Drawer Navigation** for authenticated users
- **Tab Navigation** for main app sections
- **Stack Navigation** for nested screens
- **Dynamic Routes** for parameterized URLs
- **Authentication Guards** at layout level

---

---

## 📝 Recent Updates & Changes

### Version Updates (as of December 2025)
- **Expo SDK**: Updated from ~51.0.39 to ~54.0.0
- **Expo Router**: Updated from ~3.5.24 to ~6.0.19
- **React Native**: Updated from 0.74.5 to 0.81.5
- **React**: Updated to 19.1.0
- **@gorhom/bottom-sheet**: Updated to v5.2.8 (compatible with Reanimated v4)

### Code Fixes Applied
1. **Replaced `react-toastify`** with `react-native-alert-notification` for native compatibility
2. **Fixed VirtualizedList nesting warnings** by removing ScrollView wrappers from FlatList components
3. **Updated BottomSheet** to v5.x for Reanimated v4 compatibility
4. **Replaced material-top-tabs** with custom tab switcher in Recipe TopBar component
5. **Added expo-clipboard** for native clipboard operations

### Component Structure Updates
- Recipe TopBar now uses custom button-based tabs instead of `@react-navigation/material-top-tabs`
- All appointment screens now use FlatList as primary scrollable component
- Report screen restructured to avoid ScrollView/FlatList nesting

---

*Generated for: Docexa Patient App*
*Last Updated: December 2025*