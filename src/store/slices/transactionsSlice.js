import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { transactionsApi } from "../../api/modules/transactions";

// ── Async thunks ──────────────────────────────────────────────────────────────

export const fetchTransactions = createAsyncThunk(
  "transactions/fetchAll",
  async (params, { rejectWithValue }) => {
    try {
      const res = await transactionsApi.getAll(params);
      if (res.success) {
        return { data: res.data ?? [], meta: res.meta ?? {} };
      }
      return rejectWithValue(res.message || "Failed to load transactions");
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to load transactions",
      );
    }
  },
);

export const fetchTransactionDetail = createAsyncThunk(
  "transactions/fetchDetail",
  async (id, { rejectWithValue }) => {
    try {
      const res = await transactionsApi.getById(id);
      if (res.success) return res.data ?? null;
      return rejectWithValue(
        res.message || "Failed to load transaction detail",
      );
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to load transaction detail",
      );
    }
  },
);

// ── Slice ─────────────────────────────────────────────────────────────────────

const transactionsSlice = createSlice({
  name: "transactions",
  initialState: {
    list: [],
    meta: {},
    listLoading: false,
    listError: null,

    detail: null,
    detailLoading: false,
    detailError: null,
  },
  reducers: {
    clearDetail(state) {
      state.detail = null;
      state.detailError = null;
    },
  },
  extraReducers: (builder) => {
    // ── List ──
    builder
      .addCase(fetchTransactions.pending, (state) => {
        state.listLoading = true;
        state.listError = null;
      })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.listLoading = false;
        state.list = action.payload.data;
        state.meta = action.payload.meta;
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.listLoading = false;
        state.listError = action.payload;
      });

    // ── Detail ──
    builder
      .addCase(fetchTransactionDetail.pending, (state) => {
        state.detailLoading = true;
        state.detailError = null;
      })
      .addCase(fetchTransactionDetail.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.detail = action.payload;
      })
      .addCase(fetchTransactionDetail.rejected, (state, action) => {
        state.detailLoading = false;
        state.detailError = action.payload;
      });
  },
});

export const { clearDetail } = transactionsSlice.actions;

// ── Selectors ──────────────────────────────────────────────────────────────────

export const selectTransactionsList = (state) => state.transactions.list;
export const selectTransactionsMeta = (state) => state.transactions.meta;
export const selectTransactionsCounts = (state) =>
  state.transactions.meta?.counts ?? null;
export const selectTransactionsLoading = (state) =>
  state.transactions.listLoading;
export const selectTransactionDetail = (state) => state.transactions.detail;
export const selectTransactionDetailLoading = (state) =>
  state.transactions.detailLoading;

export default transactionsSlice.reducer;
