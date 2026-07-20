import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { AxiosError } from "axios";

import API from "../../services/api";

type AuthUser = {
  token?: string;
  [key: string]: unknown;
};

type AuthCredentials = {
  email: string;
  password: string;
  name?: string;
};

type AuthState = {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
};

const getErrorMessage = (error: unknown) => {
  const axiosError = error as AxiosError<{ message?: string }>;

  return axiosError.response?.data?.message ?? "Something went wrong";
};

// Get user from localStorage
const storedUser = localStorage.getItem("user");
const user = storedUser ? JSON.parse(storedUser) as AuthUser : null;

const initialState: AuthState = {
  user: user || null,
  loading: false,
  error: null,
};

// REGISTER
export const registerUser = createAsyncThunk(
  "auth/register",
  async (userData: AuthCredentials, thunkAPI) => {
    try {
      const response = await API.post("/auth/register", userData);

      localStorage.setItem("user", JSON.stringify(response.data));

      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  },
);

// LOGIN
export const loginUser = createAsyncThunk(
  "auth/login",
  async (userData: AuthCredentials, thunkAPI) => {
    try {
      const response = await API.post("/auth/login", userData);

      localStorage.setItem("user", JSON.stringify(response.data));

      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  },
);

const authSlice = createSlice({
  name: "auth",
  initialState,

  reducers: {
    logout: (state) => {
      localStorage.removeItem("user");

      state.user = null;
    },
  },

  extraReducers: (builder) => {
    builder

      // REGISTER
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
      })

      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })

      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = String(action.payload);
      })

      // LOGIN
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
      })

      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })

      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = String(action.payload);
      });
  },
});

export const { logout } = authSlice.actions;

export default authSlice.reducer;
