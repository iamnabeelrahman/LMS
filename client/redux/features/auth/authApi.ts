import { apiSlice } from "../service/apiSlice";
import {
  User,
  loginSuccess,
  logout,
  loginStart,
  loginFailure,
} from "./authSlice";

// Response Types
type LoginResponse = {
  success: boolean;
  message: string;
  data?: {
    user: User;
    accessToken: string;
    organizations?: Array<{
      id: string;
      name: string;
      role: string;
    }>;
  };
};

type RegisterResponse = {
  success: boolean;
  message: string;
  data?: {
    user: User;
    accessToken?: string;
  };
};

type VerifyOtpResponse = {
  success: boolean;
  message: string;
};

type RefreshTokenResponse = {
  success: boolean;
  data?: {
    accessToken: string;
  };
};

// Request Types
type LoginData = {
  email: string;
  password: string;
  rememberMe: boolean;
};

type RegistrationData = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: string;
  phoneNumber?: string;
  age?: number;
  organizationName?: string;
  avatar?: string;
};

type VerifyOtpData = {
  email: string;
  code: string;
};

export const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Login mutation
    login: builder.mutation<LoginResponse, LoginData>({
      query: (data) => ({
        url: "/auth/login",
        method: "POST",
        body: data,
        credentials: "include" as const,
      }),
      async onQueryStarted(arg, { queryFulfilled, dispatch }) {
        dispatch(loginStart());
        try {
          const { data } = await queryFulfilled;
          if (data.success && data.data) {
            const { user, accessToken } = data.data;

            // Store token based on remember me preference
            if (arg.rememberMe) {
              localStorage.setItem("authToken", accessToken);
              localStorage.setItem("user", JSON.stringify(user));
            } else {
              sessionStorage.setItem("authToken", accessToken);
              sessionStorage.setItem("user", JSON.stringify(user));
            }

            dispatch(loginSuccess({ user, accessToken }));
          } else {
            dispatch(loginFailure(data.message || "Login failed"));
          }
        } catch (error: any) {
          dispatch(loginFailure(error?.data?.message || "Login failed"));
          console.error("Login failed:", error);
        }
      },
    }),

    // Register mutation
    registerUser: builder.mutation<RegisterResponse, RegistrationData>({
      query: (data) => {
        // Determine endpoint based on role
        let url = "/auth/register";
        if (data.role === "admin") url = "/auth/register/school";
        else if (data.role === "owner") url = "/auth/register/coaching";
        else if (data.role === "teacher")
          url = "/auth/register/teacher-academy";

        return {
          url,
          method: "POST",
          body: data,
        };
      },
    }),

    // Verify OTP mutation
    verifyEmail: builder.mutation<VerifyOtpResponse, VerifyOtpData>({
      query: (data) => ({
        url: "/auth/verify-email",
        method: "POST",
        body: data,
        credentials: "include" as const,
      }),
    }),

    // Resend OTP mutation (using register endpoint)
    resendOtp: builder.mutation<RegisterResponse, RegistrationData>({
      query: (data) => {
        let url = "/auth/register";
        if (data.role === "admin") url = "/auth/register/school";
        else if (data.role === "owner") url = "/auth/register/coaching";
        else if (data.role === "teacher")
          url = "/auth/register/teacher-academy";

        return {
          url,
          method: "POST",
          body: data,
        };
      },
    }),

    // Refresh token mutation
    refreshToken: builder.mutation<RefreshTokenResponse, void>({
      query: () => ({
        url: "/auth/refresh",
        method: "POST",
        credentials: "include" as const,
      }),
      async onQueryStarted(arg, { queryFulfilled, dispatch }) {
        try {
          const { data } = await queryFulfilled;

          if (data.success && data.data?.accessToken) {
            dispatch(
              loginSuccess({
                user: JSON.parse(localStorage.getItem("user") || "null"),
                accessToken: data.data.accessToken,
              }),
            );
          }
        } catch (err) {
          dispatch(logout());
        }
      },
    }),

    // Logout mutation
    logout: builder.mutation<void, void>({
      query: () => ({
        url: "/auth/logout",
        method: "POST",
        credentials: "include" as const,
      }),
      async onQueryStarted(arg, { dispatch }) {
        // Clear storage
        localStorage.removeItem("authToken");
        localStorage.removeItem("user");
        sessionStorage.removeItem("authToken");
        sessionStorage.removeItem("user");

        // Dispatch logout action
        dispatch(logout());
      },
    }),
  }),
});

// Export hooks for use in components
export const {
  useLoginMutation,
  useRegisterUserMutation,
  useVerifyEmailMutation,
  useResendOtpMutation,
  useRefreshTokenMutation,
  useLogoutMutation,
} = authApi;
