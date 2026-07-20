import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { AxiosError } from "axios";

import API from "../../services/api";

export type TransactionType = "all" | "income" | "expense";

export type Transaction = {
  id: number | string;
  title?: string;
  category?: string;
  type?: Exclude<TransactionType, "all"> | string;
  completed?: boolean;
  [key: string]: unknown;
};

type TransactionSummary = Record<string, unknown>;

type TransactionPayload = Omit<Transaction, "id">;

type UpdateTransactionPayload = {
  id: Transaction["id"];
  updatedData: Partial<Transaction>;
};

type TransactionsState = {
  transactions: Transaction[];
  summary: TransactionSummary;
  loading: boolean;
  error: string | null;
  filteredTransactions: Transaction[];
  searchTerm: string;
  selectedType: TransactionType;
  selectedCategory: string;
};

const getErrorMessage = (error: unknown) => {
  const axiosError = error as AxiosError<{ message?: string }>;

  return axiosError.response?.data?.message ?? "Something went wrong";
};

const initialState: TransactionsState = {
  transactions: [],
  summary: {},
  loading: false,
  error: null,
  filteredTransactions: [],
  searchTerm: "",
  selectedType: "all",
  selectedCategory: "all",
};

const applyTransactionFilters = (state: TransactionsState) => {
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
export const getTransactions = createAsyncThunk<Transaction[], void>(
  "transactions/getAll",
  async (_, thunkAPI) => {
    try {
      const response = await API.get("/transactions");

      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  },
);

// ADD TRANSACTION
export const addTransaction = createAsyncThunk<Transaction, TransactionPayload>(
  "transactions/add",
  async (transactionData: TransactionPayload, thunkAPI) => {
    try {
      const response = await API.post("/transactions", transactionData);

      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  },
);

// UPDATE TRANSACTION
export const updateTransaction = createAsyncThunk<Transaction, UpdateTransactionPayload>(
  "transactions/update",
  async ({ id, updatedData }: UpdateTransactionPayload, thunkAPI) => {
    try {
      const response = await API.put(`/transactions/${id}`, updatedData);

      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  },
);

// DELETE TRANSACTION
export const deleteTransaction = createAsyncThunk<Transaction["id"], Transaction["id"]>(
  "transactions/delete",
  async (id: Transaction["id"], thunkAPI) => {
    try {
      await API.delete(`/transactions/${id}`);

      return id;
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  },
);

// GET SUMMARY
export const getSummary = createAsyncThunk<TransactionSummary, void>(
  "transactions/summary",
  async (_, thunkAPI) => {
    try {
      const response = await API.get("/transactions/summary");

      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
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
        state.error = String(action.payload);
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
