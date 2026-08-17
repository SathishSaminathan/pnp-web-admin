import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { creditTransactionsApi } from "../../api/modules/creditTransactions";

// ── Async thunks ──────────────────────────────────────────────────────────────

export const fetchCreditTransactions = createAsyncThunk(
  "creditTransactions/fetchAll",
  async (params, { rejectWithValue }) => {
    try {
      const res = await creditTransactionsApi.getAll(params);
      if (res.success) {
        return { data: res.data ?? [], meta: res.meta ?? {} };
      }
      return rejectWithValue(
        res.message || "Failed to load credit transactions",
      );
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to load credit transactions",
      );
    }
  },
);

export const fetchCreditTransactionDetail = createAsyncThunk(
  "creditTransactions/fetchDetail",
  async (id, { rejectWithValue }) => {
    try {
      const res = await creditTransactionsApi.getById(id);
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

export const approveCreditTransaction = createAsyncThunk(
  "creditTransactions/approve",
  async ({ id, notes }, { rejectWithValue }) => {
    try {
      const res = await creditTransactionsApi.approve(id, notes);
      if (res.success) return res.data;
      return rejectWithValue(res.message || "Approval failed");
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || error?.message || "Approval failed",
      );
    }
  },
);

export const rejectCreditTransaction = createAsyncThunk(
  "creditTransactions/reject",
  async ({ id, reason }, { rejectWithValue }) => {
    try {
      const res = await creditTransactionsApi.reject(id, reason);
      if (res.success) return res.data;
      return rejectWithValue(res.message || "Rejection failed");
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || error?.message || "Rejection failed",
      );
    }
  },
);

// ── Slice ─────────────────────────────────────────────────────────────────────

const creditTransactionsSlice = createSlice({
  name: "creditTransactions",
  initialState: {
    list: [],
    meta: {},
    listLoading: false,
    listError: null,

    detail: null,
    detailLoading: false,
    detailError: null,

    actionLoading: false,
    actionError: null,
  },
  reducers: {
    clearDetail(state) {
      state.detail = null;
      state.detailError = null;
    },
    clearActionError(state) {
      state.actionError = null;
    },
    // Optimistically update a transaction's status in the list after approve/reject
    patchListItem(state, action) {
      const { id, changes } = action.payload;
      const idx = state.list.findIndex((t) => t._id === id);
      if (idx !== -1) state.list[idx] = { ...state.list[idx], ...changes };
      if (state.detail?._id === id) {
        state.detail = { ...state.detail, ...changes };
      }
    },
  },
  extraReducers: (builder) => {
    // ── List ──
    builder
      .addCase(fetchCreditTransactions.pending, (state) => {
        state.listLoading = true;
        state.listError = null;
      })
      .addCase(fetchCreditTransactions.fulfilled, (state, action) => {
        state.listLoading = false;
        state.list = action.payload.data;
        state.meta = action.payload.meta;
      })
      .addCase(fetchCreditTransactions.rejected, (state, action) => {
        state.listLoading = false;
        state.listError = action.payload;
      });

    // ── Detail ──
    builder
      .addCase(fetchCreditTransactionDetail.pending, (state) => {
        state.detailLoading = true;
        state.detailError = null;
      })
      .addCase(fetchCreditTransactionDetail.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.detail = action.payload;
      })
      .addCase(fetchCreditTransactionDetail.rejected, (state, action) => {
        state.detailLoading = false;
        state.detailError = action.payload;
      });

    // ── Approve / Reject ──
    const actionPending = (state) => {
      state.actionLoading = true;
      state.actionError = null;
    };
    const actionDone = (state) => {
      state.actionLoading = false;
    };
    const actionFailed = (state, action) => {
      state.actionLoading = false;
      state.actionError = action.payload;
    };

    builder
      .addCase(approveCreditTransaction.pending, actionPending)
      .addCase(approveCreditTransaction.fulfilled, actionDone)
      .addCase(approveCreditTransaction.rejected, actionFailed)
      .addCase(rejectCreditTransaction.pending, actionPending)
      .addCase(rejectCreditTransaction.fulfilled, actionDone)
      .addCase(rejectCreditTransaction.rejected, actionFailed);
  },
});

export const { clearDetail, clearActionError, patchListItem } =
  creditTransactionsSlice.actions;

// ── Selectors ─────────────────────────────────────────────────────────────────
export const selectCreditTransactionsList = (s) => s.creditTransactions.list;
export const selectCreditTransactionsMeta = (s) => s.creditTransactions.meta;
export const selectCreditTransactionsCounts = (s) =>
  s.creditTransactions.meta?.counts ?? null;
export const selectCreditTransactionsLoading = (s) =>
  s.creditTransactions.listLoading;
export const selectCreditTransactionsError = (s) =>
  s.creditTransactions.listError;

export const selectCreditTransactionDetail = (s) => s.creditTransactions.detail;
export const selectCreditTransactionDetailLoading = (s) =>
  s.creditTransactions.detailLoading;
export const selectCreditTransactionDetailError = (s) =>
  s.creditTransactions.detailError;

export const selectCreditTransactionActionLoading = (s) =>
  s.creditTransactions.actionLoading;
export const selectCreditTransactionActionError = (s) =>
  s.creditTransactions.actionError;

export default creditTransactionsSlice.reducer;
