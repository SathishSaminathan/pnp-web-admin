import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { noahCustodyWalletsApi } from '../../api/modules/noahCustodyWallets';

// ── Async thunks ──────────────────────────────────────────────────────────────

export const fetchNoahCustodyWallets = createAsyncThunk(
    'noahCustodyWallets/fetchAll',
    async (params, { rejectWithValue }) => {
        try {
            const res = await noahCustodyWalletsApi.getAll(params);
            if (res.success) {
                return { data: res.data ?? [], meta: res.meta ?? {} };
            }
            return rejectWithValue(res.message || 'Failed to load Noah custody wallets');
        } catch (error) {
            return rejectWithValue(
                error?.response?.data?.message || error?.message || 'Failed to load Noah custody wallets'
            );
        }
    }
);

export const fetchNoahCustodyWalletDetail = createAsyncThunk(
    'noahCustodyWallets/fetchDetail',
    async (id, { rejectWithValue }) => {
        try {
            const res = await noahCustodyWalletsApi.getById(id);
            if (res.success) return res.data ?? null;
            return rejectWithValue(res.message || 'Failed to load wallet detail');
        } catch (error) {
            return rejectWithValue(
                error?.response?.data?.message || error?.message || 'Failed to load wallet detail'
            );
        }
    }
);

// ── Slice ─────────────────────────────────────────────────────────────────────

const noahCustodyWalletsSlice = createSlice({
    name: 'noahCustodyWallets',
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
            .addCase(fetchNoahCustodyWallets.pending, (state) => {
                state.listLoading = true;
                state.listError = null;
            })
            .addCase(fetchNoahCustodyWallets.fulfilled, (state, action) => {
                state.listLoading = false;
                state.list = action.payload.data;
                state.meta = action.payload.meta;
            })
            .addCase(fetchNoahCustodyWallets.rejected, (state, action) => {
                state.listLoading = false;
                state.listError = action.payload;
            });

        // ── Detail ──
        builder
            .addCase(fetchNoahCustodyWalletDetail.pending, (state) => {
                state.detailLoading = true;
                state.detailError = null;
            })
            .addCase(fetchNoahCustodyWalletDetail.fulfilled, (state, action) => {
                state.detailLoading = false;
                state.detail = action.payload;
            })
            .addCase(fetchNoahCustodyWalletDetail.rejected, (state, action) => {
                state.detailLoading = false;
                state.detailError = action.payload;
            });
    },
});

export const { clearDetail } = noahCustodyWalletsSlice.actions;

// ── Selectors ─────────────────────────────────────────────────────────────────
export const selectNoahWalletsList         = (s) => s.noahCustodyWallets.list;
export const selectNoahWalletsMeta         = (s) => s.noahCustodyWallets.meta;
export const selectNoahWalletsLoading      = (s) => s.noahCustodyWallets.listLoading;
export const selectNoahWalletsError        = (s) => s.noahCustodyWallets.listError;

export const selectNoahWalletDetail        = (s) => s.noahCustodyWallets.detail;
export const selectNoahWalletDetailLoading = (s) => s.noahCustodyWallets.detailLoading;
export const selectNoahWalletDetailError   = (s) => s.noahCustodyWallets.detailError;

export default noahCustodyWalletsSlice.reducer;
