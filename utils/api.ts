import axios from "axios";

export const API = axios.create({
  baseURL: "https://sugarsteady.docexa.com/api/",
});

export const API_V1_public = axios.create({
  baseURL: "https://sugarsteady.docexa.com/public/api/v1/",
});

export const API_V1 = axios.create({
  baseURL: "https://sugarsteady.docexa.com/api/v1/",
});

//VIMP ---T w
// export const DOCEXA_PATIENT_HOST = axios.create({
//   baseURL: "https://api-staging.docexa.com/api/v4/",
// });

// export const DOCEXA_PATIENT_HOST_SSE = "https://api-staging.docexa.com/api/v4/";

// export const DOCEXA_PATIENT_HOST_V3_WEB = axios.create({
//   baseURL: "https://api-staging.docexa.com/api/v3/",
// });

//VIMP ---B

// ! -- Test purpose, converted to staging to local -- (T)

export const localHost = axios.create({
  baseURL: "http://localhost:8001/api/v4/",
});
export const localMobile = axios.create({
  baseURL: "http://127.0.0.1:8001/api/v4/",
});


export const DOCEXA_PATIENT_HOST_SSE_2 = "http://127.0.0.1:8001/api/v4/";




//abha apis
export const ABHA = axios.create({
  baseURL: "http://127.0.0.1:8000/api/v3/",
});


//only for testing purpose, to be removed later

export const DOCEXA_PATIENT_HOST = axios.create({
  baseURL: "http://localhost:8001/api/v4/",
});

export const DOCEXA_PATIENT_HOST_SSE = "http://localhost:8001/api/v4/";

export const DOCEXA_PATIENT_HOST_V3_WEB = axios.create({
  baseURL: "http://localhost:8001/api/v3/",
});
