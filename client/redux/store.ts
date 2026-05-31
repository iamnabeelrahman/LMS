"use client";
import { configureStore } from "@reduxjs/toolkit";
import { apiSlice } from "./features/service/apiSlice";
import authReducer, { restoreSession } from "./features/auth/authSlice";

export const store = configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer,
    auth: authReducer,
  },
  devTools: process.env.NODE_ENV !== "production",
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),
});



export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

const initialiseAuthState = async () => {
  await store.dispatch(
    apiSlice.endpoints.refreshToken.initiate({}, { forceRefetch: true }),
  );

  const token =
    localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
  const user = localStorage.getItem("user") || sessionStorage.getItem("user");
  if (token && user) {
    return { user: JSON.parse(user), accessToken: token };
  } else {
    return { user: null, accessToken: null };
  }
};
initialiseAuthState();

// Auto-restore session from localStorage
const token =
  typeof window !== "undefined"
    ? localStorage.getItem("authToken") || sessionStorage.getItem("authToken")
    : null;
const userStr =
  typeof window !== "undefined"
    ? localStorage.getItem("user") || sessionStorage.getItem("user")
    : null;

if (token && userStr && typeof window !== "undefined") {
  try {
    const user = JSON.parse(userStr);
  } catch (error) {
    console.error("Failed to restore session:", error);
  }
}
