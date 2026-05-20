import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

import API from "../../services/api";

const initialState = {
  transactions: [],
  summary: {},
  loading: false,
  error: null,
  filteredTransactions: [],
  searchTerm: "",
  selectedType: "all",
  selectedCategory: "all",
};

const applyTransactionFilters = (state) => {
  let filtered = [...state.transactions];

  if (state.searchTerm.trim()) {
    const search = state.searchTerm.toLowerCase();

    filtered = filtered.filter(
      (transaction) =>
        transaction.title?.toLowerCase().includes(search) ||
        transaction.category?.toLowerCase().includes(search),
    );
  }

  if (state.selectedType !== "all") {
    filtered = filtered.filter(
      (transaction) => transaction.type === state.selectedType,
    );
  }

  if (state.selectedCategory !== "all") {
    filtered = filtered.filter(
      (transaction) => transaction.category === state.selectedCategory,
    );
  }

  state.filteredTransactions = filtered;
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

// UPDATE TRANSACTION
export const updateTransaction = createAsyncThunk(
  "transactions/update",
  async ({ id, updatedData }, thunkAPI) => {
    try {
      const response = await API.put(`/transactions/${id}`, updatedData);

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

  reducers: {
    setSearchTerm: (state, action) => {
      state.searchTerm = action.payload;
    },

    setSelectedType: (state, action) => {
      state.selectedType = action.payload;
    },

    setSelectedCategory: (state, action) => {
      state.selectedCategory = action.payload;
    },

    toggleTransactionComplete: (state, action) => {
      state.transactions = state.transactions.map((transaction) =>
        transaction.id === action.payload
          ? { ...transaction, completed: !transaction.completed }
          : transaction,
      );

      applyTransactionFilters(state);
    },

    filterTransactions: (state) => {
      applyTransactionFilters(state);
    },
  },

  extraReducers: (builder) => {
    builder

      // GET
      .addCase(getTransactions.pending, (state) => {
        state.loading = true;
      })

      .addCase(getTransactions.fulfilled, (state, action) => {
        state.loading = false;

        state.transactions = action.payload.map((transaction) => ({
          ...transaction,
          completed: Boolean(transaction.completed),
        }));

        applyTransactionFilters(state);
      })

      .addCase(getTransactions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ADD
      .addCase(addTransaction.fulfilled, (state, action) => {
        state.transactions.unshift({
          ...action.payload,
          completed: false,
        });

        applyTransactionFilters(state);
      })

      // UPDATE
      .addCase(updateTransaction.fulfilled, (state, action) => {
        state.transactions = state.transactions.map((transaction) =>
          transaction.id === action.payload.id
            ? {
                ...action.payload,
                completed: Boolean(transaction.completed),
              }
            : transaction,
        );

        applyTransactionFilters(state);
      })

      // DELETE
      .addCase(deleteTransaction.fulfilled, (state, action) => {
        state.transactions = state.transactions.filter(
          (item) => item.id !== action.payload,
        );

        applyTransactionFilters(state);
      })

      // SUMMARY
      .addCase(getSummary.fulfilled, (state, action) => {
        state.summary = action.payload;
      });
  },
});

export const {
  setSearchTerm,
  setSelectedType,
  setSelectedCategory,
  toggleTransactionComplete,
  filterTransactions,
} = transactionSlice.actions;

export default transactionSlice.reducer;
