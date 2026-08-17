import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { userOtpsApi } from '../../api/modules/userOtps';

// ── Async thunks ──────────────────────────────────────────────────────────────

export const fetchUserOtps = createAsyncThunk(
    'userOtps/fetchAll',
    async (params, { rejectWithValue }) => {
        try {
            const res = await userOtpsApi.getAll(params);
            if (res.success) return { data: res.data ?? [], meta: res.meta ?? {} };
            return rejectWithValue(res.message || 'Failed to load OTPs');
        } catch (err) {
            return rejectWithValue(err?.response?.data?.message || err?.message || 'Failed to load OTPs');
        }
    }
);

export const fetchUserOtpDetail = createAsyncThunk(
    'userOtps/fetchDetail',
    async (id, { rejectWithValue }) => {
        try {
            const res = await userOtpsApi.getById(id);
            if (res.success) return res.data ?? null;
            return rejectWithValue(res.message || 'Failed to load OTP detail');
        } catch (err) {
            return rejectWithValue(err?.response?.data?.message || err?.message || 'Failed to load OTP detail');
        }
    }
);

// ── Slice ─────────────────────────────────────────────────────────────────────

const userOtpsSlice = createSlice({
    name: 'userOtps',
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
        clearDetail(state) { state.detail = null; state.detailError = null; },
    },
    extraReducers: (builder) => {
        // List
        builder
            .addCase(fetchUserOtps.pending, (state) => { state.listLoading = true; state.listError = null; })
            .addCase(fetchUserOtps.fulfilled, (state, action) => {
                state.listLoading = false;
                state.list = action.payload.data;
                state.meta = action.payload.meta;
            })
            .addCase(fetchUserOtps.rejected, (state, action) => { state.listLoading = false; state.listError = action.payload; });

        // Detail
        builder
            .addCase(fetchUserOtpDetail.pending, (state) => { state.detailLoading = true; state.detailError = null; })
            .addCase(fetchUserOtpDetail.fulfilled, (state, action) => { state.detailLoading = false; state.detail = action.payload; })
            .addCase(fetchUserOtpDetail.rejected, (state, action) => { state.detailLoading = false; state.detailError = action.payload; });
    },
});

export const { clearDetail } = userOtpsSlice.actions;

// ── Selectors ──────────────────────────────────────────────────────────────────
export const selectUserOtpsList         = (state) => state.userOtps.list;
export const selectUserOtpsMeta         = (state) => state.userOtps.meta;
export const selectUserOtpsLoading      = (state) => state.userOtps.listLoading;
export const selectUserOtpDetail        = (state) => state.userOtps.detail;
export const selectUserOtpDetailLoading = (state) => state.userOtps.detailLoading;

export default userOtpsSlice.reducer;
