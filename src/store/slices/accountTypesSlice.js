import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { accountTypesApi } from '../../api/modules/accountTypes';

// ── Async thunk ───────────────────────────────────────────────────────────────
export const fetchAccountTypes = createAsyncThunk(
    'accountTypes/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            const res = await accountTypesApi.getAll({ isActive: true, limit: 100 });
            if (res.success) return res.data ?? [];
            return rejectWithValue(res.message || 'Failed to load account types');
        } catch (error) {
            return rejectWithValue(
                error?.response?.data?.message || error?.message || 'Failed to load account types'
            );
        }
    }
);

// ── Slice ─────────────────────────────────────────────────────────────────────
const accountTypesSlice = createSlice({
    name: 'accountTypes',
    initialState: {
        data: [],
        loading: false,
        error: null,
    },
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchAccountTypes.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAccountTypes.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload;
            })
            .addCase(fetchAccountTypes.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { clearError } = accountTypesSlice.actions;

// ── Selectors ─────────────────────────────────────────────────────────────────
export const selectAccountTypes = (state) => state.accountTypes.data;
export const selectAccountTypesLoading = (state) => state.accountTypes.loading;
export const selectAccountTypesError = (state) => state.accountTypes.error;
export const selectAccountTypeTabs = (state) => [
    { key: 'all', label: 'All Users' },
    ...state.accountTypes.data.map((t) => ({ key: t._id, label: t.name })),
];

export default accountTypesSlice.reducer;
