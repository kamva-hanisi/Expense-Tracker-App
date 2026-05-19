import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

import API from "../../services/api";

const initialState = {
  transactions: [],
  summary: {},
  loading: false,
  error: null,
};

// GET TRANSACTIONS
export const getTransactions = createAsyncThunk(
  "transactions/getAll",
  async (_, thunkAPI) => {
    try {
      const response = await API.get("/transactions");

      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data.message);
    }
  },
);

// ADD TRANSACTION
export const addTransaction = createAsyncThunk(
  "transactions/add",
  async (transactionData, thunkAPI) => {
    try {
      const response = await API.post("/transactions", transactionData);

      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data.message);
    }
  },
);

// DELETE TRANSACTION
export const deleteTransaction = createAsyncThunk(
  "transactions/delete",
  async (id, thunkAPI) => {
    try {
      await API.delete(`/transactions/${id}`);

      return id;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data.message);
    }
  },
);

// GET SUMMARY
export const getSummary = createAsyncThunk(
  "transactions/summary",
  async (_, thunkAPI) => {
    try {
      const response = await API.get("/transactions/summary");

      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data.message);
    }
  },
);

const transactionSlice = createSlice({
  name: "transactions",

  initialState,

  reducers: {},

  extraReducers: (builder) => {
    builder

      // GET
      .addCase(getTransactions.pending, (state) => {
        state.loading = true;
      })

      .addCase(getTransactions.fulfilled, (state, action) => {
        state.loading = false;
        state.transactions = action.payload;
      })

      .addCase(getTransactions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ADD
      .addCase(addTransaction.fulfilled, (state, action) => {
        state.transactions.unshift(action.payload);
      })

      // DELETE
      .addCase(deleteTransaction.fulfilled, (state, action) => {
        state.transactions = state.transactions.filter(
          (item) => item.id !== action.payload,
        );
      })

      // SUMMARY
      .addCase(getSummary.fulfilled, (state, action) => {
        state.summary = action.payload;
      });
  },
});

export default transactionSlice.reducer;
